# Beta Monitoring & Iteration System

## Overview

This document describes the monitoring and iteration system implemented for the Family Wealth MVP beta. The system tracks user interactions, errors, and collects feedback to help identify issues and iterate on the product.

## Components

### Backend Telemetry Service

**File**: `apps/api/src/services/TelemetryService.ts`

The TelemetryService tracks all user actions and events in the system:

- **Events**: Tracks user actions like goal creation, updates, transactions
- **Error Tracking**: Automatically captures and logs errors from API endpoints
- **Feedback**: Collects structured user feedback (bugs, feature requests, general feedback)
- **Metrics**: Provides aggregated metrics for monitoring

#### Key Methods

- `trackEvent()`: Record a user action or event
- `recordFeedback()`: Record user feedback
- `getMetrics()`: Get aggregated metrics
- `getEvents()`: Query events with filters
- `getFeedback()`: Query feedback with filters

### Monitoring API Endpoints

**File**: `apps/api/src/routes/monitoring.ts`

#### POST /api/monitoring/feedback
Submit user feedback

```bash
curl -X POST http://localhost:3001/api/monitoring/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "type": "bug|feature|general",
    "message": "User feedback text",
    "url": "https://app.example.com/goals",
    "userAgent": "Mozilla/5.0..."
  }'
```

#### GET /api/monitoring/metrics
Get system metrics and aggregated data

```bash
curl http://localhost:3001/api/monitoring/metrics
```

Response includes:
- Total events count
- Events by name
- Error count
- Feedback by type
- Last 10 events

#### GET /api/monitoring/events
Query events with optional filters

```bash
curl "http://localhost:3001/api/monitoring/events?userId=123&eventName=goal_created"
```

#### GET /api/monitoring/feedback
Query feedback with optional type filter

```bash
curl "http://localhost:3001/api/monitoring/feedback?type=bug"
```

### Client-Side Analytics

**File**: `apps/web/app/lib/analytics.ts`

The analytics service automatically tracks user actions and errors on the frontend.

#### Tracking Methods

```typescript
import { analytics } from '@/app/lib/analytics';

// Track a page view
analytics.trackPageView('/goals', { goalCount: 5 });

// Track a user action
analytics.trackUserAction('clicked_create_goal');

// Track feature usage
analytics.trackFeatureUsage('goal_created', {
  category: 'savings',
  targetAmount: 5000
});

// Track errors
analytics.trackError(new Error('Failed to load'), { context: 'fetchGoals' });
```

### Feedback Form Component

**File**: `apps/web/app/components/FeedbackForm.tsx`

A modal form component that allows users to submit feedback directly from the app.

- Types: Bug Report, Feature Request, General Feedback
- URL and User Agent automatically captured
- Success/error states displayed to user
- Integrated into Goals page

## Tracked Events

### Goals Feature

- `goals_listed` - User viewed their goals list (property: goalCount)
- `goal_created` - New goal created (properties: category, targetAmount)
- `goal_updated` - Goal modified (properties: goalId, fields changed)
- `goal_deleted` - Goal deleted (property: goalId)
- `transaction_added` - Money added to goal (properties: amount, goalId)
- `transaction_deleted` - Transaction removed (properties: goalId, transactionId)

### User Actions

- `user_clicked_create_goal` - Create goal button clicked
- `user_clicked_feedback_button` - Feedback button clicked
- `user_viewed_goal_detail` - User viewed goal details (properties: goalId, onTrack, progressPercentage)
- `user_feedback_submitted` - Feedback form submitted (properties: type, messageLength)

### Errors

- `*_error` - Errors from API endpoints with error details
- `error` - Client-side errors with stack trace

## Integration Points

### Backend Routes

All goals API endpoints automatically track events:
- GET /api/goals
- POST /api/goals
- GET /api/goals/:goalId
- PATCH /api/goals/:goalId
- DELETE /api/goals/:goalId
- POST /api/goals/:goalId/transactions
- GET /api/goals/:goalId/transactions
- DELETE /api/goals/:goalId/transactions/:transactionId

### Frontend Pages

- Goals page (/goals)
- Goal detail page (/goals/:goalId)

## Viewing Metrics

### During Development

The metrics are logged to the console in both frontend and backend:
- Backend: Check server logs for `[INFO]`, `[WARNING]`, `[ERROR]` messages
- Frontend: Check browser console for `[ANALYTICS]` messages

### Via API

Hit the monitoring endpoints directly:

```bash
# View all metrics
curl http://localhost:3001/api/monitoring/metrics

# View specific events
curl "http://localhost:3001/api/monitoring/events?eventName=goal_created"

# View feedback
curl "http://localhost:3001/api/monitoring/feedback?type=bug"
```

## Next Steps for Iteration

Based on the collected data, you can:

1. **Identify Feature Usage Patterns**: See which goals are created most often, what categories are popular
2. **Track Conversion**: Monitor how many users complete the goal creation flow
3. **Error Detection**: Find issues causing errors and prioritize fixes
4. **User Feedback**: Collect and analyze feedback for feature requests and bug reports
5. **Performance**: Track patterns in feature usage to identify optimization opportunities

## Data Privacy

- All feedback is stored in-memory (not persisted to database)
- URLs and user agents are captured for context
- User IDs are included for correlation
- No sensitive goal data is stored in telemetry

## Future Enhancements

1. **Persistent Storage**: Save events and feedback to database
2. **Analytics Dashboard**: Create a dedicated UI for viewing metrics
3. **Real-time Alerts**: Alert on error spikes or important events
4. **Export**: Export data for analysis in external tools
5. **Cohort Analysis**: Analyze user segments and behaviors
6. **Performance Metrics**: Track API response times and frontend performance
