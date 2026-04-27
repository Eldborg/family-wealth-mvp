import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth';
import goalsRouter from './routes/goals';
import monitoringRouter from './routes/monitoring';
import { handleAuthError } from './middleware/auth';
import { apiRateLimit, cleanupRateLimit } from './middleware/rateLimit';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
app.use(apiRateLimit()); // General API rate limiting
cleanupRateLimit(); // Cleanup old entries periodically

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api', (_req, res) => {
  res.json({ message: 'Family Wealth MVP API' });
});

// Auth routes
app.use('/api/auth', authRouter);

// Goals routes
app.use('/api/goals', goalsRouter);

// Monitoring routes
app.use('/api/monitoring', monitoringRouter);

// Auth error handling middleware
app.use(handleAuthError);

// Generic error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || 500;
  const errorMessage = isProduction ? 'Internal server error' : (err.message || 'Internal server error');

  res.status(statusCode).json({
    success: false,
    error: errorMessage,
    ...(process.env.NODE_ENV === 'development' && { details: err.stack }),
  });
});

// Start server
app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
