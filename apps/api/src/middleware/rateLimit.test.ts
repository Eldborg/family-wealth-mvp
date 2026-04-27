import { Request, Response } from 'express';
import { rateLimit, authRateLimit, apiRateLimit } from './rateLimit';

describe('Rate Limiting Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: jest.Mock;

  const createMockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    setHeader: jest.fn(),
  });

  beforeEach(() => {
    nextFunction = jest.fn();
    mockReq = {
      ip: Math.random().toString(36).substring(7), // Random IP to avoid state pollution
    };
    mockRes = createMockRes();
  });

  describe('rateLimit', () => {
    it('should allow requests within the limit', () => {
      const limiter = rateLimit(60000, 5);

      for (let i = 0; i < 5; i++) {
        limiter(mockReq as Request, mockRes as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
      }
    });

    it('should reject requests exceeding the limit', () => {
      const limiter = rateLimit(60000, 2);

      // First two requests should pass
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(2);

      // Third request should be rejected
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Too many requests'),
        })
      );
    });

    it('should set rate limit headers correctly', () => {
      const limiter = rateLimit(60000, 3);

      limiter(mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 2);
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        expect.any(Number)
      );
    });

    it('should track different IPs separately', () => {
      const limiter = rateLimit(60000, 2);

      // First IP - 2 requests
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      limiter(mockReq as Request, mockRes as Response, nextFunction);

      // Second IP - should not be rate limited
      const mockReq2 = { ip: '192.168.1.2' } as Partial<Request>;
      limiter(mockReq2 as Request, mockRes as Response, nextFunction);

      // Third request on second IP should succeed
      expect(nextFunction).toHaveBeenCalledTimes(3);
    });

    it('should reset counter after time window expires', (done) => {
      const windowMs = 100; // 100ms window
      const limiter = rateLimit(windowMs, 1);

      // First request
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalledTimes(1);

      // Second request (should be rejected)
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(429);

      // Wait for window to expire
      setTimeout(() => {
        nextFunction.mockClear();
        mockRes.status = jest.fn().mockReturnThis();

        // Request after window expiry (should succeed)
        limiter(mockReq as Request, mockRes as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
        done();
      }, windowMs + 50);
    });

    it('should calculate retry after correctly', () => {
      const limiter = rateLimit(10000, 1);

      limiter(mockReq as Request, mockRes as Response, nextFunction);
      limiter(mockReq as Request, mockRes as Response, nextFunction);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          retryAfter: expect.any(Number),
        })
      );
    });
  });

  describe('authRateLimit', () => {
    it('should allow 5 requests per 5 minutes', () => {
      const limiter = authRateLimit();

      for (let i = 0; i < 5; i++) {
        limiter(mockReq as Request, mockRes as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalled();
      }
    });

    it('should reject 6th request within 5 minutes', () => {
      const limiter = authRateLimit();

      // First 5 requests
      for (let i = 0; i < 5; i++) {
        limiter(mockReq as Request, mockRes as Response, nextFunction);
      }

      // 6th request
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.status).toHaveBeenCalledWith(429);
    });
  });

  describe('apiRateLimit', () => {
    it('should allow multiple requests within limit', () => {
      const limiter = apiRateLimit();

      for (let i = 0; i < 10; i++) {
        nextFunction.mockClear();
        limiter(mockReq as Request, mockRes as Response, nextFunction);
        expect(nextFunction).toHaveBeenCalledTimes(1);
      }
    });

    it('should have 100 request limit per minute', () => {
      const limiter = apiRateLimit();
      // Verify the limiter returns a function with correct limits configured
      // by checking that it calls next and sets rate limit headers
      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 100);
    });
  });

  describe('rate limit with unknown IP', () => {
    it('should handle requests with socket remoteAddress', () => {
      mockReq = { socket: { remoteAddress: '127.0.0.1' } } as any;
      const limiter = rateLimit(60000, 1);

      limiter(mockReq as Request, mockRes as Response, nextFunction);
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
