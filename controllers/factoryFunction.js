const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/feautures');
const sendEmail = require('../utils/emailServices');
const Recipe = require('../models/recipeModels');
const NotificationClass = require('../utils/notification');

exports.getall = (model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.recipeId) filter = { recipe: req.params.recipeId };
    const docs = new ApiFeatures(model.find(filter), req.query)
      .filtering()
      .sorting()
      .limitFields()
      .pagination();

    const data = await docs.query;
    if (!data) {
      return next(new AppError('Internal server error', 500));
    }
    res.status(200).json({
      count: data.length,
      data,
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    if (model === Reviews) {
      if (!req.body.recipe) req.body.recipe = req.params.recipeId;
    }

    if (model === FavoriteRecipe) {
      if (!req.body.favoriteRecipe)
        req.body.favoriteRecipe = req.params.recipeId;
    }
    const data = await model.create(req.body);

    if (!data) {
      return next(new AppError('Data not posted', 400));
    }

    res.status(201).json({
      status: 'Success',
      data,
    });
  });

exports.getOneById = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = model.findById(req.params.id).populate(popOptions);
    const data = await query;

    if (!data) {
      return next(new AppError('Data Not found', 404));
    }

    res.status(200).json({
      status: 'Sucess',
      data,
    });
  });

exports.patchOne = (model) =>
  catchAsync(async (req, res, next) => {
    const data = await model.findByIdAndUpdate(req.params.recipeId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return next(new AppError('Data not found', 401));
    }

    res.status(200).json({
      status: 'Success',
      data,
    });
  });

exports.specifiMeal = (model) =>
  catchAsync(async (req, res, next) => {
    const { title } = req.query;
    if (!title) {
      return next(new AppError('Title query is required', 400));
    }

    const data = await model.find({ title: title });

    console.log('Searching for title:', title);
    if (!data || data.length === 0) {
      return next(new AppError('No Data Found', 404));
    }
    res.status(200).json({
      status: 'Success',
      data,
    });
  });

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    await model.findByIdAndDelete(req.params.id);

    if (model.findById(req.params.id)) {
      return next(new AppError('Unable to delete data', 401));
    }

    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });

exports.shareRecipe = (recipeModel, userModel) =>
  catchAsync(async (req, res, next) => {
    const { receiverId } = req.body;
    const user = req.user;
    const sharedRecipeId = req.params.id;
    const sharedRecipe = await recipeModel.findById(sharedRecipeId);
    const receiver = await userModel.findById(receiverId);

    //id of recipe creator to send notification to
    const sendNotificationTo = sharedRecipe.user;

    if (!sharedRecipe) {
      return next(new AppError('Document not found', 404));
    }
    if (!receiver) {
      return next(new AppError('User does not exist'));
    }
    if (user.id === receiver.id) {
      return next(new AppError('You can not share to yourself', 403));
    }
    const showRecipe = `${req.protocol}://${req.get(
      'host'
    )}/recipe-detail.html?id=${sharedRecipe._id}`;
    const message = `${user.name} shared a recipe with you 🍲click on the link to check it out ${showRecipe}`;
    await sendEmail({
      email: `${receiver.email}`,
      subject: 'Love to check out this recipe',
      message,
    });

    const notification = new NotificationClass(
      sendNotificationTo,
      user.id,
      'share',
      `${user.name} shared your recipe`,
      `/users/${user.id}`
    );
    await notification.send();

    // Notify the receiver they got a recipe (optional UX boost)
    const notifyReceiver = new NotificationClass(
      receiver.id,
      user.id,
      'recipe-share',
      `${user.name} shared a recipe with you. Check your email to see it`,
      `/recipe-detail.html?id=${sharedRecipe._id}`
    );
    await notifyReceiver.send();

    res.status(200).json({
      status: 'success',
      message: `Recipe shared with ${receiver.email}`,
    });
  });

exports.fetchUserRecipe = (model) =>
  catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    if (!userId) {
      return next(new AppError('User Id required', 403));
    }
    const user = await model.findById(userId);
    if (!user) {
      return next(new AppError('Unidentified User', 404));
    }
    const recipe = await Recipe.findOne({
      user: userId,
    });
    if (!recipe) {
      return next(new AppError('This user has not posted any recipe', 404));
    }

    res.status(200).json({
      status: 'success',
      recipe,
    });
  });

exports.followUser = (model) =>
  catchAsync(async (req, res, next) => {
    const currentUser = req.user;
    const targetedUser = await model.findById(req.params.id);

    if (!currentUser || !targetedUser) {
      return next(new AppError('User not found', 404));
    }
    if (currentUser.id === targetedUser.id) {
      return next(new AppError('You can not follow yourself', 403));
    }

    //follow
    if (!currentUser.following.includes(targetedUser.id)) {
      currentUser.following.push(targetedUser.id);
      targetedUser.followers.push(currentUser.id);

      await currentUser.save({ validateBeforeSave: false });
      await targetedUser.save({ validateBeforeSave: false });
    } else {
      // Unfollow
      currentUser.following.pull(targetedUser.id);
      targetedUser.followers.pull(currentUser.id);
      await currentUser.save({ validateBeforeSave: false });
      await targetedUser.save({ validateBeforeSave: false });

      return res.status(200).json({
        status: 'success',
        message: `You have unfollowed ${targetedUser.name}`,
      });
    }

    const notification = new NotificationClass(
      targetedUser.id,
      currentUser.id,
      'follow',
      `${currentUser.name} followed you`,
      `/users/${currentUser.id}`
    );
    await notification.send();

    res.status(200).json({
      status: 'success',
      message: `You are now following ${targetedUser.name}`,
    });
  });

exports.getNotification = (model) =>
  catchAsync(async (req, res, next) => {
    const notifications = await model
      .find({
        recipient: req.user.id,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      notifications,
    });
  });
