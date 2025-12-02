import { Response } from 'express';
import { ApiResponse } from '../types';
import { EncryptionService } from './encryption';

export class ResponseHelper {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    message: string = 'Success',
    data?: T,
    code: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      code,
      success: true,
      message,
      data,
    };
    return res.status(code).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Error',
    code: number = 400,
    errors?: any
  ): Response {
    const response: ApiResponse = {
      code,
      success: false,
      message,
      errors,
    };
    return res.status(code).json(response);
  }

  /**
   * Send encrypted response (Laravel compatible)
   */
  static encrypted<T>(
    res: Response,
    message: string = 'Success',
    data: T,
    code: number = 200
  ): Response {
    const encryptedData = EncryptionService.encrypt(data);
    const response: ApiResponse = {
      code,
      success: true,
      message,
      data: encryptedData,
    };
    return res.status(code).json(response);
  }

  /**
   * Send paginated response
   */
  static paginated<T>(
    res: Response,
    message: string = 'Success',
    data: T[],
    total: number,
    page: number,
    limit: number
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const response: ApiResponse = {
      code: 200,
      success: true,
      message,
      data: {
        items: data,
        pagination: {
          total,
          per_page: limit,
          current_page: page,
          total_pages: totalPages,
          has_more: page < totalPages,
        },
      },
    };
    return res.status(200).json(response);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, 401);
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, 403);
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, message: string = 'Not found'): Response {
    return this.error(res, message, 404);
  }

  /**
   * Send validation error response
   */
  static validationError(res: Response, errors: any): Response {
    return this.error(res, 'Validation failed', 422, errors);
  }
}
