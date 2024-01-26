const express = require('express');
const reviewRouter = require('../routes/reviewRoute');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router.route('/stats').get(tourController.getTourStats);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.allowRole('admin', 'lead'),
    tourController.deleteTour
  );

module.exports = router;
