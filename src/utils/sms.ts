import axios from 'axios';
import { config } from '../config/app';

export class SmsService {
  /**
   * Send SMS via WebSenor Gateway
   */
  private static async send(phone: string, message: string): Promise<boolean> {
    try {
      const url = config.sms.gatewayUrl;
      const params = {
        authkey: config.sms.username,
        mobiles: phone,
        message,
        sender: config.sms.senderId,
        route: config.sms.route,
      };

      const httpsAgent = new (require('https').Agent)({  
        rejectUnauthorized: false
      });

      await axios.get(url, { params, httpsAgent });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  /**
   * Send OTP SMS
   */
  static async sendOtp(phone: string, name: string, otp: string): Promise<boolean> {
    const message = `Dear ${name}, Your OTP for registration on ${config.app.name} is ${otp}.`;
    return this.send(phone, message);
  }

  /**
   * Send welcome SMS
   */
  static async sendWelcome(phone: string, name: string, rytId: string): Promise<boolean> {
    const message = `Dear ${name}, Welcome to ${config.app.name}! Your RYT ID is ${rytId}. Thank you for registering.`;
    return this.send(phone, message);
  }

  /**
   * Send phone update confirmation SMS
   */
  static async sendPhoneUpdate(phone: string, name: string): Promise<boolean> {
    const message = `Dear ${name}, Your phone number has been successfully updated on ${config.app.name}.`;
    return this.send(phone, message);
  }

  /**
   * Send package subscription SMS
   */
  static async sendPackageSubscription(
    phone: string,
    name: string,
    packageName: string,
    expiryDate: string
  ): Promise<boolean> {
    const message = `Dear ${name}, You have successfully subscribed to ${packageName}. Valid till ${expiryDate}. Thank you!`;
    return this.send(phone, message);
  }

  /**
   * Send friend request SMS
   */
  static async sendFriendRequest(
    phone: string,
    senderName: string,
    rytId: string
  ): Promise<boolean> {
    const message = `Dear User, ${senderName} (${rytId}) has sent you a friend request on ${config.app.name}. Login to view.`;
    return this.send(phone, message);
  }

  /**
   * Send friend request accepted SMS
   */
  static async sendFriendAccepted(
    phone: string,
    acceptorName: string,
    rytId: string
  ): Promise<boolean> {
    const message = `Dear User, ${acceptorName} (${rytId}) has accepted your friend request on ${config.app.name}!`;
    return this.send(phone, message);
  }
}
