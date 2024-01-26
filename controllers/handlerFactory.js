const AppErrors = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

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
