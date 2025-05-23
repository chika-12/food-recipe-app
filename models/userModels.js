const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Recipe = require('./recipeModels');
//const { followers } = require('../controllers/userControllers');
require('./favouriteRecipe');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Input your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email Required'],
      trim: true,
      unique: true,
    },
    roles: {
      type: String,
      enum: ['user', 'admin', 'dev'],
      default: 'user',
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'password must be at leat 8 characters'],
      maxlength: [278, 'password should not be greater than 278 characters'],
      select: false,
    },
    confirmPassword: {
      type: String,
      required: [true, 'confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Password do not match',
      },
    },
    followers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'RecipeUser',
      },
    ],
    following: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'RecipeUser',
      },
    ],
    avataUrl: {
      type: String,
    },
    bio: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
});

userSchema.methods.correctPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// userSchema.pre(/^find/, function (next) {
//   this.populate({ path: 'followers', select: 'name avataUrl' }).populate({
//     path: 'following',
//     select: 'name avataUrl',
//   });
//   next();
// });

userSchema.methods.passwordChanged = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(this.passwordChangedAt, JWTTimesstamp);
    return JWTTimesstamp < changeTimeStamp;
  }
  return false;
};

userSchema.methods.createPasswordToken = async function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.virtual('favorite', {
  ref: 'FavoriteRecipe',
  foreignField: 'user',
  localField: '_id',
  justOne: false,
});

const RecipeUser = mongoose.model('RecipeUser', userSchema);
module.exports = RecipeUser;
