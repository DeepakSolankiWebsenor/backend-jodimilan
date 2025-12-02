import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { JwtService } from '../utils/jwt';
import { User } from '../models';
import { ResponseHelper } from '../utils/response';

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ResponseHelper.unauthorized(res, 'No token provided');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = JwtService.verifyToken(token);

    // Get user from database
    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ['password', 'otp', 'user_password'] },
    });

    if (!user) {
      return ResponseHelper.unauthorized(res, 'User not found');
    }

    if (user.status !== 'Active') {
      return ResponseHelper.forbidden(res, 'Account is not active');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return ResponseHelper.unauthorized(res, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      return ResponseHelper.unauthorized(res, 'Token expired');
    }
    return ResponseHelper.error(res, 'Authentication failed', 401);
  }
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = JwtService.verifyToken(token);
      const user = await User.findByPk(payload.userId);

      if (user && user.status === 'Active') {
        req.user = user;
        req.userId = user.id;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

/**
 * Role-based access control middleware
 */
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user) {
      return ResponseHelper.unauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.user_type)) {
      return ResponseHelper.forbidden(res, 'Insufficient permissions');
    }

    next();
  };
};
