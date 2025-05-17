const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/feautures');
const sendEmail = require('../utils/emailServices');
const Recipe = require('../models/recipeModels');
const NotificationClass = require('../utils/notification');
const FavoriteRecipe = require('../models/favouriteRecipe');
const Reviews = require('../models/reviewModels');

//function for sending notifications
const sendNotification = async ({ recipient, sender, type, message, link }) => {
  const notification = new NotificationClass(
    recipient,
    sender,
    type,
    message,
    link
  );
  await notification.send();
};

//Get all handler
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

//Create Handler
exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    req.body.user = req.user.id;
    if (model === Reviews && !req.body.recipe) {
      req.body.recipe = req.params.id;
    }
    if (model === FavoriteRecipe && !req.body.favoriteRecipe) {
      req.body.favoriteRecipe = req.params.id;
    }
    const data = await model.create(req.body);
    if (!data) {
      return next(new AppError('Data not posted', 400));
    }
    if (model === Reviews) {
      const targetRecipe = await Recipe.findById(req.body.recipe);
      const targetedUserId = targetRecipe.user;

      await sendNotification({
        recipient: targetedUserId,
        sender: req.user.id,
        type: 'comment',
        message: `${req.user.name} commented on your recipe`,
        link: `/users/${req.user.id}`,
      });
    }

    res.status(201).json({
      status: 'success',
      // message:
      //   model === Reviews
      //     ? 'Comment added and user notified'
      //     : 'Data created successfully',
      data,
    });
  });

//Get one by Id
exports.getOneById = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const data = await query;

    if (!data) {
      return next(new AppError('Data Not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data,
    });
  });

//Update............
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
      status: 'success',
      data,
    });
  });

//Get specific meal
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
      status: 'success',
      data,
    });
  });

//Get data handler
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('Oops! we could not delete your data ', 401));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

//Share Recipe
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

    //notify the poster of the recipe

    await sendNotification({
      recipient: sendNotificationTo,
      sender: user.id,
      type: 'share',
      message: `${user.name} shared your recipe`,
      link: `/users/${user.id}`,
    });

    // Notify the receiver they got a recipe (optional UX boost)
    await sendNotification({
      recipient: receiver.id,
      sender: user.id,
      type: 'share',
      message: `${user.name} shared a recipe with you. Check your email to see it`,
      link: `/recipe-detail.html?id=${sharedRecipe._id}`,
    });

    res.status(200).json({
      status: 'success',
      message: `Recipe shared with ${receiver.email}`,
    });
  });

//Fetch specific user recipe
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
    const recipe = await Recipe.find({
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

//Follow handler
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

      await sendNotification({
        recipient: targetedUser.id,
        sender: currentUser.id,
        type: 'unfollow',
        message: `${currentUser.name} unfollowed you`,
        link: `/users/${currentUser.id}`,
      });

      return res.status(200).json({
        status: 'success',
        message: `You have unfollowed ${targetedUser.name}`,
      });
    }

    await sendNotification({
      recipient: targetedUser.id,
      sender: currentUser.id,
      type: 'follow',
      message: `${currentUser.name} followed you`,
      link: `/users/${currentUser.id}`,
    });
    res.status(200).json({
      status: 'success',
      message: `You are now following ${targetedUser.name}`,
    });
  });

//Notification handler
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
