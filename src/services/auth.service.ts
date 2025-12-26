import bcrypt from 'bcryptjs';
import { User, UserProfile } from '../models';
import { JwtService } from '../utils/jwt';
import { OtpService } from '../utils/otp';
import { Helper } from '../utils/helper';
import { SmsService } from '../utils/sms';
import { EmailService } from '../utils/email';
import { sendSmsOtp } from '../utils/sendSmsOtp';
import { AppError } from '../middlewares/errorHandler';
import { Op } from 'sequelize';


export class AuthService {
  /**
   * Register new user
   */
static async signup(data: any) {
  console.log("🔥 Signup body =>", data);

  const password = data.password;
  if (!password) throw new AppError("Password is required", 400);

  // Email duplicate check
  if (data.email) {
    const emailExists = await User.findOne({ where: { email: data.email } });
    if (emailExists) throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const age = Helper.calculateAge(new Date(data.dob));
  const rytId = Helper.generateRytId();

  // 👉 Generate OTP
  const otp = Helper.generateOtp(); // Random 6 digit OTP
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

  const user = await User.create({
    name: data.name,
    last_name: data.last_name,
    email: data.email,
    phone: data.phone,
    dialing_code: data.dialing_code,
    password: hashedPassword,
    profile_by: data.profile_by,
    gender: data.gender,
    mat_status: data.mat_status,
    religion: data.religion,
    religion_name: data.religion_name,
    caste: data.caste,
    clan_id: data.clan,
    country: data.country,
    state: data.state,
    dob: data.dob,
    age,
    ryt_id: rytId,
    status: "Not Verified",
    is_phone_verified: false,

    // 🆕 Save OTP
    otp,
    otp_expiry: otpExpiry,
    otp_attempts: 0,
    otp_last_sent: new Date(),
  });

  // 👉 Send OTP via SMS
  const fullPhone = Helper.formatPhoneNumber(user.dialing_code || "91", user.phone);
  await sendSmsOtp(fullPhone, otp);

  // Maintain Email Service but don't use it for verification yet
  // await EmailService.sendOtp(user.email, user.name, otp.toString());

  return {
    code: 201,
    success: true,
    message: "User registered successfully. Verify Phone OTP.",
    userId: user.id,
    email: user.email,
    phone: user.phone,
  };
}



  /**
   * Login user with email/phone/ryt_id
   */
static async login(identifier: string, password: string, dialingCode?: string) {
  try {
    // Build dynamic where clause
    let whereClause: any = {};

    if (identifier.includes("@")) {
      whereClause.email = identifier;
    } 
    else if (/^\d{10}$/.test(identifier)) {
      whereClause.phone = identifier;
      if (dialingCode) whereClause.dialing_code = dialingCode;
    } 
    else {
      whereClause.ryt_id = identifier;
    }

    // Find user 
    const user = await User.findOne({ where: whereClause });

    if (!user) {
      return {
        code: 401,
        success: false,
        message: "Invalid credentials"
      };
    }

    // Validate password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return {
        code: 401,
        success: false,
        message: "Invalid credentials"
      };
    }

    // Deleted users
    if (user.status === "Deleted") {
      return {
        code: 403,
        success: false,
        message: "Account has been deleted"
      };
    }

    // CHECK PHONE VERIFICATION
    if (!user.is_phone_verified) {

      // Generate and save OTP
      const otp = Helper.generateOtp();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otp_expiry = otpExpiry;
      user.otp_last_sent = new Date();
      await user.save();

      // Send SMS
      const fullPhone = Helper.formatPhoneNumber(user.dialing_code || "91", user.phone);
      await sendSmsOtp(fullPhone, otp);

      // IMPORTANT: RETURN PHONE + DIALING CODE
      return {
        code: 403,
        success: false,
        message: "Phone not verified. OTP sent.",
        is_phone_verified: false,
        data: {
          phone: user.phone,
          dialing_code: user.dialing_code || "91",
        }
      };
    }

    // If phone verified → generate token
    const token = JwtService.generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      ryt_id: user.ryt_id || ""
    });

    const expiresAt = JwtService.getTokenExpiry();

    const encryptedUser = Buffer.from(JSON.stringify({
      id: user.id,
      full_name: user.name,
      email: user.email,
      phone: user.phone,
      ryt_id: user.ryt_id,
      profile_image: user.profile_photo,
      gender: user.gender,
      status: user.status
    })).toString("base64");

    return {
      code: 200,
      success: true,
      message: "Successfully logged in",
      data: {
        user: encryptedUser,
        user_id: user.id,
        access_token: token,
        token_type: "Bearer",
        expires_at: expiresAt
      }
    };

  } catch (err: any) {
    return {
      code: 500,
      success: false,
      message: err.message || "Something went wrong"
    };
  }
}



  /**
   * Login with OTP
   */
  static async loginWithOtp(phone: string, dialingCode: string, otp: string) {
    const user = await User.findOne({
      where: { phone, dialing_code: dialingCode },
    });

    if (!user) {
      throw new AppError('User account not found', 404);
    }

    // Verify OTP
    const isValid = await OtpService.verify(user.id, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Activate user if not active
    if (user.status === 'Not Verified') {
      user.status = 'Active';
      await user.save();
    }

    // Generate token
    const token = JwtService.generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      ryt_id: user.ryt_id || '',
    });

    const expiresAt = JwtService.getTokenExpiry();

    return { user, token, expiresAt };
  }

  /**
   * Verify phone with OTP
   */
  static async verifyPhone(userId: number, otp: string) {
    const isValid = await OtpService.verify(userId, otp);
    if (!isValid) {
      throw new AppError('The OTP entered is invalid or has expired', 400);
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User account not found', 404);
    }

    user.is_phone_verified = true;
    user.status = 'Active';
    user.otp = null;
    user.otp_attempts = 0; // Reset attempts on success
    await user.save();

    // Send welcome SMS and email
    const fullPhone = Helper.formatPhoneNumber(user.dialing_code, user.phone);
    await SmsService.sendWelcome(fullPhone, user.name, user.ryt_id || '');
    await EmailService.sendWelcome(user.email, user.name, user.ryt_id || '');

    return user;
  }

  /**
   * Verify phone with OTP (Public)
   */
  static async verifyPhonePublic(phone: string, dialingCode: string, otp: string) {
    const user = await User.findOne({
      where: { phone, dialing_code: dialingCode },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await OtpService.verify(user.id, otp);
    if (!isValid) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.is_phone_verified = true;
    user.status = 'Active';
    user.otp = null;
    user.otp_attempts = 0;
    await user.save();

     // Generate token for auto-login
    const token = JwtService.generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
      ryt_id: user.ryt_id || ''
    });
    const expiresAt = JwtService.getTokenExpiry();

    const encryptedUser = Buffer.from(JSON.stringify({
      id: user.id,
      full_name: user.name,
      email: user.email,
      phone: user.phone,
      ryt_id: user.ryt_id,
      profile_image: user.profile_photo,
      gender: user.gender,
      status: user.status
    })).toString("base64");

    return {
      message: "Phone verified successfully",
      access_token: token,
      expires_at: expiresAt,
      user: encryptedUser,
      user_id: user.id
    };
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Account with this email address not found', 404);
    }

    // Generate new random password
    const newPassword = Helper.generatePassword(8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.user_password = newPassword;
    await user.save();

    // Send email with new password
    await EmailService.sendPasswordReset(email, user.name, newPassword);

    return true;
  }

  /**
   * Change password
   */
