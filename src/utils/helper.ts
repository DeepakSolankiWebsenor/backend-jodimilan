import crypto from 'crypto';

export class Helper {
  /**
   * Generate random string
   */
  static makeRandomString(length: number = 10): string {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
  }

  /**
   * Generate unique order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD${timestamp}${random}`;
  }

  /**
   * Generate RYT ID (Royal Yuvak Thikana ID)
   */
  static generateRytId(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `RYT${timestamp}${random}`;
  }

  /**
   * Calculate age from date of birth
   */
  static calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Format phone number with dialing code
   */
  static formatPhoneNumber(dialingCode: string, phone: string): string {
    return `${dialingCode}${phone}`;
  }

  /**
   * Generate random password
   */
  static generatePassword(length: number = 8): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Paginate results
   */
  static paginate(page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;
    return { limit, offset };
  }

  /**
   * Format pagination response
   */
  static formatPaginationResponse(data: any[], total: number, page: number, limit: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      data,
      pagination: {
        total,
        per_page: limit,
        current_page: page,
        total_pages: totalPages,
        has_more: page < totalPages,
      },
    };
  }

    /**
   * Generate a 6-digit OTP
   */
  static generateOtp(length: number = 6): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }
    return otp;
  }

  /**
   * Generate OTP expiry time (default: 10 minutes)
   */
  static generateOtpExpiry(minutes: number = 10): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
  }

}
