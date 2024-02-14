const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/userModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) return cb(null, true);
  return cb(new AppErrors('Please upload image file.', 400), false);
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // resize photo with sharp
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

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
        'If you want to change password, please use route /updatePassword',
        400
      )
    );

  const filteredBody = filterBody(req.body, ['name', 'email']);
  if (req.file) filteredBody.photo = req.file.filename;

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
