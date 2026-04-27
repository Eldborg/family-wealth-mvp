import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

interface HealthCheck {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  checks: {
    api: 'ok' | 'error';
    database: 'ok' | 'error';
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
}

const startTime = Date.now();

router.get('/', async (_, res: Response<HealthCheck>) => {
  const checks: HealthCheck['checks'] = {
    api: 'ok',
    database: 'ok',
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
  };

  let status: 'ok' | 'degraded' | 'error' = 'ok';

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    checks.database = 'error';
    status = 'degraded';
  }

  // Check memory
  const memUsage = process.memoryUsage();
  checks.memory = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
  };

  if (checks.memory.percentage > 90 && status === 'ok') {
    status = 'degraded';
  }

  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const statusCode = status === 'ok' ? 200 : status === 'degraded' ? 503 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    uptime,
    checks,
  });
});

export default router;
