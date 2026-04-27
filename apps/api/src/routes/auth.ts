import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import {
  authenticateToken,
  validateRefreshToken,
  AuthRequest,
} from '../middleware/auth';
import {
  validateRegisterInput,
  validateLoginInput,
  formatValidationErrors,
} from '../utils/validation';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';
import { authRateLimit } from '../middleware/rateLimit';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
router.post('/register', authRateLimit(), async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    const validationErrors = validateRegisterInput(email, password, name);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        errors: formatValidationErrors(validationErrors),
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Email already registered',
      });
      return;
    }

    // Hash password
    const hashedPassword = await authService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Generate tokens
    const tokens = authService.generateTokens(user.id, user.email);

    // Set cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Store refresh token in database (optional, for token revocation)
    // await prisma.refreshToken.create({ ... });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', authRateLimit(), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const validationErrors = validateLoginInput(email, password);
    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        errors: formatValidationErrors(validationErrors),
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Verify password
    const passwordMatch = await authService.comparePassword(
      password,
      user.password
    );

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const tokens = authService.generateTokens(user.id, user.email);

    // Set cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', validateRefreshToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not found in token',
      });
      return;
    }

    // Get fresh user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Generate new tokens
    const tokens = authService.generateTokens(user.id, user.email);

    // Update cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and clear tokens
 */
router.post('/logout', (_req: Request, res: Response) => {
  try {
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
});

export default router;
