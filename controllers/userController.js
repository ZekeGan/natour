const User = require('../models/userModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterBody = (body, filterArr) => {
  let newBody = {};
  for (let key in body) {
    if (filterArr.includes(key)) newBody[key] = body[key];
  }
  return newBody;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(201).json({
    status: 'success',
    length: users.length,
    data: users,
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppErrors(`user not found with given id ${req.params.id}`));
  }

  res.status(201).json({
    status: 'success',
    data: user,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
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

exports.inactiveUser = catchAsync(async (req, res) => {
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
