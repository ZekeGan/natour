const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// user control
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// * user must login to allow using routes beneath
router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.get(
  '/getMe',
  userController.addCurrentUserIdIntoParams,
  userController.getUser
);
router.patch('/updateMe', userController.updateMe);
router.delete('/inactiveMe', userController.inactiveMe);

// basic CRUD
// * user must be administrators who allow to use route beneath
router.use(authController.allowRole('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
