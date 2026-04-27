# Railway.app Deployment Runbook
## BER-32 CONTINGENCY: May 6 Launch

**Status:** Planning Phase  
**Timeline:** Apr 28 - May 6, 2026  
**Scope:** Minimal viable deployment (Database + API + Frontend + Critical Security)  
**Success Criteria by May 5 EOD:** ✓ API on Railway | ✓ DB Synced | ✓ HTTPS | ✓ Rate Limiting | ✓ CORS | ✓ Monitoring | ✓ Rollback Plan  
**On-Call:** May 6-7 (Engineer + CTO)

---

## 1. PRE-DEPLOYMENT PLANNING (Apr 28)

### 1.1 Infrastructure Checklist
- [ ] Create Railway.app account / access existing one
- [ ] Verify Railway PostgreSQL support
- [ ] Estimate costs for minimal deployment
- [ ] Document Railway region selection (latency considerations)

### 1.2 Code Readiness Checklist
- [ ] Current branch deployable and tested locally
- [ ] All environment variables documented
- [ ] Database migrations up-to-date
- [ ] Build process verified (npm run build)
- [ ] No hardcoded credentials in code

### 1.3 Security Planning
- [ ] Rate limiting strategy defined (express-rate-limit or similar)
- [ ] CORS configuration ready for production domain
- [ ] HTTPS/TLS enforcement plan (Railway auto-manages this)
- [ ] JWT secret generation plan
- [ ] Database backup/restore plan

---

## 2. RAILWAY INFRASTRUCTURE SETUP (Apr 29-30)

### 2.1 Create Railway PostgreSQL Database

**Steps:**
1. Log in to Railway dashboard: https://railway.app/dashboard
2. Create new project: "family-wealth-mvp-prod"
3. Add PostgreSQL service to project
4. Configure:
   - Database: `family_wealth_prod`
   - Username: `postgres` (Railway default)
   - Auto-generate password (Railway manages)
   - Version: PostgreSQL 15 (matches local dev)
5. Save generated DATABASE_URL connection string

**Validation:**
```bash
# Test connection locally first
psql "$DATABASE_URL" -c "SELECT version();"
```

### 2.2 Create API Service (Express Backend)

**Steps:**
1. In Railway project, add new service: "api"
2. Connect to GitHub repo (family-wealth-mvp)
3. Configure build settings:
   - Build command: `npm run build`
   - Start command: `cd apps/api && npm run start`
   - Root directory: `.` (monorepo)
4. Set environment variables (see Section 3.1)
5. Assign Railway-generated domain (auto-HTTPS)

### 2.3 Create Web Service (Next.js Frontend)

**Steps:**
1. In Railway project, add new service: "web"
2. Connect to GitHub repo
3. Configure build settings:
   - Framework: Next.js (Railway auto-detects)
   - Build command: `npm run build`
   - Start command: `cd apps/web && npm run start`
   - Root directory: `.` (monorepo)
4. Set environment variables (see Section 3.1)
5. Assign custom domain (if available) or use Railway subdomain

---

## 3. ENVIRONMENT CONFIGURATION (Apr 29-30)

### 3.1 Required Environment Variables

#### For API Service
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=<Railway PostgreSQL connection string>
JWT_SECRET=<generated 32+ char random string>
JWT_EXPIRES_IN=7d
REDIS_URL=<Railway Redis connection string OR in-memory fallback>
NEXT_PUBLIC_API_URL=https://<api-domain.railway.app>
CORS_ORIGIN=https://<web-domain.railway.app>
LOG_LEVEL=info
```

#### For Web Service
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://<api-domain.railway.app>
```

### 3.2 Secret Generation