static async changePassword(userId: number, currentPassword: string, newPassword: string) {
  const user = await User.findByPk(userId);
  if (!user) throw new AppError("User account not found", 404);

  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) throw new AppError("The current password you entered is incorrect", 400);

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return true;
}



  /**
   * Create OTP for phone/email update
   */
  static async createOtp(userId: number) {
    const otpData = await OtpService.saveOtp(userId);
    return otpData.otp;
  }

  /**
   * Resend OTP
   */
  static async resendOtp(phone: string, dialingCode: string) {
    const user = await User.findOne({
      where: { phone, dialing_code: dialingCode },
    });

    if (!user) {
      throw new AppError('User account not found', 404);
    }

    // Cooldown check
    if (user.otp_last_sent) {
        const diff = Date.now() - new Date(user.otp_last_sent).getTime();
        if (diff < 30 * 1000) {
            throw new AppError('Please wait 30 seconds before resending OTP', 400);
        }
    }

    // Max attempts check
    if (user.otp_attempts >= 3) {
        const lastSent = user.otp_last_sent ? new Date(user.otp_last_sent).getTime() : 0;
        if (Date.now() - lastSent > 60 * 60 * 1000) {
             user.otp_attempts = 0;
        } else {
             throw new AppError('Max OTP attempts reached. Please try again later.', 400);
        }
    }

    const otp = Helper.generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); 

    user.otp = otp;
    user.otp_expiry = otpExpiry;
    user.otp_attempts += 1;
    user.otp_last_sent = new Date();
    await user.save();

    const fullPhone = Helper.formatPhoneNumber(dialingCode, phone);
    await sendSmsOtp(fullPhone, otp);

    return otp;
  }



static async verifyEmailOtp(email: string, otp: string) {
    if (!email || !otp) {
      throw new AppError("Email and OTP are required", 400);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Validate OTP
    if (!user.otp || user.otp !== otp) {
      throw new AppError("Invalid OTP", 400);
    }

    // Check expiration
    if (!user.otp_expiry || user.otp_expiry < new Date()) {
      throw new AppError("OTP expired", 400);
    }

    // Update verification status
    user.status = "Active";
    user.is_phone_verified = true; // or rename column later to is_email_verified
    user.email_verified_at = new Date();
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    // Generate Token
const otpgenerated = Helper.generateOtp();
const otpExpiry = Helper.generateOtpExpiry();

await user.update({
  otp : otpgenerated ,
  otp_expiry: otpExpiry
});

// Send email
const access_token = JwtService.generateToken({
  userId: user.id,
  email: user.email,
  phone: user.phone,
  ryt_id: user.ryt_id || ""
});
    // Send welcome email 🎉
    await EmailService.sendWelcome(user.email, user.name, user.ryt_id || "");

    return {
      user_id: user.id,
      access_token,
      ryt_id: user.ryt_id,
    };
  }


 static async resendEmailOtp(email: string) {
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // 💡 If already verified, no need to resend OTP
  if (user.status === "Active") {
    throw new AppError("User already verified", 400);
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await user.update({
    otp,
    otp_expiry: otpExpiry,
  });

  // Send OTP email
  await EmailService.sendOtp(user.email, user.name, otp.toString());

  return {
    userId: user.id,
    email: user.email,
    message: "New OTP sent to registered email",
  };
}



}
