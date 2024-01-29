const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// /review or
// /tour/:tourId/review
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.checkIsFromTour, reviewController.getAllReview)
  .post(reviewController.setTourAndUserId, reviewController.createReview);
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.allowRole('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.allowRole('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
