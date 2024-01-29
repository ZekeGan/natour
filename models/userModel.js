const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email '],
  },
  photo: String,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 5,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      // this only work on .create() or .save()
      validator: function (value) {
        return this.password === value;
      },
      message: 'password are not same.',
    },
  },
  changedPasswordAt: Date,
  resetPasswordToken: String,
  resetPasswordExpiredTime: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // encrypt password
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre(/^find/, function (next) {
  next();
});

// instance method of the schema, it can use when one instance was establish.
// Example:
// const user = new User()
// user.correctPassword()
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isChangedPasswordBeforeTokenExpired = async function (
  changedTime,
  JWTiat
) {
  if (this.changedPasswordAt) {
    changedTime = changedTime.getTime() / 1000;
    console.log(changedTime, JWTiat);
    return changedTime > JWTiat;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // 儲存加密後的 token
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // 到期時間設定 10 分鐘
  this.resetPasswordExpiredTime = Date.now() + 1000 * 60 * 10;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