```bash
# Generate JWT_SECRET (on local machine, then paste to Railway)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Environment Variable Setup in Railway

1. Navigate to each service in Railway dashboard
2. Go to "Variables" tab
3. Add all variables from Section 3.1
4. Use Railway's secret feature for sensitive values (JWT_SECRET, DATABASE_URL)
5. Redeploy services after adding variables

---

## 4. DATABASE MIGRATION & SETUP (May 1)

### 4.1 Run Migrations in Production

**Option A: Automated (Preferred)**
1. Add migration task to API service startup:
   - Modify `package.json` start script to run migrations before starting server
   - Add `npm run db:migrate --environment production` before server start

**Option B: Manual (If Automated Fails)**
```bash
# SSH into Railway API pod and run manually
cd apps/api
npx prisma migrate deploy --environment production
```

### 4.2 Database Validation
```bash
# Verify tables created
psql "$DATABASE_URL" -c "\dt"

# Check schema version
psql "$DATABASE_URL" -c "SELECT * FROM _prisma_migrations;"
```

### 4.3 Optional: Seed Data
```bash
# Only if needed for launch
npm run db:seed --environment production
```

---

## 5. SECURITY IMPLEMENTATION (May 1-2)

### 5.1 Rate Limiting (API)

**Implementation:** Add to `apps/api/src/index.ts`

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/health'), // Skip health checks
});

app.use('/api/', limiter);
```

**Testing:**
```bash
# Verify rate limiting headers
curl -i https://api-domain.railway.app/api/auth/login
# Should see: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset headers
```

### 5.2 CORS Configuration (API)

**Implementation:** `apps/api/src/middleware/cors.ts`

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
```

**Testing:**
```bash
curl -i -H "Origin: https://web-domain.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  https://api-domain.railway.app/api/auth/login
```

### 5.3 HTTPS/TLS

**Status:** ✓ Automatic  
Railway auto-provisions SSL certificates for all deployed services. No manual configuration needed.

**Verification:**
```bash
curl -i https://api-domain.railway.app/health
# Should return 200 OK with valid certificate
```

### 5.4 HSTS Header (API)

**Implementation:** `apps/api/src/middleware/security.ts`

```typescript
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## 6. MONITORING & OBSERVABILITY (May 2-3)

### 6.1 Basic Monitoring Setup

**Railway Native:**
- Dashboard shows CPU, Memory, Disk usage per service
- Build/deploy logs visible in "Deployments" tab
- Service logs visible in "Logs" tab

**Recommended:**
1. Set up Railway alerts:
   - High memory usage (>80%)
   - Service restarts
   - Build failures

2. Add application logging:
   ```typescript
   // apps/api/src/middleware/logging.ts
   import winston from 'winston';
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
     ],
   });
   ```

3. Health check endpoint:
   ```typescript
   app.get('/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date() });
   });
   ```

### 6.2 Database Monitoring
- Railway PostgreSQL dashboard shows connections, disk usage, query performance
- Check "Database" tab in Railway for metrics

---

## 7. TESTING & VALIDATION (May 3-4)

### 7.1 Smoke Tests

**Frontend (web-domain.railway.app):**
- [ ] Page loads without errors
- [ ] Can navigate to login/signup
- [ ] API calls reach backend (check DevTools Network tab)

**API (api-domain.railway.app):**
- [ ] GET /health returns 200 OK
- [ ] POST /api/auth/signup creates user (test payload)
- [ ] Database queries work (verify in logs)
- [ ] CORS headers present in responses
- [ ] Rate limiting works (send >100 requests in 15 min)

