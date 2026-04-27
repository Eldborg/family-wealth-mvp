const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  type?: 'page_view' | 'user_action' | 'feature_usage' | 'error';
}

class AnalyticsService {
  private isEnabled = true;

  async trackEvent(event: AnalyticsEvent) {
    if (!this.isEnabled) return;

    try {
      const eventData = {
        ...event,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      console.log('[ANALYTICS]', event.eventName, event.properties);

      await fetch(`${API_URL}/api/monitoring/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'general',
          message: `${event.eventName}: ${JSON.stringify(event.properties || {})}`,
          url: eventData.url,
          userAgent: eventData.userAgent,
        }),
      }).catch((err) => {
        console.error('Failed to send analytics:', err);
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  trackPageView(path: string, properties?: Record<string, any>) {
    this.trackEvent({
      eventName: 'page_view',
      properties: { path, ...properties },
      type: 'page_view',
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>) {
    this.trackEvent({
      eventName: `user_${action}`,
      properties,
      type: 'user_action',
    });
  }

  trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    this.trackEvent({
      eventName: `feature_${feature}`,
      properties,
      type: 'feature_usage',
    });
  }

  trackError(error: Error | string, context?: Record<string, any>) {
    this.trackEvent({
      eventName: 'error',
      properties: {
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'string' ? undefined : error.stack,
        ...context,
      },
      type: 'error',
    });
  }
}

export const analytics = new AnalyticsService();
