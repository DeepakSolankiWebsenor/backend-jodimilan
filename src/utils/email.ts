import * as nodemailer from 'nodemailer';
import { config } from '../config/app';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export class EmailService {


// OTP SEND 
/**
 * Send OTP verification email
 */
static async sendOtp(email: string, name: string, otp: string): Promise<boolean> {
  const subject = `Your OTP Code - ${config.app.name}`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
      <h2>Hello ${name},</h2>
      <p>Your One-Time Password (OTP) to verify your account on <strong>${config.app.name}</strong> is:</p>
      
      <h1 style="
        background: #f5f5f5;
        padding: 12px 20px;
        border-radius: 8px;
        display: inline-block;
        letter-spacing: 8px;
        font-size: 28px;
        text-align: center;
      ">
        ${otp}
      </h1>

      <p>This OTP is valid for the next <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email or contact support immediately.</p>

      <br/>
      <p>Best regards,<br/>${config.app.name} Team</p>
    </div>
  `;

  return this.send(email, subject, html);
}



  /**
   * Send email
   */
  static async send(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: `"${config.email.fromName}" <${config.email.fromAddress}>`,
        to,
        subject,
        html,
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(email: string, name: string, verificationUrl: string): Promise<boolean> {
    const subject = 'Email Verification';
    const html = `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering with ${config.app.name}.</p>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none;">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>${config.app.name} Team</p>
    `;
    return this.send(email, subject, html);
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, name: string, newPassword: string): Promise<boolean> {
    const subject = 'Password Reset';
    const html = `
      <h2>Hello ${name},</h2>
      <p>Your password has been reset. Your new password is:</p>
      <h3 style="background: #f5f5f5; padding: 10px; display: inline-block;">${newPassword}</h3>
      <p>Please login with this password and change it immediately for security reasons.</p>
      <br/>
      <p>Best regards,<br/>${config.app.name} Team</p>
    `;
    return this.send(email, subject, html);
  }

  /**
   * Send welcome email
   */
  static async sendWelcome(email: string, name: string, rytId: string): Promise<boolean> {
    const subject = `Welcome to ${config.app.name}`;
    const html = `
      <h2>Welcome ${name}!</h2>
      <p>Thank you for joining ${config.app.name}.</p>
      <p>Your RYT ID is: <strong>${rytId}</strong></p>
      <p>You can use this ID to login along with your email or phone number.</p>
      <br/>
      <p>Happy matchmaking!<br/>${config.app.name} Team</p>
    `;
    return this.send(email, subject, html);
  }

  /**
   * Send package subscription email
   */
  static async sendPackageSubscription(
    email: string,
    name: string,
    packageName: string,
    expiryDate: string
  ): Promise<boolean> {
    const subject = 'Package Subscription Confirmation';
    const html = `
      <h2>Hello ${name},</h2>
      <p>Your subscription to <strong>${packageName}</strong> has been confirmed.</p>
      <p>Valid till: <strong>${expiryDate}</strong></p>
      <p>Thank you for your purchase!</p>
      <br/>
      <p>Best regards,<br/>${config.app.name} Team</p>
    `;
    return this.send(email, subject, html);
  }
}
