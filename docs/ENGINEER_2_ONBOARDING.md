# Engineer #2 Onboarding Checklist (May 1 Morning)

**Welcome to the team!** You're joining right as we're launching Family Wealth MVP for public beta with 500+ users in 5 days. Here's what you need to know and do on day 1.

## Immediate Context (First 30 minutes)

1. **Repository Access**
   - Clone: `git clone https://github.com/anthropics/family-wealth-mvp.git`
   - Create .env.production file with credentials from CTO
   - Verify you can push to main branch (CI/CD pipeline will be your testing ground)

2. **Team Sync** (30-min call with CTO + Backend Engineer)
   - Ask: What's blocking launch that only you can unblock?
   - Ask: What's your recommendation for production infrastructure? (Railway vs Render vs Vercel)
   - Ask: What's the current status of security audit?
   - Ask: Any incidents from staging deployment?
   - Clarify: Who is on-call during launch? What's the escalation path?

3. **Critical Docs to Read** (1 hour)
   - **BETA_LAUNCH_PLAN.md** - Full requirements and deadlines
   - **SECURITY_CHECKLIST.md** - All security items (mark done/pending)
   - **BETA_LAUNCH_RUNBOOK.md** - Pre-launch verification procedures
   - **MONITORING.md** - Telemetry and monitoring setup

## Priority Tiers (What to do first)

### TIER 1: Production Deployment (Must complete by May 1, 5 PM)

**Deadline**: TODAY, by 5 PM or earliest possible

**Steps**:
1. [ ] Choose platform (Railway.app recommended - fastest setup)
   - Estimated time: 30 min decision + call with CTO
   
2. [ ] Deploy backend API
   - Build Docker image for Express.js app
   - Configure environment variables in production
   - Test API endpoints on staging URL
   - Estimated time: 2 hours
   
3. [ ] Deploy frontend (Next.js)
   - Deploy to Vercel if using Railway for backend (simpler)
   - Configure NEXT_PUBLIC_API_URL pointing to production API
   - Test 3 core flows: signup → create goal → view goal
   - Estimated time: 1 hour
   
4. [ ] Set up PostgreSQL database
   - Provision managed PostgreSQL (Railway includes this)
   - Run migrations: `npm run db:migrate --env=production`
   - Verify schema matches development
   - Test database connections under load
   - Estimated time: 1 hour

5. [ ] Configure DNS and HTTPS
   - Point domain to production
   - Obtain SSL certificate (auto with Railway/Vercel)
   - Verify HTTPS works end-to-end
   - Estimated time: 30 min

**Verification**: Can you sign up, create a goal, and view it in production? YES = move to Tier 2

### TIER 2: Critical Security Items (Must complete by May 1, 11 PM)

**Deadline**: TODAY, by 11 PM

From SECURITY_CHECKLIST.md, prioritize these critical items:
1. [ ] **Rate limiting** on `/api/auth/*` endpoints
   - Use express-rate-limit package
   - Config: 5 failed attempts = 15 min lockout
   - Estimated time: 1 hour
   
2. [ ] **HTTPS enforcement** in production
   - Redirect all HTTP → HTTPS
   - Set HSTS headers
   - Estimated time: 30 min
   
3. [ ] **CORS hardening**
   - Verify origin whitelist
   - Test with invalid origins (should reject)
   - Estimated time: 30 min
   
4. [ ] **Password requirements**
   - Min 12 characters, uppercase + number
   - Verify in signup endpoint
   - Test weak passwords are rejected
   - Estimated time: 30 min
   
5. [ ] **Email verification**
   - Send verification email on signup
   - Block login until verified
   - Test flow end-to-end
   - Estimated time: 2 hours

6. [ ] **Backup automation**
   - Set up daily automated PostgreSQL backups
   - Test restore process on staging
   - Estimated time: 1 hour

**Verification**: Run security audit tests, check that attempted exploits are blocked

### TIER 3: Monitoring & Load Testing (Complete by May 1, EOD if possible)

**Deadline**: May 1, by midnight (nice-to-have if Tier 1+2 done)

