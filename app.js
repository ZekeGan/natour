const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');
const reviewRouter = require('./routes/reviewRoute');
const errorController = require('./controllers/errorController');
const globalErrorHandler = require('./utils/appError');

const app = express();

// * set view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// * static file
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARE
// set security HTTP header
app.use(helmet());

// develop debugger
if (process.env.NODE_ENV === 'develop') {
  app.use(morgan('dev'));
}

// limit requests from same IP
const limiter = rateLimit({
  max: 100, // max request time in certain time
  windowMs: 1000 * 60 * 30, // 30m
  message: 'too many request. Please try again in 30 minutes.',
});
app.use('/api', limiter);

// body parser, parse the body if it was JSON.
app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
// ! xss-clean has been deprecated

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'price', 'difficulty'],
  })
);

// * router
// response the site
app.get('/', (req, res) => {
  res.status(200).render('base');
});

app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);

// error handler
app.all('*', (req, res, next) => {
  next(new globalErrorHandler(`route ${req.originalUrl} not found`, 404));
});

app.use(errorController);

module.exports = app;
