const APIFeature = require('../utils/apiFeature');
const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let query = Model.find();

    if (req.findOption) query = Model.find(req.findOption);

    const feature = new APIFeature(query, req.query)
      .filter()
      .sort()
      .limitField()
      .pagination();

    // const doc = await feature.model.explain();
    const doc = await feature.model;

    res.status(200).json({
      status: 'success',
      length: doc.length,
      data: doc,
    });
  });

exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateOption) query = query.populate(populateOption);
    const doc = await query;

    if (!doc)
      return next(new AppError('Document not found with given ID', 404));

    res.status(200).json({ status: 'success', data: doc });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ status: 'success', data: doc });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc)
      return next(new AppError('Document not found with given ID', 404));
    // Tour.updateOne({ _id: req.params.id }, { $set: req.body })
    res.status(201).json({ status: 'success', data: doc });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.findOneAndDelete(
      { _id: req.params.id },
      { includeResultMetadata: true }
    );
    if (!doc)
      return next(new AppErrors('Document not found with given ID', 404));
    res.status(201).json({ status: 'success', data: doc });
  });

exports.errorResponse = (message) => (req, res) => {
  res.status(500).json({
    status: 'error',
    message: message,
  });
};
