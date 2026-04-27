import { Request, Response, NextFunction } from 'express';
import { isFeatureEnabled } from '../config/featureFlags';

/**
 * Middleware to check if a feature is enabled
 * Usage: router.post('/endpoint', requireFeature('INVITE_FAMILY_MEMBERS'), handler)
 */
export function requireFeature(feature: string) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!isFeatureEnabled(feature as any)) {
      res.status(403).json({
        success: false,
        error: 'This feature is not available yet during beta',
        feature,
      });
      return;
    }
    next();
  };
}

/**
 * Optional feature check - logs warning but allows request
 */
export function optionalFeature(feature: string) {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    if (!isFeatureEnabled(feature as any)) {
      console.warn(`Feature ${feature} requested but not enabled`);
    }
    next();
  };
}

/**
 * Attach enabled features to request for conditional rendering
 */
export function attachEnabledFeatures(req: Request, _res: Response, next: NextFunction): void {
  req.enabledFeatures = Object.entries(isFeatureEnabled as any)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      enabledFeatures?: string[];
    }
  }
}
