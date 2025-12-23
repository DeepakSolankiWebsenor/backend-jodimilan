import { Response } from 'express';
import { AuthRequest,VerifyEmailOtpRequest,ResendOtpRequest, } from '../../types';
import { AuthService } from '../../services/auth.service';
import { ResponseHelper } from '../../utils/response';
import { EncryptionService } from '../../utils/encryption';
import { asyncHandler } from '../../middlewares/errorHandler';
import { User } from '../../models';
import { initDatabase } from '../../utils/initDatabase';

export class AuthController {
  /**
   * POST /api/auth/signup - Register new user
   */
static signup = asyncHandler(async (req: AuthRequest, res: Response) => {

  console.log("🔥 Signup request body =>", req.body);

  const result = await AuthService.signup(req.body);

  return ResponseHelper.success(
    res,
    result.message,
    {
      user_id: result.userId,   // FIXED ✔️
      email: result.email,      // Always use backend value ✔️
    },
    201
  );
});



  /**
   * POST /api/auth/login - Login with email/phone/ryt_id and password
   */
 static login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, phone, ryt_id, password, dialing_code } = req.body;
  const identifier = email || phone || ryt_id;

  if (!identifier) {
    return res.status(400).json({
      code: 400,
      success: false,
      message: "Email, phone, or RYT ID is required",
    });
  }

  const result = await AuthService.login(identifier, password, dialing_code);
  
  // If login successful, get full user data
  if (result.code === 200 && (result.data as any)?.user_id) {
    const userId = (result.data as any).user_id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otp', 'user_password'] },
    });
    
    if (user) {
      // Add full user data to response (overwrite encrypted string)
      (result.data as any).user = user.toJSON();

      // Send Login Notification
      const { NotificationService } = await import('../../services/notification.service');
      await NotificationService.createNotification(
        userId, 
        'system_alert', 
        { 
          topic: 'Login Alert', 
          message: `You logged in at ${new Date().toLocaleString()}`,
          name: 'System' 
        },
        'System',
        0
      );
    }
  }

  return res.status(result.code).json(result);
});


  /**
   * POST /api/auth/otp/login - Login with OTP
   */
  static loginWithOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, dialing_code, otp } = req.body;
    const result = await AuthService.loginWithOtp(phone, dialing_code, otp);

    const encryptedUser = EncryptionService.encrypt(result.user.toJSON());

    return ResponseHelper.success(res, 'Successfully logged in', {
      user: encryptedUser,
      access_token: result.token,
      token_type: 'Bearer',
      expires_at: result.expiresAt,
    });
  });

  /**
   * POST /api/auth/create/otp - Generate OTP
   */
  static createOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, dialing_code } = req.body;
    const otp = await AuthService.resendOtp(phone, dialing_code);

    return ResponseHelper.success(res, 'OTP sent successfully', { otp });
  });

  /**
   * POST /api/auth/resend/otp - Resend OTP
   */
  static resendOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, dialing_code } = req.body;
    const otp = await AuthService.resendOtp(phone, dialing_code);

    return ResponseHelper.success(res, 'OTP resent successfully', { otp });
  });

  /**
   * POST /api/auth/verify-phone - Verify phone with OTP (authenticated)
   */
  /**
   * POST /api/auth/verify-phone - Verify phone with OTP (authenticated)
   */
  static verifyPhone = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { otp } = req.body;
    await AuthService.verifyPhone(req.userId!, otp);

    return ResponseHelper.success(res, 'Phone verified successfully');
  });

  /**
   * POST /api/auth/verify-otp-public - Verify phone with OTP (Public)
   */
  static verifyOtpPublic = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { phone, otp, dialing_code } = req.body;
    const result = await AuthService.verifyPhonePublic(phone, dialing_code, otp);

    return ResponseHelper.success(res, 'Phone verified successfully', result);
  });

  /**
   * POST /api/auth/forgot-password - Forgot password
   */
  static forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;
    await AuthService.forgotPassword(email);

    return ResponseHelper.success(res, 'New password sent to your email');
  });

  /**
   * POST /api/auth/change-password - Change password (authenticated)
   */
static changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { current_password, new_password } = req.body;

  console.log("🔐 Change Password Request =>", req.body);

  if (!current_password || !new_password) {
    return ResponseHelper.error(res, "Old and new password are required", 400);
  }

  try {
    await AuthService.changePassword(req.userId!, current_password, new_password);

    // Send Change Password Notification
    const { NotificationService } = await import('../../services/notification.service');
    await NotificationService.createNotification(
      req.userId!, 
      'system_alert', 
      { 
        topic: 'Password Changed', 
        message: `Your password was changed on ${new Date().toLocaleString()}`,
        name: 'System' 
      }
    );

    return ResponseHelper.success(res, "Password changed successfully");
  } catch (error: any) {
    return ResponseHelper.error(res, error.message, 400);
  }
});



  /**
   * POST /api/auth/logout - Logout (authenticated)
   */
  static logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    // In JWT, we don't need to do anything server-side
    // Client should remove the token

    // Optionally fetch user ID if we want to log logout, but req.userId should constitute enough
    if (req.userId) {
       const { NotificationService } = await import('../../services/notification.service');
       await NotificationService.createNotification(
        req.userId, 
        'system_alert', 
        { 
          topic: 'Logout Alert', 
          message: `You were logged out at ${new Date().toLocaleString()}`,
          name: 'System' 
        }
       );
    }

    return ResponseHelper.success(res, 'Logged out successfully');
  });

  /**
   * GET /api/auth/user - Get authenticated user
   */
  static getUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(req.userId!, {
      attributes: { exclude: ['password', 'otp', 'user_password'] },
      include: ['profile', 'countryRelation', 'stateRelation', 'religionRelation', 'casteRelation'],
    });

    const encryptedUser = EncryptionService.encrypt(user?.toJSON());

    return ResponseHelper.success(res, 'User retrieved successfully', {
      user: encryptedUser,
    });
  });

  /**
   * GET /api/auth/userMailVerified/:id - Email verification callback
   */
static verifyEmail = asyncHandler(async (
  req: VerifyEmailOtpRequest, // 👈 Use the custom request type
  res: Response
) => {
  const { email, otp } = req.body;

  console.log("🔥 Email Verification Request =>", req.body);

  if (!email || !otp) {
    return ResponseHelper.error(res, "Email and OTP are required", 400);
  }

  const result = await AuthService.verifyEmailOtp(email, otp);

  return ResponseHelper.success(
    res,
    "Email verified successfully",
    result,
    200
  );
});



static resendEmailOtp = asyncHandler(async (
  req: ResendOtpRequest,
  res: Response
) => {
  const { email } = req.body;

  console.log("🔁 Resend OTP request =>", req.body);

  const result = await AuthService.resendEmailOtp(email);

  return ResponseHelper.success(
    res,
    "OTP resent successfully",
    result,
    200
  );
});




  /**
   * POST /api/auth/updateProfile - Update user profile (authenticated)
   */
  static updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return ResponseHelper.notFound(res, 'User not found');
    }

    await user.update(req.body);

    return ResponseHelper.success(res, 'Profile updated successfully');
  });

  /**
   * POST /api/auth/profileFieldUpdate - Update phone/email (authenticated)
   */
  static updateProfileField = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await User.findByPk(req.userId!);
    if (!user) {
      return ResponseHelper.notFound(res, 'User not found');
    }

    const { phone, email, dialing_code } = req.body;

    if (phone && dialing_code) {
      user.phone = phone;
      user.dialing_code = dialing_code;
      user.is_phone_verified = false;
    }

    if (email) {
      user.email = email;
      user.email_verified_at = undefined;
    }

    await user.save();

    // Generate OTP for verification
    const otp = await AuthService.createOtp(user.id);

    return ResponseHelper.success(res, 'Please verify OTP', { otp });
  });

  /**
   * POST /api/auth/verifyOtp - Verify OTP for profile update (authenticated)
   */
  static verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { otp } = req.body;
    await AuthService.verifyPhone(req.userId!, otp);

    const { NotificationService } = await import('../../services/notification.service');
    await NotificationService.createNotification(
      req.userId!, 
      'system_alert', 
      { 
        topic: 'Profile Updated', 
        message: `Your mobile/email was updated successfully on ${new Date().toLocaleString()}`,
        name: 'System' 
      }
    );

    return ResponseHelper.success(res, 'Verified successfully');
  });
}
