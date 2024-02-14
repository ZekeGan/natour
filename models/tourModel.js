const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a tour name must have less or equal than 40 charactors'],
      minlength: [10, 'a tour name must have more or equal than 10 charactors'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a maxGroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a diffuculty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty value is not easy, medium or difficlt',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      max: [5, 'ratingsAverage must be below 5'],
      min: [0, 'ratings Average must be above 0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          // this validator only work in creating new document, not work in update.
          return value < this.price;
        },
        message: 'a price discount {VALUE} must be below the price value',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      // required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      // required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // geoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      description: String,
      coordinates: [Number],
      address: String,
    },
    locations: [
      {
        // geoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // child reference
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// indexes
tourSchema.index({ price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// Virtual Populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// 0) compute data after get the data from DB
tourSchema.virtual('durationCalcs').get(function () {
  return this.duration / 2;
});

// 1) DOCUMENT MIDDLEWARE: run only in .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// 2) QUERY MIDDLEWARE: run only in .find() relatively functions
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate('guides');
  next();
});

// 3) AGGREGATE MIDDLEWARE: run only in aggregate()
tourSchema.pre('aggregate', function (next) {
  // this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
