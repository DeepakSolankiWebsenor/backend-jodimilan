import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/app';
import { JwtPayload } from '../types';

export class JwtService {
  /**
   * Generate JWT token
   */
  static generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret as jwt.Secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JwtPayload {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }

  /**
   * Get token expiry date
   */
  static getTokenExpiry(): Date {
    const expiresIn = config.jwt.expiresIn;
    const days = parseInt(expiresIn.replace('d', ''));
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }
}
