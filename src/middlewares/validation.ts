import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseHelper } from '../utils/response';

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().reduce((acc: any, error: any) => {
      acc[error.path || error.param] = error.msg;
      return acc;
    }, {});

    return ResponseHelper.validationError(res, formattedErrors);
  }

  next();
};

/**
 * Validate function wrapper
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    next();
  };
};
