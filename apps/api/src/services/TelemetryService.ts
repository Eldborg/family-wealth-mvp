interface Event {
  eventName: string;
  userId?: string;
  familyGroupId?: string;
  properties?: Record<string, any>;
  timestamp: Date;
  severity?: 'info' | 'warning' | 'error';
}

interface Feedback {
  userId: string;
  type: 'bug' | 'feature' | 'general';
  message: string;
  url?: string;
  timestamp: Date;
  userAgent?: string;
}

class TelemetryService {
  private events: Event[] = [];
  private feedback: Feedback[] = [];

  trackEvent(event: Omit<Event, 'timestamp'>) {
    this.events.push({
      ...event,
      timestamp: new Date(),
    });

    this.logEvent(event.eventName, event.severity || 'info', event.properties);
  }

  recordFeedback(fb: Omit<Feedback, 'timestamp'>) {
    this.feedback.push({
      ...fb,
      timestamp: new Date(),
    });

    console.log(`[FEEDBACK] ${fb.type.toUpperCase()}: ${fb.message}`);
  }

  getEvents(filters?: { userId?: string; familyGroupId?: string; eventName?: string }) {
    if (!filters) return this.events;

    return this.events.filter((event) => {
      if (filters.userId && event.userId !== filters.userId) return false;
      if (filters.familyGroupId && event.familyGroupId !== filters.familyGroupId) return false;
      if (filters.eventName && event.eventName !== filters.eventName) return false;
      return true;
    });
  }

  getFeedback(filters?: { userId?: string; type?: string }) {
    if (!filters) return this.feedback;

    return this.feedback.filter((item) => {
      if (filters.userId && item.userId !== filters.userId) return false;
      if (filters.type && item.type !== filters.type) return false;
      return true;
    });
  }

  getMetrics() {
    return {
      totalEvents: this.events.length,
      totalFeedback: this.feedback.length,
      eventsByName: this.getEventCounts(),
      errorCount: this.events.filter((e) => e.severity === 'error').length,
      feedbackByType: this.getFeedbackCounts(),
      lastEvents: this.events.slice(-10),
    };
  }

  private getEventCounts() {
    const counts: Record<string, number> = {};
    this.events.forEach((event) => {
      counts[event.eventName] = (counts[event.eventName] || 0) + 1;
    });
    return counts;
  }

  private getFeedbackCounts() {
    const counts: Record<string, number> = {};
    this.feedback.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }

  private logEvent(eventName: string, severity: string, properties?: Record<string, any>) {
    const timestamp = new Date().toISOString();
    const propsStr = properties ? JSON.stringify(properties) : '';
    console.log(`[${severity.toUpperCase()}] ${timestamp} - ${eventName} ${propsStr}`);
  }
}

export const telemetryService = new TelemetryService();
