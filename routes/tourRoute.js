const express = require('express');
const reviewRouter = require('../routes/reviewRoute');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use('/:tourId/review', reviewRouter);

router
  .route('/top-5-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.allowRole('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getTourWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// basic CRUD
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.allowRole('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.allowRole('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.allowRole('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
