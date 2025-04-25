const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { auth, checkRole } = require('../middleware/auth');
const { registerValidation, loginValidation, resetPasswordValidation } = require('../middleware/validators');
const activityLogger = require('../middleware/activityLogger');

// Trasy publiczne
router.post('/register', registerValidation, activityLogger('REGISTER'), userController.register);
router.post('/login', loginValidation, activityLogger('LOGIN'), userController.login);

// Weryfikacja email
router.get('/verify-email/:token', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerificationEmail);

// Resetowanie hasła
router.post('/forgot-password', activityLogger('PASSWORD_RESET_REQUEST'), userController.forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, activityLogger('PASSWORD_RESET'), userController.resetPassword);

// Trasy chronione - wymaga uwierzytelnienia
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, activityLogger('PROFILE_UPDATE'), userController.updateProfile);

// Trasy tylko dla admina
router.get('/all', auth, checkRole(['Admin']), userController.getAllUsers);
router.put('/role', auth, checkRole(['Admin']), activityLogger('ROLE_CHANGE'), userController.changeUserRole);

module.exports = router;