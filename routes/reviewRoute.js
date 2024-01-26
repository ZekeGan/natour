const express = require('express');

const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// /review or
// /tour/:tourId/review
router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.allowRole('admin', 'lead', 'guide'),
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
