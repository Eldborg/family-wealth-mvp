# Railway.app Deployment Runbook

**Launch Date:** May 6, 2026  
**Deployment Window:** May 1-5, 2026  
**Status:** In Development (Awaiting Tech Stack Confirmation)

---

## 1. Pre-Deployment Checklist (Apr 28-30)

### 1.1 Environment Setup
- [ ] Railway.app account created
- [ ] Project created on Railway
- [ ] Team members invited (CTO + engineer)
- [ ] Staging environment configured
- [ ] Production environment configured (read-only until May 5)

### 1.2 Code Readiness
- [ ] All code committed to GitHub and tested
- [ ] Environment variables documented (list what needs Railway secrets)
- [ ] Database schema finalized
- [ ] API endpoints tested locally
- [ ] No hard-coded credentials in codebase

### 1.3 Data Migration Planning
- [ ] Data export strategy documented (source → Railway)
- [ ] Data validation plan (row counts, checksums)
- [ ] Rollback data location identified
- [ ] Data migration script prepared (if needed)
- [ ] Migration estimated time calculated

### 1.4 Infrastructure as Code
- [ ] railway.json or Procfile configured
- [ ] Environment variables exported to Railway
- [ ] Database connection string prepared
- [ ] Redis/cache config prepared (if needed)

---

## 2. Deployment Steps (May 1-5)

### 2.1 Staging Deployment (May 1-2)

**Objective:** Test full deployment in Railway staging environment

```bash
# Step 1: Deploy to staging
- Push code to GitHub (if final changes)
- Connect GitHub repo to Railway
- Select staging branch
- Deploy to Railway staging

# Step 2: Run smoke tests
- Test user registration (POST /api/auth/register)
- Test user login (POST /api/auth/login)
- Test goal creation (POST /api/goals)
- Test goal retrieval (GET /api/goals)
- Verify API rate limiting active
- Verify HTTPS working

# Step 3: Database verification
- Connect to Railway PostgreSQL
- Verify schema matches codebase
- Run data migration script (if applicable)
- Verify row counts (compare with backup)
```

**Success Criteria:**
- ✅ All smoke tests pass
- ✅ No 5xx errors in logs
- ✅ Response times < 500ms
- ✅ Database synced correctly

**If Issues Detected:**
- Rollback staging to previous working state
- Fix code locally
- Re-deploy to staging
- Re-test

### 2.2 Production Deployment (May 3-5)

**Objective:** Deploy to production with zero downtime

```bash
# Step 1: Final pre-prod checks
- Run full smoke test suite one more time
- Verify all team members have production access (read-only)
- Confirm incident response plan (both engineers aware)
- Set up monitoring dashboard

# Step 2: Deploy to production
- Connect production environment in Railway
- Select main branch
- Set environment variables for production
- Deploy production

# Step 3: Verify production
- Hit production API endpoints
- Verify HTTPS certificate
- Check rate limiting active
- Monitor error logs (first 5 minutes)
```

**Success Criteria:**
- ✅ Production API responding
- ✅ No auth errors for existing users
- ✅ Goals API working
- ✅ Monitoring dashboard showing data
- ✅ Error rate < 0.1%

**If Critical Issue Detected:**
- Immediate rollback to last working build
- Diagnose issue (use logs)
- Fix code locally
- Re-deploy

---

## 3. Data Migration (Conditional)

### 3.1 If Starting Fresh
- Create new PostgreSQL database in Railway
- Deploy schema from migrations
- Start with empty data (no migration needed)

### 3.2 If Migrating Existing Data
- [ ] Export data from current deployment (SQL dump)
- [ ] Import SQL dump to Railway PostgreSQL
- [ ] Validate row counts match
- [ ] Run data integrity checks (no orphaned records)
- [ ] Test critical queries (user login, goal fetch)

**Data Validation Script (Template):**
```sql
-- Verify no data loss
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as goal_count FROM goals;
SELECT COUNT(*) as transaction_count FROM transactions;

-- Verify constraints still enforced
SELECT * FROM goals WHERE user_id NOT IN (SELECT id FROM users);
```

---

## 4. Secrets & Environment Variables

### 4.1 Railway Secrets Configuration

Create in Railway dashboard → Project Settings → Variables:

