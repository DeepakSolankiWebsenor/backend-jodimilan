import { body } from 'express-validator';

export const loginValidator = [
  body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 20 }).withMessage('Password must be 8-20 characters'),
];

export const signupValidator = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 191 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isNumeric().isLength({ min: 10, max: 10 }).withMessage('Valid 10-digit phone required'),
  body('dialing_code').notEmpty().withMessage('Dialing code is required'),
  body('password').isLength({ min: 8, max: 20 }).withMessage('Password must be 8-20 characters'),
  body('password_confirmation').custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
  body('profile_by').notEmpty().withMessage('Profile by is required'),
  body('gender').isIn(['Male', 'Female']).withMessage('Valid gender is required'),
  body('mat_status').notEmpty().withMessage('Marital status is required'),
  body('religion').isInt().withMessage('Religion is required'),
  body('caste').isInt().withMessage('Caste is required'),
  body('dob').isDate().withMessage('Valid date of birth is required'),
];

export const otpValidator = [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP required'),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
];

export const changePasswordValidator = [
  body('old_password').notEmpty().withMessage('Old password is required'),
  body('new_password').isLength({ min: 8, max: 20 }).withMessage('New password must be 8-20 characters'),
  body('new_password_confirmation').custom((value, { req }) => value === req.body.new_password)
    .withMessage('Passwords do not match'),
];
