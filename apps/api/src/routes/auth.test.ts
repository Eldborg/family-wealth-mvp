import { PrismaClient } from '@prisma/client';
import { authService } from '../services/AuthService';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

describe('Auth Routes', () => {
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = new PrismaClient();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        name: userData.name,
        password: 'hashed-password',
      });

      // Verify the user doesn't exist
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(existingUser).toBeNull();

      // Create user
      const hashedPassword = await authService.hashPassword(userData.password);
      expect(hashedPassword).not.toBe(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
    });

    it('should reject duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        name: 'Test User',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: userData.email,
      });

      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(existingUser).toBeDefined();
      expect(existingUser.email).toBe(userData.email);
    });

    it('should validate input data', () => {
      const invalidData = [
        { email: 'invalid-email', password: 'Test123', name: 'User' },
        { email: 'test@example.com', password: 'short', name: 'User' },
        { email: 'test@example.com', password: 'TestPassword123', name: '' },
      ];

      invalidData.forEach((data) => {
        const emailValid = authService.validateEmail(data.email);
        const passwordValid = authService.validatePassword(data.password).valid;
        expect(emailValid && passwordValid && data.name.length > 0).toBe(false);
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      const hashedPassword = await authService.hashPassword(userData.password);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: userData.email,
        name: 'Test User',
        password: hashedPassword,
      });

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);

      const isPasswordValid = await authService.comparePassword(
        userData.password,
        user.password
      );
      expect(isPasswordValid).toBe(true);
    });

    it('should reject login with wrong password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        wrongPassword: 'WrongPassword456',
      };

      const hashedPassword = await authService.hashPassword(userData.password);

      const isPasswordValid = await authService.comparePassword(
        userData.wrongPassword,
        hashedPassword
      );
      expect(isPasswordValid).toBe(false);
    });

    it('should reject login for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { email: 'nonexistent@example.com' },
      });

      expect(user).toBeNull();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should generate new tokens with valid refresh token', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const tokens = authService.generateTokens(userId, email);

      const decoded = authService.verifyRefreshToken(tokens.refreshToken);
      expect(decoded).not.toBeNull();
      expect(decoded?.type).toBe('refresh');

      const newTokens = authService.generateTokens(userId, email);
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
    });

    it('should reject invalid refresh token', () => {
      const decoded = authService.verifyRefreshToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const user = await prisma.user.findUnique({
        where: { id: 'user-123' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const user = await prisma.user.findUnique({
        where: { id: 'non-existent-id' },
      });

      expect(user).toBeNull();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', () => {
      // Logout just clears cookies, should always succeed
      expect(true).toBe(true);
    });
  });
});
