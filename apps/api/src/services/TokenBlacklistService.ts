/**
 * Token Blacklist Service
 * Maintains a blacklist of revoked tokens
 * TODO: Move to Redis for production (currently in-memory)
 */

interface BlacklistEntry {
  token: string;
  revokedAt: Date;
  expiresAt: Date;
}

class TokenBlacklistService {
  private blacklist: Map<string, BlacklistEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanupInterval();
  }

  /**
   * Add a token to the blacklist
   */
  addToBlacklist(token: string, expiresAt: Date): void {
    this.blacklist.set(token, {
      token,
      revokedAt: new Date(),
      expiresAt,
    });
  }

  /**
   * Check if a token is blacklisted
   */
  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  /**
   * Remove expired entries from blacklist
   * Runs periodically to prevent memory leaks
   */
  private cleanupExpiredTokens(): void {
    const now = new Date();
    const expiredTokens: string[] = [];

    for (const [token, entry] of this.blacklist.entries()) {
      if (entry.expiresAt < now) {
        expiredTokens.push(token);
      }
    }

    for (const token of expiredTokens) {
      this.blacklist.delete(token);
    }

    if (expiredTokens.length > 0) {
      console.log(`Cleaned up ${expiredTokens.length} expired tokens from blacklist`);
    }
  }

  /**
   * Start periodic cleanup of expired tokens
   */
  private startCleanupInterval(): void {
    if (process.env.NODE_ENV !== 'test') {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpiredTokens();
      }, 60 * 60 * 1000); // Run every hour

      this.cleanupInterval.unref(); // Don't keep process alive just for cleanup
    }
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.blacklist.clear();
  }

  /**
   * Get blacklist size (for monitoring/testing)
   */
  getSize(): number {
    return this.blacklist.size;
  }
}

export const tokenBlacklistService = new TokenBlacklistService();
