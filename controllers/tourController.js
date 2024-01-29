const Tour = require('../models/tourModel');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

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

// /tour-within/:distance/center/:latlng/unit/:unit
exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radiusMap = {
    km: distance / 6378.1,
    mi: distance / 3963.2,
  };
  const radius = radiusMap[unit];

  if (!lat || !lng) {
    return next(new AppErrors('Please provide valid latitude and longitude.'));
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(500).json({
    status: 'success',
    length: tours.length,
    data: tours,
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const unitMap = {
    km: 0.001,
    mi: 0.000621371,
  };

  if (!lat || !lng)
    return next(new AppErrors('Please provide valid latitude and longitude.'));

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: unitMap[unit],
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);

  console.log(distances);

  res.status(500).json({
    status: 'success',
    data: distances,
  });
});

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
