import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { telemetryService } from '../services/TelemetryService';

const router = Router();

// Submit feedback
router.post('/feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const { type, message, url, userAgent } = req.body;

    if (!type || !message) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: type and message',
      });
      return;
    }

    if (!['bug', 'feature', 'general'].includes(type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid feedback type. Must be one of: bug, feature, general',
      });
      return;
    }

    telemetryService.recordFeedback({
      userId: req.user.userId,
      type,
      message,
      url,
      userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Feedback recorded successfully',
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    telemetryService.trackEvent({
      eventName: 'feedback_submission_error',
      userId: req.user?.userId,
      properties: { error: String(error) },
      severity: 'error',
    });
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback',
    });
  }
});

// Get metrics (admin only for now)
router.get('/metrics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const metrics = telemetryService.getMetrics();
    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Metrics retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve metrics',
    });
  }
});

// Get events (admin only for now)
router.get('/events', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, eventName } = req.query;
    const events = telemetryService.getEvents({
      userId: userId as string,
      eventName: eventName as string,
    });

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Events retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve events',
    });
  }
});

// Get feedback (admin only for now)
router.get('/feedback', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const feedback = telemetryService.getFeedback({
      type: type as string,
    });

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error('Feedback retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve feedback',
    });
  }
});

export default router;
