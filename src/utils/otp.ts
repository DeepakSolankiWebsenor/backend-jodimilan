import { config } from '../config/app';
import { User } from '../models';
import { OtpData } from '../types';

export class OtpService {
  /**
   * Generate random OTP
   */
  static generate(length: number = config.otp.length): string {
    // In production, generate random OTP
    // In test/dev, use fixed OTP for testing
    if (config.app.env === 'production') {
      const min = Math.pow(10, length - 1);
      const max = Math.pow(10, length) - 1;
      return Math.floor(min + Math.random() * (max - min + 1)).toString();
    }
    return '123456'; // Fixed for testing
  }

  /**
   * Save OTP to user
   */
  static async saveOtp(userId: number, otp?: string): Promise<OtpData> {
    const generatedOtp = otp || this.generate();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + config.otp.expiryMinutes);

    await User.update(
      {
        otp: generatedOtp,
        otp_expiry: expiry,
      },
      { where: { id: userId } }
    );

    return { otp: generatedOtp, expiry };
  }

  /**
   * Verify OTP
   */
  static async verify(userId: number, otp: string): Promise<boolean> {
    const user = await User.findByPk(userId);

    if (!user || !user.otp || !user.otp_expiry) {
      return false;
    }

    const now = new Date();
    if (user.otp !== otp) {
      return false;
    }

    if (now > user.otp_expiry) {
      return false;
    }

    // Clear OTP after successful verification
    await User.update(
      { otp: null, otp_expiry: null },
      { where: { id: userId } }
    );

    return true;
  }

  /**
   * Clear OTP
   */
  static async clear(userId: number): Promise<void> {
    await User.update(
      { otp: null, otp_expiry: null },
      { where: { id: userId } }
    );
  }



static async verifyMobileandUpdate(userId: number, otp: string, newPhone: string): Promise<boolean> {
  try {
    console.log("INPUT:", { userId, otp, newPhone });

    const user = await User.findByPk(userId);
    console.log("USER DB DATA:", {
      dbOtp: user?.otp,
      dbOtpExpiry: user?.otp_expiry
    });

    if (!user || !user.otp || !user.otp_expiry) {
      console.log("❌ User or OTP missing");
      return false;
    }

    const now = new Date();
    console.log("TIMES:", { now, dbExpiry: user.otp_expiry });

    if (user.otp !== otp) {
      console.log(`❌ OTP mismatch → DB:${user.otp} UI:${otp}`);
      return false;
    }

    if (now > user.otp_expiry) {
      console.log("❌ OTP Expired");
      return false;
    }

    console.log("✔ OTP Verified, Updating Phone…");

    await User.update(
      {
        phone: newPhone,
        is_phone_verified: true,
        otp: null,
        otp_expiry: null
      },
      { where: { id: userId } }
    );

    console.log("✔ Mobile Updated Successfully");
    return true;

  } catch (error) {
    console.error("verifyMobileandUpdate Error:", error);
    return false;
  }
}


static async verifyEmailAndUpdate(userId: number, otp: string, newEmail: string): Promise<boolean> {
  try {
    console.log("Email OTP Verify:", { userId, otp, newEmail });

    const user = await User.findByPk(userId);
    
    if (!user || !user.otp || !user.otp_expiry) {
      console.log("❌ No OTP data found");
      return false;
    }

    const now = new Date();

    if (user.otp !== otp) {
      console.log("❌ OTP mismatch");
      return false;
    }

    if (now > user.otp_expiry) {
      console.log("❌ OTP expired");
      return false;
    }

    console.log("✔ OTP Verified → Updating Email…");

    await User.update(
      {
        email: newEmail,
        email_verified_at: new Date(),
        otp: null,
        otp_expiry: null,
      },
      { where: { id: userId } }
    );

    console.log("✔ Email Updated Successfully");
    return true;

  } catch (error) {
    console.error("verifyEmailAndUpdate Error:", error);
    return false;
  }
}



}
