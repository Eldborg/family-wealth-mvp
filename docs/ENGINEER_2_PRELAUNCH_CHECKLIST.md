# Engineer #2 Pre-Launch Checklist

**Prepared for: Infrastructure/DevOps Engineer**  
**Date Prepared: April 27, 2026**  
**Critical Deadline: May 1, 2026**  
**Launch Date: May 6, 2026**

---

## 🎯 Your Mission (May 1-6)

Get Family Wealth MVP from development → production by May 6. Backend is production-ready. Your job is infrastructure, deployment, and operations.

**Timeline:**
- **Apr 28-30** (3 days): Make infrastructure decisions, provision resources
- **May 1** (Deadline): Deploy to staging, load test, security audit
- **May 2-5** (4 days): Hardening, monitoring setup, disaster recovery tests
- **May 6** (Launch): Monitor production 24/7

---

## 📋 Pre-Flight Decisions (Complete by EOD Apr 28)

### 1. Deployment Platform
**You must choose ONE:**

- [ ] **Railway.app** (Recommended - runbook ready)
  - Pros: Simple, integrated database, GitHub auto-deploy, affordable
  - Runbook: `docs/RAILWAY_DEPLOYMENT_RUNBOOK.md`
  - Setup time: ~2-3 hours

- [ ] **AWS (ECS + RDS + ElastiCache)**
  - Pros: Highly scalable, mature, many integrations
  - Setup time: ~8-12 hours
  - Requires: AWS account, IAM roles, VPC knowledge

- [ ] **Vercel (Frontend) + Custom Backend**
  - Pros: Vercel handles Next.js, you manage API backend
  - Setup time: ~6-8 hours
  - Requires: Two separate deployments, more complexity

- [ ] **Digital Ocean App Platform**
  - Pros: Simple, affordable, integrated PostgreSQL
  - Setup time: ~4-6 hours
  - Similar to Railway but less polished

**Recommendation:** Railway.app or DigitalOcean (simplicity). Avoid AWS unless you have experience.

---

### 2. Database Provider
**Choose ONE:**

- [ ] **Railway PostgreSQL** (Part of Railway platform)
  - Included in platform cost, backup included
  - Good for initial launch (500 users)

- [ ] **AWS RDS PostgreSQL** (If using AWS)
  - More powerful, better for scaling
  - Requires RDS configuration, backups, snapshots

- [ ] **Neon PostgreSQL** (Serverless alternative)
  - Scales automatically, pay-per-use
  - ~$5-50/month depending on usage

- [ ] **Self-managed** (NOT RECOMMENDED)
  - Too much operational overhead for beta

**Recommendation:** Railway or Neon (least operational overhead)

---

### 3. Email Service Provider
**Choose ONE:**

- [ ] **SendGrid** (Recommended)
  - $0-20/month, 100 free emails/day tier
  - Python library available, easy to integrate
  - Reputation: Excellent

- [ ] **Mailgun**
  - $5/month minimum, good for volume
  - SMTP integration straightforward
  - Reputation: Good

- [ ] **AWS SES**
  - $0.10 per 1000 emails
  - If you're already in AWS ecosystem
  - Has deliverability requirements

**Recommendation:** SendGrid (free tier works for beta)

---

### 4. Domain & DNS
**You need:**

- [ ] Register domain (familywealth.app or similar)
  - Registrar: GoDaddy, Namecheap, Google Domains
  - Cost: ~$12/year
  - Setup time: 15 minutes

- [ ] DNS records:
  - A record → your deployment platform IP
  - MX records → if using custom email domain
  - CNAME for www subdomain (if needed)

- [ ] SSL/TLS Certificate:
  - Let's Encrypt (free, auto-renew) - recommended
  - Platform usually handles this automatically

**Recommendation:** Simple single domain (no www alias needed)

---

### 5. Monitoring & Alerting
**Choose ONE (or combination):**

- [ ] **Platform-native** (Railway/DO have built-in)
  - Free or included with platform
  - Basic metrics (CPU, memory, errors)
  - Good for MVP

- [ ] **Datadog**
  - $15+/month
  - Comprehensive (logs, APM, dashboards)
  - More than needed for beta

- [ ] **Grafana + Prometheus**
  - Self-hosted, free but operational overhead
  - Not recommended for 5-person team

- [ ] **Sentry** (for error tracking)
  - $0-29/month
  - Integrates with backend for exception tracking
  - Highly recommended in addition to platform monitoring

**Recommendation:** Platform monitoring + Sentry (best ROI)

---

## 🚀 Day 1 Deployment (May 1)

### Morning: Infrastructure Provisioning

```
1. [ ] Platform account created
2. [ ] Production environment configured
3. [ ] Staging environment configured (read-only until 5 PM)
4. [ ] Database provisioned
   - [ ] Schema migrated (Prisma migrations)
   - [ ] Backups enabled (daily, 7-day retention)
5. [ ] Redis instance created
   - [ ] Password set
   - [ ] Connection tested
6. [ ] Email service configured
   - [ ] API key obtained
   - [ ] Sender email verified
7. [ ] All environment variables set in platform
   - Reference: .env.example in repo
   - Copy all REQUIRED vars
   - Set NODE_ENV=production
```

