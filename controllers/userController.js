const User = require('../models/userModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const filterBody = (body, filterArr) => {
  let newBody = {};
  for (let key in body) {
    if (filterArr.includes(key)) newBody[key] = body[key];
  }
  return newBody;
};

exports.addCurrentUserIdIntoParams = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppErrors(
        'If you want to change password, please use route /updatePassword'
      )
    );

  const filteredBody = filterBody(req.body, ['name', 'email']);
  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: user,
  });
});
exports.inactiveMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = factory.errorResponse(
  'This route is undefined. If you want to create a new user, please use /signup.'
);
exports.updateUser = factory.updateOne(User); // Do NOT update password with this route
exports.deleteUser = factory.deleteOne(User);
