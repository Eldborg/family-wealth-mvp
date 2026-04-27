import { Router, Request, Response } from 'express';
import { authService } from '../services/AuthService';
import { tokenBlacklistService } from '../services/TokenBlacklistService';
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

    // Generate email verification token
    const verificationToken = authService.generateEmailVerificationToken();

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerificationToken: verificationToken,
        emailVerificationSentAt: new Date(),
      },
    });

    // Generate session tokens
    const tokens = authService.generateTokens(user.id, user.email);

    // Set cookies
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // TODO: Send verification email with token
    // const verificationLink = authService.getVerificationLink(
    //   verificationToken,
    //   process.env.FRONTEND_URL || 'http://localhost:3000'
    // );
    // await emailService.sendVerificationEmail(user.email, user.name, verificationLink);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: false,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      message: 'Verification email sent (implementation pending)',
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
 * Logout user and revoke tokens
 */
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    // Get tokens from cookies or headers
    const authHeader = req.headers['authorization'];
    const accessToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : req.cookies?.accessToken;

    const refreshToken = req.cookies?.refreshToken;

    // Add tokens to blacklist if they exist
    if (accessToken) {
      const decoded = authService.verifyAccessToken(accessToken);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        tokenBlacklistService.addToBlacklist(accessToken, expiresAt);
      }
    }

    if (refreshToken) {
      const decoded = authService.verifyRefreshToken(refreshToken);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        tokenBlacklistService.addToBlacklist(refreshToken, expiresAt);
      }
    }

    // Clear cookies
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

/**
 * POST /api/auth/verify-email
 * Verify email using verification token
 */
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
      return;
    }

    // Find user by verification token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
      });
      return;
    }

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - (user.emailVerificationSentAt?.getTime() || 0);
    const tokenMaxAge = 24 * 60 * 60 * 1000; // 24 hours
    if (tokenAge > tokenMaxAge) {
      res.status(400).json({
        success: false,
        error: 'Verification token has expired',
      });
      return;
    }

    // Mark email as verified and clear token
    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationSentAt: null,
      },
    });

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: verifiedUser.id,
        email: verifiedUser.email,
        name: verifiedUser.name,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email verification failed',
    });
  }
});

export default router;