### Midday: Initial Deployment to Staging

```
1. [ ] GitHub repo connected to platform
2. [ ] CI/CD pipeline connected
3. [ ] Deploy to staging from main branch
4. [ ] Verify deployment successful
   - Check logs for errors
   - Health check: GET /health
5. [ ] Database migrations applied
   - Run: prisma migrate deploy (or platform equivalent)
6. [ ] Test basic endpoints
   - POST /api/auth/register (test)
   - POST /api/auth/login (test)
   - GET /api/goals (should require auth)
```

### Afternoon: Smoke Tests & Load Testing

```
1. [ ] Create test user account
   - Email: test@example.com
   - Password: Test123!@#
2. [ ] Test full registration flow
   - [ ] Register user
   - [ ] Verify email token generated (check DB)
   - [ ] User can login
   - [ ] JWT tokens issued
   - [ ] Refresh token works
3. [ ] Test rate limiting
   - [ ] Rapid login attempts blocked after 5
   - [ ] Rate limit headers present
4. [ ] Load test with k6 or Artillery
   - Target: 100 concurrent users (start small)
   - Duration: 2 minutes
   - Success if: p99 latency <2s, error rate <0.5%
5. [ ] Test email integration
   - Create user, check SendGrid logs
   - Verify email was sent
   - Verify token in email is valid
```

### Evening: May 1 Deadline Checkpoint

```
If everything passes:
✅ Code Ready
✅ Security Ready (all auth working)
✅ Infrastructure Ready
✅ Load Tested
→ CLEARED FOR PRODUCTION DEPLOYMENT

If issues found:
❌ Fix issues and retest
❌ Do NOT proceed to production with failures
```

---

## 🔒 Security Verification (May 1-2)

### Pre-Launch Security Checklist

```
Authentication & Authorization
- [ ] Passwords are hashed (never stored plaintext)
- [ ] JWT tokens have expiration (15m access, 7d refresh)
- [ ] Rate limiting active (5 req/5min on /login)
- [ ] Account lockout after failed attempts (or rate limit)
- [ ] Email verification tokens expire after 24 hours
- [ ] Logout revokes tokens (check Redis blacklist)

API Security
- [ ] Security headers present (curl -i GET / | grep X-)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security (HTTPS only)
- [ ] CORS configured correctly (only accepts localhost:3000 or your domain)
- [ ] No stack traces in error responses (500 error shows generic message)
- [ ] SQL injection impossible (using Prisma ORM - verified)

Data Security
- [ ] Database encrypted at rest (check platform settings)
- [ ] Database backups encrypted (check platform settings)
- [ ] Database password securely stored (NOT in .env or logs)
- [ ] Redis password set (NOT default "no password")
- [ ] HTTPS enforced (no HTTP redirects)

Secrets Management
- [ ] JWT_SECRET is random, 32+ characters
- [ ] SENDGRID_API_KEY never logged (check platform secrets)
- [ ] Database password never in code
- [ ] No API keys in error messages
- [ ] Secrets rotation plan documented (for May 6+)

Monitoring
- [ ] Error logging active
- [ ] Failed login attempts logged
- [ ] Password validation failures visible
- [ ] Rate limit violations logged
- [ ] Email service failures logged
```

### Security Command Checklist

```bash
# Test HTTPS
curl -I https://familywealth.app
# Should see: 200 OK, Strict-Transport-Security header

# Test security headers
curl -I https://familywealth.app
# Should see: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection

# Test password validation
curl -X POST https://familywealth.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","name":"Test"}'
# Should reject with 400 (invalid password)

# Test rate limiting
for i in {1..10}; do
  curl -X POST https://familywealth.app/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should block after 5 attempts (429 Too Many Requests)

# Test error handling
curl -X GET https://familywealth.app/api/goals/fake-id
# Should NOT show stack trace (generic 404 or 401)
```

---

## 📊 Staging Testing Checklist (May 2)

### Smoke Tests
```
User Flows:
- [ ] New user registration works end-to-end
- [ ] Email verification email sent
- [ ] User can verify email with token
- [ ] User can login with correct password
- [ ] User cannot login with wrong password
- [ ] Refresh token flow works
- [ ] Logout clears tokens
- [ ] Cannot reuse revoked token

Goal Management:
- [ ] Create goal with valid inputs
- [ ] Invalid inputs rejected (negative amounts, past dates)
- [ ] Add transaction to goal
- [ ] Progress updates correctly
- [ ] View goal list
- [ ] Edit goal
- [ ] Delete goal
- [ ] Transaction history displays

API:
- [ ] All endpoints responding (curl each one)
- [ ] Proper HTTP status codes (200, 201, 400, 401, 404)
- [ ] Error messages helpful (not generic)
- [ ] Rate limit headers present
```

