import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { authenticate } from '../middlewares/auth';
import { validate, handleValidationErrors } from '../middlewares/validation';
import {
  loginValidator,
  signupValidator,
  otpValidator,
  forgotPasswordValidator,
  changePasswordValidator,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/login', validate(loginValidator), handleValidationErrors, AuthController.login);
router.post('/otp/login', AuthController.loginWithOtp);
router.post('/signup', validate(signupValidator), handleValidationErrors, AuthController.signup);
router.post('/create/otp', AuthController.createOtp);
router.post('/resend/otp', AuthController.resendOtp);
router.post('/forgot-password', validate(forgotPasswordValidator), handleValidationErrors, AuthController.forgotPassword);
router.get('/userMailVerified/:id', AuthController.verifyEmail);

// Authenticated routes
router.use(authenticate);
router.post('/verify-phone', validate(otpValidator), handleValidationErrors, AuthController.verifyPhone);
router.post('/logout', AuthController.logout);
router.get('/user', AuthController.getUser);
router.post('/change-password', validate(changePasswordValidator), handleValidationErrors, AuthController.changePassword);
router.post('/updateProfile', AuthController.updateProfile);
router.post('/profileFieldUpdate', AuthController.updateProfileField);
router.post('/verifyOtp', validate(otpValidator), handleValidationErrors, AuthController.verifyOtp);

export default router;