| Variable | Source | Value | Notes |
|----------|--------|-------|-------|
| `DATABASE_URL` | Railway PostgreSQL | `postgresql://...` | Auto-provided by Railway |
| `JWT_SECRET` | Copy from .env | `[from .env]` | CRITICAL: Secure value |
| `JWT_EXPIRES_IN` | .env | `7d` | Match current config |
| `NODE_ENV` | Production | `production` | For optimization |
| `LOG_LEVEL` | Set for prod | `info` (not debug) | Reduce noise |
| `PORT` | Let Railway assign | Remove hardcoded port | Railway handles this |

### 4.2 Verification
- [ ] All secrets copied to Railway (not in code)
- [ ] No test values in production
- [ ] API can connect to database using DATABASE_URL

---

## 5. Monitoring & Alerting (May 6 Launch)

### 5.1 Critical Metrics to Monitor
- API response time (target: < 500ms, alert > 1000ms)
- Error rate (target: < 0.1%, alert > 1%)
- Database connection pool (target: < 80% used)
- CPU usage (target: < 70%, alert > 85%)
- Memory usage (target: < 75%, alert > 90%)

### 5.2 Railway Monitoring Setup
- [ ] Enable Railway metrics in dashboard
- [ ] Create alerts for critical metrics
- [ ] Set up log aggregation
- [ ] Configure email/Slack alerts (if available)

### 5.3 Basic Monitoring Dashboard
```
Dashboard: May 6 Launch Monitoring

Live Metrics:
- API Status: [Green/Red]
- Response Time: [X ms]
- Error Rate: [X%]
- Database: [Connected/Disconnected]
- Memory: [X MB / Y MB]

Recent Errors:
- [Error logs, last 20 minutes]

Actions Available:
- Restart API
- View logs
- Rollback (if button available)
```

---

## 6. Rollback Procedure (If Needed)

### 6.1 Immediate Rollback (May 1-5)
If critical issue detected during deployment:

```bash
# Step 1: Stop current deployment
- Navigate to Railway dashboard
- Find deployment
- Click "Rollback" or "Stop Deployment"

# Step 2: Rollback to previous build
- Select last known good deployment
- Confirm rollback
- Wait for Railway to redeploy

# Step 3: Verify previous version working
- Run smoke tests
- Check logs for errors
```

### 6.2 During Launch (May 6)
If production issue occurs on launch day:

```bash
# Step 1: Immediate notification
- Alert: CTO + current engineer
- Incident channel: [TBD]
- Impact: How many users affected?

# Step 2: Diagnosis (3 min)
- Check Railway logs for error patterns
- Determine: Code issue? Database issue? Infrastructure issue?

# Step 3: Decision
- Fix small issue (code hotfix) → Re-deploy (10 min)
- Large issue (data corruption) → Rollback to previous (5 min)
- Unknown → Rollback immediately, investigate offline

# Step 4: Communication
- Post incident status to [team channel]
- Provide ETA for fix/rollback
```

**Rollback Triggers (Auto-decide to rollback):**
- ❌ 5xx errors > 10% for 2 consecutive minutes
- ❌ Database connection failures
- ❌ API not responding within 30 seconds
- ❌ Authentication system down

**Escalation Path:**
1. CTO + Engineer attempt fix (5 min window)
2. If no resolution → Automatic rollback to last build
3. If issue persists after rollback → CEO notification + incident review

---

## 7. Smoke Test Checklist (Run Before May 6 Launch)

### 7.1 API Health
```bash
curl -X GET https://api.example.com/health
# Expected: {"status":"ok","timestamp":"2026-05-06T..."}
```

### 7.2 Authentication Flow
```bash
# Register
POST /api/auth/register
{"email":"test@test.com","password":"Test123!","name":"Test User"}
# Expected: 201 Created + JWT tokens

# Login
POST /api/auth/login
{"email":"test@test.com","password":"Test123!"}
# Expected: 200 OK + JWT tokens

# Get Profile
GET /api/auth/me (with auth token)
# Expected: 200 OK + user object
```

### 7.3 Goals API
```bash
POST /api/goals
{"title":"Save $10K","targetAmount":10000}
# Expected: 201 Created

GET /api/goals
# Expected: 200 OK + list of goals
```

### 7.4 Rate Limiting
```bash
# Send 100 requests rapidly
for i in {1..100}; do curl -X GET https://api.example.com/health; done
# Expected: After 50 requests (or configured limit), get 429 Too Many Requests
```