### Performance Testing
```
k6 Script:
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
};

export default function() {
  let response = http.get('https://staging.familywealth.app/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}

Run: k6 run staging-test.js
Verify:
- [ ] No errors during load test
- [ ] p99 latency < 2 seconds
- [ ] Error rate < 0.5%
- [ ] Database doesn't run out of connections
```

---

## 🚀 Production Deployment (May 3-5)

### Production Environment Setup
```
1. [ ] Production platform environment created (read-only until cutover)
2. [ ] Production database provisioned (separate from staging)
3. [ ] Production Redis instance created
4. [ ] Production email service configured
5. [ ] Production domain DNS configured
6. [ ] SSL/TLS certificate provisioned
7. [ ] All environment variables set (copy from staging, verify each one)
8. [ ] Error tracking (Sentry) configured
9. [ ] Monitoring dashboards set up
10. [ ] Backup strategy implemented
    - [ ] Automated daily backups
    - [ ] 7-day retention minimum
    - [ ] Restore test passed
```

### Production Deployment Execution (May 5 Evening)
```
1. [ ] Final code review
   - [ ] All commits on main since staging test
   - [ ] No uncommitted changes
   - [ ] Version tagged (v1.0.0-beta)
2. [ ] Production environment switched to read-write
3. [ ] Deploy to production
4. [ ] Run production smoke tests
   - [ ] All endpoints responding
   - [ ] Health check returns 200
   - [ ] Database is accessible
   - [ ] Email service connected
5. [ ] Verify monitoring active
   - [ ] Dashboard showing traffic
   - [ ] Logs streaming to aggregator
   - [ ] Alerts configured
6. [ ] Team briefing (30 min before launch)
   - [ ] Deployment successful
   - [ ] Monitoring active
   - [ ] On-call rotation starts
   - [ ] Escalation procedures reviewed
```

---

## 🔧 Troubleshooting Quick Reference

### Database Connection Issues
```
Error: "Cannot connect to database"
Check:
1. DATABASE_URL is correct format
2. Database is running and accepting connections
3. Firewall allows connection from your IP
4. Database credentials are correct
5. Database name exists
```

### Email Service Issues
```
Error: "Failed to send email"
Check:
1. SENDGRID_API_KEY is valid
2. Sender email is verified in SendGrid
3. SendGrid IP not blocked by spam filter
4. Email address not in bounce list
```

### Rate Limiting Not Working
```
Issue: Rate limiting always returns 429
Check:
1. REDIS_URL is correct
2. Redis is running and accessible
3. Rate limit configuration in .env
4. Logs for "rate limit exceeded"
```

### Memory Issues Under Load
```
Issue: App crashes during load test
Check:
1. Database connection pool too small (increase if possible)
2. Redis connection pool too small
3. Node.js memory limit (increase if running in container)
4. Queries not using indexes (check database performance)
```

---

## 📞 After Launch Support

### May 6 - Launch Day Monitoring (24 Hours)
```
Hour 0-1: Critical monitoring
- [ ] Traffic flowing to production
- [ ] No 5xx errors
- [ ] Database responding
- [ ] Authentication working

Hour 1-6: Continued monitoring
- [ ] Error rate stable
- [ ] No database connection issues
- [ ] Email sending working
- [ ] Rate limiting not overly aggressive

Hour 6-24: Stabilization phase
- [ ] Monitor for memory leaks
- [ ] Check for slow database queries
- [ ] Validate backup completion
- [ ] Prepare incident response procedures
```

### On-Call Escalation (May 6+)
```
Severity 1 (Critical - Immediate Action):
- Authentication down
- Database down
- Data loss
- Security breach

Action:
1. Declare incident
2. Page on-call engineer
3. Start incident bridge (video call)
4. Begin investigation immediately
5. Keep CTO updated

Severity 2 (High - Within 1 Hour):
- API returning 500 errors
- Rate limiting too aggressive
- Email service down
- Performance degradation

Action:
1. Alert team
2. Begin investigation
3. Prepare hotfix if needed
4. Monitor resolution

Severity 3 (Medium - Within 4 Hours):
- Non-critical features broken
- Cosmetic bugs
- Minor performance issues
```

---

## 📚 Key Documentation for Reference

- **RAILWAY_DEPLOYMENT_RUNBOOK.md** - Step-by-step deployment guide
- **SECURITY_ENHANCEMENTS_SUMMARY.md** - What security features are already built in
- **SECURITY_CHECKLIST.md** - Full security audit checklist
- **BETA_LAUNCH_RUNBOOK.md** - Pre-launch procedures
- **.env.example** - All environment variables needed

---

## ✅ Success Criteria

You've succeeded when:
- [ ] Code deployed to production
- [ ] All 100 tests passing in CI/CD
- [ ] Database schema migrated and verified
- [ ] SSL/TLS working
- [ ] Email service verified
- [ ] Load test passed (100 concurrent users, <2s p99 latency)
- [ ] Security headers verified
- [ ] Monitoring active and alerting
- [ ] On-call rotation started
- [ ] No critical errors in first 24 hours

---

**Good luck! You've got this. The backend team has done the hard work. This is all about connecting the dots.** ✨