**Security:**
- [ ] HTTPS enforced (http:// redirects to https://)
- [ ] HSTS headers present
- [ ] No credentials in logs
- [ ] Rate limiting active (check headers)

### 7.2 Integration Tests

```bash
# Run tests locally against production Railway URLs
NEXT_PUBLIC_API_URL=https://api-domain.railway.app npm run test
```

### 7.3 Performance Check

```bash
# Basic latency check
curl -w "Response time: %{time_total}s\n" \
  https://api-domain.railway.app/health
```

---

## 8. ROLLBACK PLAN (May 3-4)

### 8.1 Pre-Launch Rollback Preparation

**Keep Previous Version Deployed:**
1. Do NOT delete current production deployment
2. Maintain ability to revert to previous version
3. Document current deployed commit SHA

**Rollback Steps (if critical issue found before May 6):**

1. **Fast Rollback (same environment):**
   ```bash
   # In Railway dashboard:
   # 1. Go to the problematic service (api or web)
   # 2. Click "Deployments" tab
   # 3. Find the previous successful deployment
   # 4. Click "Redeploy" button
   # Deployment reverted in ~2-3 minutes
   ```

2. **Database Rollback (if migration failed):**
   ```bash
   # SSH into Railway API pod
   cd apps/api
   npx prisma migrate resolve --rolled-back <migration-name>
   # Re-run correct migration
   npx prisma migrate deploy
   ```

3. **Environment Variable Rollback:**
   - Change problematic variable back to previous value
   - Redeploy service
   - Verify in logs that correct value is used

### 8.2 On-Call Response Plan (May 6-7)

**Primary:** Engineer (current)  
**Secondary:** CTO (backup)

**Incident Response SLA:**
- Critical (service down): Response in 5 min, resolution target 30 min
- High (feature broken): Response in 15 min, resolution target 1 hour
- Medium (degraded): Response in 1 hour

**Escalation Path:**
1. Monitor logs in Railway dashboard
2. Check CPU/memory metrics
3. Review recent deployments
4. Use rollback plan above if needed
5. Contact CTO if unable to resolve within 30 min

---

## 9. DEPLOYMENT CHECKLIST (May 5 EOD)

### Pre-Deployment
- [ ] All environment variables set in Railway
- [ ] Database migrations applied and validated
- [ ] Security headers implemented and tested
- [ ] Rate limiting implemented and tested
- [ ] CORS configured for production domain
- [ ] Rollback plan documented and tested
- [ ] Monitoring dashboard accessible
- [ ] Health check endpoint working
- [ ] Load tested locally (npm run load-test)
- [ ] Code review completed

### Deployment
- [ ] Latest main branch code builds locally
- [ ] No deployment secrets hardcoded
- [ ] All tests passing
- [ ] Build artifacts generated successfully

### Post-Deployment Validation
- [ ] Frontend loads without errors
- [ ] API responds to requests
- [ ] Database connections successful
- [ ] HTTPS working
- [ ] Rate limiting headers present
- [ ] CORS headers present
- [ ] Health check endpoint returns 200 OK
- [ ] Application logs show no critical errors
- [ ] Monitoring dashboard shows healthy metrics

---

## 10. RESOURCES & REFERENCES

### Railway Documentation
- [Railway Docs](https://docs.railway.app)
- [Next.js Deployment](https://docs.railway.app/guides/nextjs)
- [Express Deployment](https://docs.railway.app/guides/express)
- [PostgreSQL Setup](https://docs.railway.app/guides/postgresql)

### Project Documentation
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Monitoring Guide](./MONITORING.md)

### Commands Reference
```bash
# Build all apps
npm run build

# Start API locally (before deploying)
cd apps/api && npm run start

# Start Frontend locally
cd apps/web && npm run start

# Check database migrations
cd apps/api && npx prisma migrate status

# View logs (Railway)
railway logs --service api
railway logs --service web

# Connect to production database (local)
psql "$DATABASE_URL"
```

---

## 11. POST-LAUNCH FOLLOWUP (May 8+)

- [ ] Monitor error rates and performance metrics
- [ ] Gather user feedback
- [ ] Document any issues encountered
- [ ] Plan improvements for next release
- [ ] Schedule post-mortem if any incidents occurred
- [ ] Update this runbook with lessons learned

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-27  
**Next Review:** 2026-05-06 (Post-Launch)  
**Owner:** Full-Stack Engineer (BER-32)
