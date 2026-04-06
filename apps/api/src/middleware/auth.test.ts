import { Response, NextFunction } from 'express';
import { authenticateToken, extractToken, optionalAuth, validateRefreshToken, AuthRequest } from './auth';
import { authService } from '../services/AuthService';

describe('Auth Middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should call next() with valid token in Authorization header', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.headers = { authorization: `Bearer ${tokens.accessToken}` };

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe('user-id');
    });

    it('should call next() with valid token in cookies', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.cookies = { accessToken: tokens.accessToken };

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should return 401 with no token', () => {
      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', () => {
      req.headers = { authorization: 'Bearer invalid-token' };

      authenticateToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('extractToken', () => {
    it('should extract token from Authorization header', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.headers = { authorization: `Bearer ${tokens.accessToken}` };

      extractToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user?.userId).toBe('user-id');
    });

    it('should extract token from cookies', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.cookies = { accessToken: tokens.accessToken };

      extractToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should call next() even without token', () => {
      extractToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should handle invalid token gracefully', () => {
      req.headers = { authorization: 'Bearer invalid-token' };

      extractToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('optionalAuth', () => {
    it('should set user if valid token provided', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.headers = { authorization: `Bearer ${tokens.accessToken}` };

      optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should call next() without user if no token', () => {
      optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });

    it('should handle invalid token without failing', () => {
      req.headers = { authorization: 'Bearer invalid-token' };

      optionalAuth(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });

  describe('validateRefreshToken', () => {
    it('should call next() with valid refresh token', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.cookies = { refreshToken: tokens.refreshToken };

      validateRefreshToken(req as AuthRequest, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('should return 401 with no refresh token', () => {
      validateRefreshToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'No refresh token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid refresh token', () => {
      req.cookies = { refreshToken: 'invalid-token' };

      validateRefreshToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid or expired refresh token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject access token as refresh token', () => {
      const tokens = authService.generateTokens('user-id', 'user@example.com');
      req.cookies = { refreshToken: tokens.accessToken };

      validateRefreshToken(req as AuthRequest, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
