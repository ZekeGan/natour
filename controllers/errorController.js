const AppErrors = require('../utils/appError');

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrProd = (err, res) => {
  // Operational error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Programming error
  console.error('ERROR: ', err);
  res.status(500).json({
    status: 'fail',
    message: 'something went wrong.',
  });
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppErrors(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const values = err.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `duplicated name ${values[0]}`;
  return new AppErrors(message, 400);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((err) => {
      return err.message;
    })
    .join('.  ');
  return new AppErrors(message, 400);
};

const handleInvalidJWTError = (err) => {
  return new AppErrors(`Invalid token: ${err.message}`, 401);
};

const handleJWTExpiredError = (err) => {
  return new AppErrors(`token has expired at ${err.expiredAt}`, 401);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'a error has occured';

  if (process.env.NODE_ENV === 'develop') {
    sendErrDev(err, res);
  }

  if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // handle mongoose error
    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);

    // handle jwt error
    if (err.name === 'JsonWebTokenError') error = handleInvalidJWTError(err);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err);

    sendErrProd(error, res);
  }
};
