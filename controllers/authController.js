const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/mail');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_TIME,
  });

const sendBackToClient = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 1000 * 60 * 60 * 24 // 天
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

  res.cookie('jwt', token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm, changedPasswordAt } =
    req.body;
  const newUser = await User.create({
    name,
    role,
    email,
    password,
    passwordConfirm,
    changedPasswordAt,
  });
  sendBackToClient(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;
  // 1) check if email or password is exist
  if (!password || !email) {
    return next(new AppError('Please provide email or password', 400));
  }

  // 2) check if email was exist
  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('user is not exist', 400));

  // 3) check if password was correct
  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect)
    return next(new AppError('password is not correct', 401));

  // 4) generate token
  // 5) send token back
  sendBackToClient(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) checking is authorization exist
  const bearer = req.headers.authorization;
  if (!bearer || !bearer.startsWith('Bearer')) {
    return next(new AppError('Please authorization', 400));
  }

  // 2) check is token exist
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('Please login.', 401));
  }

  // 3) check is user exist.
  // user may delete his account during the token does not expired yet.
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('user is not exist.', 401));
  }

  // 4) check does user changed his password.
  // user may changed his password during the token does not expired yet.
  const isPasswordChanged =
    await currentUser.isChangedPasswordBeforeTokenExpired(
      currentUser.changedPasswordAt,
      decoded.iat
    );
  if (isPasswordChanged) {
    return next(
      new AppError('Password changed recently, please login again.', 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.allowRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'you do not have permission to manipulate this operation.',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) check is user exist
  if (!req.body.email)
    return next(new AppError('Please provide email address', 401));
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('user email does not exist.', 404));
  }

  // 2) create password reset token
  const cryptoResetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) send the mail
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetPassword/${cryptoResetToken}`;
  const message = `Please click site below to reset your password.\n\n${resetUrl}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your app password',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'send email successfully.',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiredTime = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('sending email fail', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) encrypt the token that compare with user resetPasswordToken
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // 2) get the user through the hashedToken, and ckeck is time expired.
  // if token is correct, but time has expired, then you won't get user
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiredTime: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Invalid token or time has expired', 400));
  }

  // 3) change the password, and clear the reset arguments.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiredTime = undefined;
  user.changedPasswordAt = Date.now();
  await user.save();

  sendBackToClient(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. get user
  const user = await User.findById(req.user._id).select('+password');

  // 2. check is POSTed password correct
  const isPasswordSame = await user.correctPassword(
    req.body.password,
    user.password
  );
  if (!isPasswordSame) return next(new AppError('Password is incorrect', 401));

  // 3. update the password
  //! do not use any update in password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.changedPasswordAt = Date.now();
  await user.save();

  // 4. log user in, and send token
  sendBackToClient(user, 201, res);
});
