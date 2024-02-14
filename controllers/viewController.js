const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'Exciting tours for adventurous people',
  });
});

exports.getTourDetail = catchAsync(async (req, res, next) => {
  const tour = await Tour.find(req.params).populate({
    path: 'reviews',
    field: 'review rating user',
  });

  if (tour.length === 0) {
    return next(new AppErrors('There is no tour with that name.', 404));
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', { tour: tour[0], title: tour[0].name });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render('login');
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).render('account');
});

exports.updateUserData = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
  });
});
