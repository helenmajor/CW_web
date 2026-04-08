import { findUserById } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializers.js';

const extractBearerToken = (headerValue) => {
  if (!headerValue || !headerValue.startsWith('Bearer ')) {
    return null;
  }

  return headerValue.slice('Bearer '.length).trim();
};

export const requireAuth = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next(new AppError('Authorization token is required.', 401));
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = findUserById(decoded.sub);

    if (!user) {
      next(new AppError('Authenticated user no longer exists.', 401));
      return;
    }

    req.user = serializeUser(user);
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token.', 401));
  }
};
