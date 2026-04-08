import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Invalid JSON body.',
      },
    });
    return;
  }

  if (error.message?.includes('not allowed by CORS')) {
    res.status(403).json({
      success: false,
      error: {
        message: error.message,
      },
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error.';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      details: error.details ?? null,
    },
  });
};
