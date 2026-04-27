import { Request, Response, NextFunction } from 'express';

/**
 * Security headers middleware for production deployments
 * Adds HSTS, X-Content-Type-Options, X-Frame-Options, and X-XSS-Protection headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Strict-Transport-Security: Force HTTPS for 1 year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // X-Content-Type-Options: Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options: Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // X-XSS-Protection: Legacy XSS protection (modern browsers use CSP, but good for older clients)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content-Security-Policy: Restrict resource loading (adjust as needed for your app)
  // This is a permissive policy - tighten based on your actual needs
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'"
  );

  // Referrer-Policy: Control referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy: Control browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
}
