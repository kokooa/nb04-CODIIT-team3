import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './http-error.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      statusCode: err.status,
      error: errorNames[err.status] || 'Internal Server Error',
    });
  }

  return res.status(500).json({
    message: '서버 내부 오류가 발생했습니다.',
    statusCode: 500,
    error: errorNames[500] || 'Internal Server Error',
  });
};