### 7.5 Security
```bash
# HTTPS verification
curl -I https://api.example.com/health
# Expected: HTTP/2 200, not HTTP 200

# No hardcoded secrets in response
curl -X GET https://api.example.com/health
# Expected: No JWT tokens, database URLs, or API keys in response
```

---

## 8. Incident Response Plan (May 6-7)

### 8.1 On-Call Setup
**Team:**
- CTO: Primary on-call
- Current Engineer: Secondary on-call
- Incident Channel: [Slack channel TBD]

**Response Time Targets:**
- P1 (API down): < 5 min
- P2 (High error rate): < 15 min
- P3 (Degraded): < 30 min

### 8.2 Incident Response Flow

1. **Detect Issue** (Monitoring alert or user report)
   - Alert fires in Railway dashboard
   - Team member notices 5xx errors

2. **Acknowledge** (< 2 min)
   - CTO/Engineer confirms issue is real
   - Post to incident channel: "Investigating [issue type]"

3. **Diagnose** (< 5 min)
   - Check Railway logs for error patterns
   - Determine scope: API? Database? Authentication?
   - Check recent deployments: Was this working yesterday?

4. **Communicate** (Ongoing)
   - Update incident channel every 5 min with status
   - If > 5 min: Prepare rollback
   - If > 15 min: Escalate to CEO

5. **Resolve** (< 30 min target)
   - Option A: Hotfix (code change + re-deploy)
   - Option B: Rollback (revert to last known good)
   - Option C: Mitigation (disable feature, reduce load)

6. **Verify** (< 5 min after resolution)
   - Run smoke tests
   - Monitor error rate for 10 minutes
   - Post "All clear" to incident channel

### 8.3 Common Issues & Solutions

| Issue | Symptom | Diagnosis | Solution |
|-------|---------|-----------|----------|
| **Database Connection Lost** | 500 errors on all endpoints | Check Railway PostgreSQL logs | Restart database or rollback |
| **Memory Leak** | Increasing memory, then OOM | Check application logs | Restart API or investigate code leak |
| **Authentication Failing** | 401 errors on login | Check JWT_SECRET mismatch | Verify secrets in Railway vs code |
| **Rate Limiting Too Strict** | Valid users getting 429 | Check rate limit config | Adjust in code + re-deploy OR rollback |
| **High Latency** | Requests timeout | Check database queries | Add index or scale database |

---

## 9. Post-Launch Review (May 7)

### 9.1 Success Criteria Check
- ✅ API up for 24+ hours without downtime
- ✅ No critical incidents
- ✅ All users able to register/login/create goals
- ✅ Error rate < 0.5%
- ✅ Response times stable (no degradation)

### 9.2 Lessons Learned
- What went well?
- What was stressful?
- What should we do differently next launch?

### 9.3 Follow-Up Tasks
- [ ] Document any issues found + fixes
- [ ] Update runbook with lessons learned
- [ ] Plan Engineer #2 hiring (infrastructure engineer)
- [ ] Plan next feature sprint

---

## 10. Deployment Team Contacts

| Role | Name | Contact | On-Call May 6? |
|------|------|---------|---|
| CTO | [TBD] | [TBD] | ✅ Yes |
| Engineer | [TBD] | [TBD] | ✅ Yes |
| CEO | [TBD] | [TBD] | Escalation only |

---

## Appendix: Quick Reference

### Railway.app Key Links
- Dashboard: https://railway.app/dashboard
- Logs: Railway Dashboard → Project → View Logs
- Metrics: Railway Dashboard → Project → Metrics
- Settings: Railway Dashboard → Project → Settings

### PostgreSQL Commands (if needed)
```bash
# Connect to Railway PostgreSQL
psql postgresql://[user]:[pass]@[host]:[port]/[database]

# Common queries
\dt                    -- List tables
SELECT COUNT(*) FROM users;  -- Count users
```

### Troubleshooting Commands
```bash
# Test API
curl -X GET https://api.example.com/health

# Check logs on Railway
# Dashboard → Logs tab → Search for errors

# Restart deployment
# Dashboard → Deployments → [Latest] → Restart
```

---

**Last Updated:** Apr 27, 2026 (Draft - Awaiting Tech Stack Confirmation)  
**Owner:** CTO  
**Next Review:** May 1, 2026 (Pre-deployment final check)
