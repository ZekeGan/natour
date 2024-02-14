const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const viewRouter = require('./routes/viewRoute');
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
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
);

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

// parser
app.use(express.json({ limit: '10kb' })); // parse the body if it was JSON.
app.use(express.urlencoded({ limit: '10kb', extends: true }));
app.use(cookieParser()); // parse the cookie if it had

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// cors
app.use(cors());

// data sanitization against XSS
// ! xss-clean has been deprecated

// prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'price', 'difficulty'],
  })
);

// test
app.use((req, res, next) => {
  // console.log(req.cookies);
  next();
});

// * router
app.use('/', viewRouter);
app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/review', reviewRouter);

// * error handler
app.all('*', (req, res, next) => {
  next(new globalErrorHandler(`route ${req.originalUrl} not found`, 404));
});

app.use(errorController);

module.exports = app;
