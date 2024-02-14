const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isLogin);

router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTourDetail);
router.get('/login', viewController.getLogin);
router.get('/me', authController.protect, viewController.getMe);

router.post(
  '/submitUserData',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
