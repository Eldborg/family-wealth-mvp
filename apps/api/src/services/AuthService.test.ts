import { AuthService } from './AuthService';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword456';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('generateTokens', () => {
    it('should generate access and refresh tokens', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const tokens = authService.generateTokens(userId, email);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate different tokens for different users', () => {
      const tokens1 = authService.generateTokens('user1', 'user1@example.com');
      const tokens2 = authService.generateTokens('user2', 'user2@example.com');

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const tokens = authService.generateTokens(userId, email);
      const decoded = authService.verifyAccessToken(tokens.accessToken);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.type).toBe('access');
    });

    it('should return null for invalid token', () => {
      const decoded = authService.verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for refresh token used as access token', () => {
      const tokens = authService.generateTokens('user-id', 'email@example.com');
      const decoded = authService.verifyAccessToken(tokens.refreshToken);
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = authService.verifyAccessToken('');
      expect(decoded).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const userId = 'test-user-id';
      const email = 'test@example.com';
      const tokens = authService.generateTokens(userId, email);
      const decoded = authService.verifyRefreshToken(tokens.refreshToken);

      expect(decoded).not.toBeNull();
      expect(decoded?.userId).toBe(userId);
      expect(decoded?.email).toBe(email);
      expect(decoded?.type).toBe('refresh');
    });

    it('should return null for invalid token', () => {
      const decoded = authService.verifyRefreshToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for access token used as refresh token', () => {
      const tokens = authService.generateTokens('user-id', 'email@example.com');
      const decoded = authService.verifyRefreshToken(tokens.accessToken);
      expect(decoded).toBeNull();
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(authService.validateEmail('user@example.com')).toBe(true);
      expect(authService.validateEmail('john.doe@company.co.uk')).toBe(true);
      expect(authService.validateEmail('test+tag@domain.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(authService.validateEmail('invalid-email')).toBe(false);
      expect(authService.validateEmail('user@')).toBe(false);
      expect(authService.validateEmail('@example.com')).toBe(false);
      expect(authService.validateEmail('user @example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return valid for strong password', () => {
      const result = authService.validatePassword('StrongPass123');
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const result = authService.validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = authService.validatePassword('lowercase123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = authService.validatePassword('UPPERCASE123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without number', () => {
      const result = authService.validatePassword('NoNumbers');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for very weak password', () => {
      const result = authService.validatePassword('weak');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
