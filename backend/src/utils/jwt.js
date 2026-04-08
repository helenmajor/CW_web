import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const signToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      username: user.username,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};
