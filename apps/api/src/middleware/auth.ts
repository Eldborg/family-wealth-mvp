import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/AuthService';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * Middleware to authenticate requests using JWT from Authorization header or cookies
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const decoded = authService.verifyAccessToken(token);
  if (!decoded) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  next();
};

/**
 * Middleware to extract token from cookies or Authorization header
 */
export const extractToken = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

  if (token) {
    const decoded = authService.verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.accessToken;

  if (token) {
    const decoded = authService.verifyAccessToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }

  next();
};

/**
 * Middleware to check if user has a valid refresh token
 */
export const validateRefreshToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ success: false, error: 'No refresh token provided' });
    return;
  }

  const decoded = authService.verifyRefreshToken(refreshToken);
  if (!decoded) {
    res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
    return;
  }

  req.user = decoded;
  next();
};

/**
 * Error handler for authentication errors
 */
export const handleAuthError = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Invalid token' });
  } else if (error.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expired' });
  } else {
    next(error);
  }
};
