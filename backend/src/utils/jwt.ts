import jwt from 'jsonwebtoken';
import { config } from '../config/env';

/**
 * Generates a JSON Web Token signed with the JWT_SECRET
 * @param payload Object containing properties to encode (e.g. userId, email, role)
 * @returns string signed JWT token
 */
export const generateToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '1d', // Token will be valid for 1 day
  });
};

/**
 * Generates a short-lived access token
 */
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '15m', // Access token valid for 15 minutes
  });
};

/**
 * Generates a long-lived refresh token
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: '7d', // Refresh token valid for 7 days
  });
};

/**
 * Verifies if a token is valid and returns the decoded payload
 * @param token JWT token string
 * @returns Decoded payload object
 */
export const verifyToken = (token: string): any => {
  return jwt.verify(token, config.JWT_SECRET);
};