1. [ ] **Load testing** with k6
   - Install k6: `brew install k6`
   - Run scripts/load-test.js with 100 concurrent users for 5 minutes
   - Check results: p99 latency <2 sec, error rate <0.5%
   - Document any bottlenecks
   - Estimated time: 1.5 hours
   
2. [ ] **Monitoring dashboard**
   - Set up Prometheus/Grafana (self-hosted) OR Datadog (SaaS)
   - Create dashboard with key metrics:
     - API response time (p50, p95, p99)
     - Error rate by endpoint
     - Database connections
     - Memory/CPU usage
   - Estimated time: 1.5 hours
   
3. [ ] **Alerting rules**
   - Error rate >5% → Slack #engineering-alerts
   - p99 latency >5s → Slack #engineering-alerts  
   - Database connection failures → Email ops@
   - Memory usage >80% → PagerDuty critical
   - Estimated time: 1 hour

**Verification**: Simulate an error and verify alert fires, check dashboard shows live metrics

## Daily Standup Template

Each morning, be ready to report:
1. **Yesterday**: What was completed? (With git commit links)
2. **Today**: What are you working on? (Tier 1/2/3 items)
3. **Blockers**: What's stopping progress? Who needs to help?
4. **Confidence**: On a scale 1-10, how confident are you in launching May 6?

## What You Should Know But Don't Need to Do

- **Feature flags**: Backend engineer will handle FF implementation
- **Beta user invitations**: Marketing team handles this
- **Support setup**: Support manager handles this
- **Documentation for users**: Product team handles this

**But** you should understand feature flags since you need to test them during load testing.

## Contact & Escalation

**CTO**: murshid@trale.ai (final decisions, infrastructure choices)
**Backend Engineer**: [name] (questions about API endpoints, database schema)
**On-call Escalation** (May 6+): TBD during team meeting

## Success Looks Like (May 1, 11:59 PM)

✅ Production API responding to requests
✅ Production web app loads and signup works
✅ Database has production schema with backups configured
✅ HTTPS enforced, rate limiting working, email verification active
✅ Load test shows p99 <2s at 100 concurrent users
✅ Monitoring dashboard shows live metrics
✅ Alert tests pass
✅ You feel ready to go on-call for May 6 launch

## After May 1 EOD

Starting May 6:
- **24/7 on-call** for first 48 hours (May 6-7)
- Monitor metrics every 1 hour minimum
- Respond to incidents within 15 minutes
- Update team with status every 2 hours during launch day
- Post-launch: Performance tuning based on real user load

## Questions?

Ask them now or in the team meeting. This is critical path work - unblock yourself fast and ask for help early.

---

## Appendix: Key Git Repos & Docs

```
📁 Codebase Structure:
  📂 family-wealth-mvp/
    📂 apps/
      📂 api/        ← Express backend (you'll deploy this)
      📂 web/        ← Next.js frontend (Vercel handles this)
    📂 packages/
      📂 shared-types/
      📂 ui/
    📂 docs/
      📄 BETA_LAUNCH_PLAN.md      ← Read first
      📄 SECURITY_CHECKLIST.md    ← Your main checklist
      📄 BETA_LAUNCH_RUNBOOK.md   ← Pre-launch procedures
      📄 MONITORING.md            ← Telemetry setup

📍 Critical Environment Files:
  📄 .env.example           ← Copy this to .env.production
  📄 apps/api/.env         ← Add DATABASE_URL, JWT_SECRET, etc.
  📄 apps/web/.env.local   ← Add NEXT_PUBLIC_API_URL
  📄 Dockerfile.api        ← Build this for production
  📄 Dockerfile.web        ← Reference for frontend
```

## Deployment Quick Ref

```bash
# Build and tag Docker images
docker build -f Dockerfile.api -t family-wealth-api:1.0.0 .
docker build -f Dockerfile.web -t family-wealth-web:1.0.0 .

# Deploy to production (platform-specific)
# Railway: Connect GitHub → auto-deploy on push
# Vercel: `vercel --prod` for frontend
# Manual: docker push to registry, then pull on production server

# Run migrations in production
ssh admin@prod.familywealth.app
docker exec family_wealth_api npm run db:migrate

# Tail production logs
docker logs -f family_wealth_api
```

Good luck! 🚀
