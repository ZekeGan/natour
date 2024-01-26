const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
exports.getAllReview = catchAsync(async (req, res) => {
  const filter = req.params.tourId ? { tour: req.params.tourId } : {};

  const reviews = await Review.find(filter);
  res.status(200).json({
    status: 'success',
    length: reviews.length,
    data: reviews,
  });
});

exports.getReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  res.status(201).json({
    status: 'success',
    data: review,
  });
});

exports.createReview = catchAsync(async (req, res) => {
  console.log(req.params);
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

exports.updateReview = catchAsync(async (req, res) => {
  const newReview = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: 'success',
    data: newReview,
  });
});

exports.deleteReview = factory.deleteOne(Review);
