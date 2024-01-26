const Tour = require('../models/tourModel');
const APIFeature = require('../utils/apiFeature');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res) => {
  const feature = new APIFeature(Tour.find(), req.query)
    .filter()
    .sort()
    .limitField()
    .pagination();

  const resultTours = await feature.model;

  // response
  res.status(200).json({
    status: 'success',
    length: resultTours.length,
    data: resultTours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews');
  // Tour.find({ _id: req.params.id })

  if (!tour) return next(new AppError('tour not found with given ID', 404));

  res.status(200).json({ status: 'success', data: tour });
});

exports.createTour = catchAsync(async (req, res) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: newTour });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) return next(new AppError('tour not found with given ID', 404));

  // Tour.updateOne({ _id: req.params.id }, { $set: req.body })
  res.status(201).json({ status: 'success', data: tour });
});

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res) => {
//   const tour = await Tour.findOneAndDelete(
//     { _id: req.params.id },
//     { includeResultMetadata: true }
//   );

//   if (!tour) return next(new AppError('tour not found with given ID', 404));

//   res.status(201).json({ status: 'success', data: tour });
// });

exports.getTourStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    // 會根據順序執行查詢
    // 查找共x筆資料
    { $match: { ratingsAverage: { $gte: 4.5 } } },

    // 對這x筆資料進行計算
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // 用 <string> 進行分類
        numTours: { $sum: 1 }, // 資料總筆數
        numRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        miaxPrice: { $max: '$price' },
      },
    },
    { $sort: { numRating: -1 } }, // 排序
    // { $match: { _id: { $ne: 'EASY' } } }, // $ne = not equal
  ]);
  res.status(201).json({ status: 'success', data: stats });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    /** 如果某field 資料如下
     * {
     *    item : "ABC",
     *    sizes: [ "S", "M", "L"]
     * }
     * 使用 $unwind: '$size' 結果如下
     * [
     *  { item: "ABC", sizes: "S" }
     *  { item: "ABC", sizes: "M" }
     *  { item: "ABC", sizes: "L" }
     * ]
     */
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}/01/01`),
          $lte: new Date(`${year}/12/31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTour: { $sum: 1 },
        tour: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } }, // 新增 field -- month
    { $project: { _id: 0 } }, // 除掉 id
    { $sort: { numTour: -1 } },
    { $limit: 3 }, // 回傳 x 筆資料
  ]);
  res.status(201).json({ status: 'success', data: plan });
});
