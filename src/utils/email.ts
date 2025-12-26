import * as nodemailer from 'nodemailer';
import { config } from '../config/app';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // True for 465, false for other ports
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

export class EmailService {
  /**
   * Base HTML template for consistent design
   */
  private static getBaseTemplate(content: string, title: string): string {
    const primaryColor = '#8b1d40'; // Jodi Milan brand color
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: ${primaryColor}; padding: 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
          .content { padding: 40px; }
          .otp-card { background: #fdf2f5; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px dashed ${primaryColor}; }
          .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 8px; color: ${primaryColor}; margin: 0; }
          .button { display: inline-block; padding: 14px 30px; background-color: ${primaryColor}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .footer { background: #f1f1f1; padding: 20px; text-align: center; font-size: 13px; color: #777; }
          .social-links { margin-top: 15px; }
          .social-links a { margin: 0 10px; color: #777; text-decoration: none; font-size: 18px; }
          p { margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${config.app.name}</h1>
          </div>
          <div class="content">
            <h2 style="color: ${primaryColor}; margin-top: 0;">${title}</h2>
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${config.app.name}. All rights reserved.</p>
            <p>support@jodimilan.com | www.jodimilan.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }


  /**
   * Send OTP verification email
   */
  static async sendOtp(email: string, name: string, otp: string): Promise<boolean> {
    const subject = `Your Verification Code - ${config.app.name}`;
    const content = `
      <p>Hello ${name},</p>
      <p>Thank you for choosing <strong>${config.app.name}</strong>. Please use the following One-Time Password (OTP) to complete your verification:</p>
      <div class="otp-card">
        <h1 class="otp-code">${otp}</h1>
      </div>
      <p style="font-size: 14px; color: #666;">This OTP is valid for the next <strong>10 minutes</strong>. For security reasons, do not share this code with anyone.</p>
      <p>If you did not request this code, please ignore this email.</p>
      <br/>
      <p>Best regards,<br/>The ${config.app.name} Team</p>
    `;

    return this.send(email, subject, this.getBaseTemplate(content, 'Verify Your Account'));
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
    const subject = 'Verify Your Email Address';
    const content = `
      <p>Hello ${name},</p>
      <p>Welcome to <strong>${config.app.name}</strong>! We're excited to have you on board.</p>
      <p>Please confirm your email address to get full access to our matchmaking services:</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verify My Email</a>
      </div>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="font-size: 13px; color: #888;">${verificationUrl}</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <br/>
      <p>Best regards,<br/>The ${config.app.name} Team</p>
    `;
    return this.send(email, subject, this.getBaseTemplate(content, 'Confirm Registration'));
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string, name: string, newPassword: string): Promise<boolean> {
    const subject = 'Your Password Has Been Reset';
    const content = `
      <p>Hello ${name},</p>
      <p>Your password for <strong>${config.app.name}</strong> has been reset successfully.</p>
      <p>Your temporary password is:</p>
      <div class="otp-card">
        <h3 style="margin: 0; color: #8b1d40;">${newPassword}</h3>
      </div>
      <p><strong>Important:</strong> Please log in and change your password immediately for security purposes.</p>
      <br/>
      <p>Best regards,<br/>The ${config.app.name} Team</p>
    `;
    return this.send(email, subject, this.getBaseTemplate(content, 'Password Reset Success'));
  }

  /**
   * Send welcome email
   */
  static async sendWelcome(email: string, name: string, rytId: string): Promise<boolean> {
    const subject = `Welcome to the ${config.app.name} Family!`;
    const content = `
      <p>Hello ${name},</p>
      <p>We are thrilled to welcome you to <strong>${config.app.name}</strong>, your trusted partner in finding your perfect life partner.</p>
      <div class="otp-card" style="border-style: solid;">
        <p style="margin: 0; font-size: 14px; color: #666;">Your Unique RYT ID</p>
        <h2 style="margin: 5px 0; color: #8b1d40;">${rytId}</h2>
      </div>
      <p>You can use this ID or your registered email/phone to explore matches and start your journey.</p>
      <div style="text-align: center;">
        <a href="https://jodimilan.com/Login" class="button">Start Exploring Profiles</a>
      </div>
      <p>Happy matchmaking!</p>
      <br/>
      <p>Best regards,<br/>The ${config.app.name} Team</p>
    `;
    return this.send(email, subject, this.getBaseTemplate(content, 'Welcome to Jodi Milan'));
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
    const subject = 'Subscription Confirmation - Jodi Milan';
    const content = `
      <p>Hello ${name},</p>
      <p>This is a confirmation that your subscription to the <strong>${packageName}</strong> package has been activated successfully.</p>
      <div class="otp-card" style="text-align: left; background: #f9f9f9; border: 1px solid #ddd;">
        <p style="margin: 5px 0;"><strong>Package:</strong> ${packageName}</p>
        <p style="margin: 5px 0;"><strong>Valid Until:</strong> ${expiryDate}</p>
      </div>
      <p>You now have access to premium features to enhance your partner search experience.</p>
      <br/>
      <p>Thank you for choosing us!<br/>The ${config.app.name} Team</p>
    `;
    return this.send(email, subject, this.getBaseTemplate(content, 'Subscription Confirmed'));
  }
}
