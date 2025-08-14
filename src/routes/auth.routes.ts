import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
} from '@/controllers/auth.controller';
import { validate } from '@/middlewares/validator';
import { AUTH_ROUTES } from '@/constants';
import { extractTokensFromCookies } from '@/middlewares/cookieAuth';

const router = Router();

// Validation chains
const validateRegister = [
  body('username')
    .notEmpty()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-50 characters, alphanumeric and underscore only'),
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .isLength({ min: 6, max: 255 })
    .withMessage('Password must be at least 6 characters'),
  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),
];

const validateVerifyOTP = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
  body('otp')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 6 digits'),
];

const validateResendOTP = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
];

const validateLogin = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateForgotPassword = [
  body('email')
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .notEmpty()
    .isLength({ min: 6, max: 255 })
    .withMessage('New password must be at least 6 characters'),
];

const validateRefreshToken = [
  body('refreshToken')
    .optional() // Make it optional since it can come from cookies
    .notEmpty()
    .withMessage('Refresh token is required'),
];

// POST /api/v1/auth/register - Register new user
router.post(
  AUTH_ROUTES.REGISTER,
  validate(validateRegister),
  register
);

// POST /api/v1/auth/verify-otp - Verify OTP and activate account
router.post(
  AUTH_ROUTES.VERIFY_OTP,
  validate(validateVerifyOTP),
  verifyOTP
);

// POST /api/v1/auth/resend-otp - Resend OTP
router.post(
  AUTH_ROUTES.RESEND_OTP,
  validate(validateResendOTP),
  resendOTP
);

// POST /api/v1/auth/login - Login user
router.post(
  AUTH_ROUTES.LOGIN,
  validate(validateLogin),
  login
);

// POST /api/v1/auth/logout - Logout user
router.post(
  AUTH_ROUTES.LOGOUT,
  logout
);

// POST /api/v1/auth/refresh-token - Refresh access token
router.post(
  AUTH_ROUTES.REFRESH_TOKEN,
  extractTokensFromCookies, // Extract tokens from cookies
  validate(validateRefreshToken),
  refreshToken
);

// POST /api/v1/auth/forgot-password - Forgot password
router.post(
  AUTH_ROUTES.FORGOT_PASSWORD,
  validate(validateForgotPassword),
  forgotPassword
);

// POST /api/v1/auth/reset-password - Reset password
router.post(
  AUTH_ROUTES.RESET_PASSWORD,
  validate(validateResetPassword),
  resetPassword
);

export default router; 