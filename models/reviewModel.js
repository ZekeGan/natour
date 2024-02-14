const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      // parent reference
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to one tour.'],
    },
    user: {
      // parent reference
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must have a user to write.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// prevent duplicate review in same user
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this
    // .populate({ path: 'tour', select: 'name' })
    .populate({
      path: 'user',
      select: 'name photo',
    });
  next();
});

/**
 * calculate the average rating everytime when create a new review
 * @param {*} tourId
 */
reviewSchema.statics.calsAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numberOfRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numberOfRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calsAverageRating(this.tour);
});

// findByIdAndUpdate & findByIdAndDelete
// findOneAnd is the shorthand of findByIdAnd
reviewSchema.pre(/^findOneAnd/, async function (next) {
  // In this case, we can store output inside the this
  // so, when .post() occur we can access output through this argument...
  this.temp = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  // and use static method.
  this.temp.constructor.calsAverageRating(this.temp.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
