# Beta Launch Runbook - May 6, 2026

## Pre-Launch (May 5, 5:00 PM - Midnight)

### 1. Final System Checks (5:00 PM)

```bash
# SSH to production environment
ssh admin@prod.familywealth.app

# Check all services are running
docker ps
# Expected: postgres, redis, api, web, monitoring all healthy

# Check database connections
docker exec family_wealth_api npm run db:check

# Verify backups
backup-verify --latest

# Run final smoke tests
npm run test:smoke -- --env=production
```

**Sign-off**: ✓ All systems healthy

### 2. Load Test Results Review (5:30 PM)

- [ ] Review k6 load test results from staging
- [ ] Confirm p99 latency <2 seconds under 100 concurrent users
- [ ] Confirm error rate <0.5%
- [ ] Check database connection pool is adequate
- [ ] Document any bottlenecks found

**Sign-off**: ✓ Performance acceptable for beta

### 3. Security Audit Review (6:00 PM)

- [ ] All CRITICAL items from security checklist completed
- [ ] All dependencies have zero critical vulnerabilities
- [ ] HTTPS/TLS configured and certificate valid
- [ ] Rate limiting configured and tested
- [ ] All secrets in environment variables

**Command to verify:**
```bash
npm audit --production
# Should report: 0 vulnerabilities
```

**Sign-off**: ✓ Security requirements met

### 4. Monitoring & Alerting Setup (6:30 PM)

```bash
# Verify monitoring dashboards
curl https://monitoring.familywealth.app/dashboards/beta

# Test alert notifications
npm run test:alerts

# Verify on-call schedule
cat /etc/on-call/schedule.txt
```

**Expected alerting channels**:
- [ ] Slack: #engineering-alerts
- [ ] PagerDuty: Critical only
- [ ] Email: ops@familywealth.app

**Sign-off**: ✓ Monitoring ready

### 5. Backup & Disaster Recovery Test (7:00 PM)

```bash
# Test database backup
npm run backup:test

# Test database restore to staging
npm run restore:staging --from=latest-backup

# Verify restored data integrity
npm run db:verify:staging
```

**Expected result**: ✓ All data restored correctly

### 6. Feature Flags Verification (7:30 PM)

```bash
# Verify feature flags are set for Week 1
curl https://api.familywealth.app/api/features \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected output:
# {
#   "INVITE_FAMILY_MEMBERS": false,
#   "GOAL_SHARING": false,
#   ...all others false
# }
```

**Sign-off**: ✓ Feature flags correct for Week 1

### 7. Team Briefing (8:00 PM)

**Meeting attendees:**
- CTO (Lead)
- Backend Lead
- Frontend Lead
- DevOps Engineer
- Support Manager

**Agenda (30 minutes)**:
- [ ] Review launch plan and success criteria
- [ ] Confirm on-call schedule and escalation paths
- [ ] Walk through incident response process
- [ ] Review monitoring dashboards
- [ ] Confirm communication channels

**Emergency contacts established**:
- [ ] CTO: +1-XXX-XXX-XXXX
- [ ] DevOps: +1-XXX-XXX-XXXX
- [ ] Support: Slack #support-emergency

### 8. Final Checklist Before Launch (11:00 PM)

- [ ] All systems are GREEN in monitoring
- [ ] All team members have monitoring dashboards open
- [ ] Emergency contact numbers confirmed
- [ ] Incident response plan reviewed
- [ ] Beta user communications ready to send
- [ ] Support team briefed on common issues
- [ ] Database backups recent and verified
- [ ] All logs are flowing to monitoring system

---

## Launch Day - May 6, 2026

### Morning: Go/No-Go Decision (9:00 AM)

**Meeting**: CTO, Tech Lead, Operations Lead

**Checklist**:
- [ ] 48-hour monitoring of staging shows no issues
- [ ] All alerts tested and working
- [ ] Team confirmed available for 24/7 support
- [ ] All infrastructure online and healthy

**Decision**: **GO** / **NO-GO** (Circle one)

If **NO-GO**: 
1. Document reasons for delay
2. Schedule new launch date
3. Send communication to beta users
4. Exit this runbook

If **GO**: Proceed to launch

### Launch: Enable Beta (9:15 AM)

1. **Enable public signup**
   ```bash
   ssh admin@prod.familywealth.app
   export BETA_ENABLED=true
   docker restart family_wealth_web
   echo "✓ Public signup enabled"
   ```

2. **Send launch announcement**
   - [ ] Blog post published
   - [ ] Email sent to beta waitlist
   - [ ] Twitter/social media posts
   - [ ] Slack announcement

3. **Confirm first users connecting**
   ```bash
   # Monitor user signups in real-time
   tail -f /var/log/family_wealth/access.log | grep signup
   ```

4. **Verify monitoring is capturing data**
   ```bash
   curl https://api.familywealth.app/api/monitoring/metrics \
     -H "Authorization: Bearer $ADMIN_TOKEN"
   ```

### First Hour: Active Monitoring (9:15 AM - 10:15 AM)

**Team**: CTO + 1 Senior Engineer in war room (in-person or video)

**Every 5 minutes**:
- [ ] Check error rate (target: <0.5%)
- [ ] Check p99 latency (target: <2s)
- [ ] Check database connection pool (target: <80% used)
- [ ] Monitor signup completion rate
- [ ] Scan logs for warnings/errors

**Actions if something fails**:
- Error rate >2% → Escalate immediately
- p99 latency >5s → Check database/API metrics
- Signup issues → Check auth service logs
- See **Incident Response** section below

### First Day: Enhanced Monitoring (10:15 AM - 11:59 PM)

**Team rotation**: 
- 9 AM - 5 PM: CTO + Engineering lead
- 5 PM - Midnight: Senior engineer + DevOps
- Midnight - 9 AM: On-call rotation

**Every 30 minutes**:
- [ ] Review error logs
- [ ] Check user feedback in monitoring endpoint
- [ ] Verify feature flag settings unchanged
- [ ] Monitor database size growth
- [ ] Check backup completion

**Daily standup** (5 PM):
- What went well?
- What needs improvement?
- Any issues encountered?
- Tomorrow's focus?

### First Week: Gradual Ramp Up

**User onboarding schedule**:
- **Day 1-2**: 100 beta testers (early adopters)
- **Day 3-4**: Add 100 more (200 total)
- **Day 5-7**: Add 200 more (400 total)

**Pause signups if**:
- Error rate exceeds 2%
- Database connection issues
- Memory usage >85%
- Response times exceed 3 seconds

---

## Incident Response Procedures

### P0 - Critical (Response: Immediate)

**Examples**: Complete outage, data corruption, security breach

**1. Declare Incident** (2 minutes)
```bash
# Notify team immediately
echo "⚠️ P0 INCIDENT DECLARED: [DESCRIPTION]" | \
  slack -c "#engineering-alerts"

# Activate incident commander
export INCIDENT_COMMANDER="on-call-engineer"
```

**2. Triage** (5 minutes)
- [ ] Isolate affected service
- [ ] Stop accepting new requests if needed
- [ ] Enable maintenance mode if applicable
- [ ] Document what's happening

**3. Communication** (Immediate)
- [ ] Update status page: https://status.familywealth.app
- [ ] Post to #support-emergency Slack
- [ ] Notify key stakeholders

**4. Fix** (Varies)
- Frontend issue? Rollback last deployment
- Backend issue? Check recent changes and logs
- Database issue? Check connection pool and queries
- See **Common Issues** section

**5. Verify** (10-30 minutes)
- [ ] Users can log in
- [ ] Can create goals
- [ ] Can view goals
- [ ] No error messages

### P1 - High (Response: 15 minutes)

**Examples**: Feature broken, significant slowdown, unusual errors

**Process**: Same as P0 but less urgent timeline

### P2 - Medium (Response: 1 hour)

**Examples**: Minor bugs, small performance issues

**Process**: Log issue, plan fix, schedule for next deployment

---

## Common Issues & Quick Fixes

### Issue: High Error Rate (>2%)

```bash
# 1. Check API logs
docker logs family_wealth_api | grep ERROR | tail -50

# 2. Check database
docker exec family_wealth_postgres psql -U postgres -c \
  "SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename;"

# 3. If connection pool exhausted:
#    Kill idle connections
docker exec family_wealth_postgres psql -U postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE state = 'idle' AND query_start < now() - interval '5 minutes';"

# 4. Restart API if needed
docker restart family_wealth_api
```

### Issue: Slow Response Times (p99 >5s)

```bash
# 1. Check database slow query log
docker exec family_wealth_postgres psql -U postgres \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# 2. Check for missing indexes
npm run db:check-indexes

# 3. Scale up API replicas (if running multiple)
docker-compose -f docker-compose.prod.yml up -d --scale api=2
```

### Issue: Database Connection Errors

```bash
# 1. Check database status
docker ps | grep postgres

# 2. Check logs
docker logs family_wealth_postgres | tail -100

# 3. Verify connection string
echo $DATABASE_URL

# 4. Test connection
psql $DATABASE_URL -c "SELECT 1"

# 5. Restart if necessary
docker restart family_wealth_postgres
```

### Issue: Signup Not Working

```bash
# 1. Check auth logs
docker logs family_wealth_api | grep -i auth | tail -50

# 2. Verify database table
docker exec family_wealth_postgres psql -U postgres family_wealth \
  -c "SELECT COUNT(*) FROM \"User\";"

# 3. Check JWT configuration
echo $JWT_SECRET | wc -c  # Should be >32 characters

# 4. Test signup endpoint directly
curl -X POST https://api.familywealth.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123","name":"Test"}'
```

### Issue: Users Can't Create Goals

```bash
# 1. Check goals endpoint
curl https://api.familywealth.app/api/goals \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Check family group creation
npm run debug:family-groups

# 3. Verify feature flag for goals is enabled
curl https://api.familywealth.app/api/features \
  -H "Authorization: Bearer ADMIN_TOKEN" | grep -i goal

# 4. Check goal creation logs
docker logs family_wealth_api | grep -i goal | tail -50
```

---

## Monitoring Dashboards

### Real-time Dashboard
https://monitoring.familywealth.app/dashboards/beta

**Key metrics to watch**:
- API request rate (should gradually increase)
- Error rate (should stay <0.5%)
- p99 latency (should stay <2s)
- Database connection usage
- Memory usage
- Signup completion rate

### Alerts

All alerts configured in Datadog/New Relic:
- **Error Rate Alert**: Fires when >2% of requests error
- **Latency Alert**: Fires when p99 >5 seconds
- **Database Alert**: Fires when connection pool >80%
- **Memory Alert**: Fires when usage >85%

---

## Escalation Contacts

| Issue | Contact | Phone | Slack |
|-------|---------|-------|-------|
| General | On-call Engineer | +1-XXX-XXXX | #support-emergency |
| Database | DevOps Lead | +1-XXX-XXXX | #database-alerts |
| Security | Security Team | +1-XXX-XXXX | #security-alerts |
| Critical | CTO | +1-XXX-XXXX | Direct DM |

---

## Post-Launch Review

### 24-Hour Review (May 7, 9 AM)

**Participants**: CTO, Engineering Leads, DevOps, Support

**Agenda**:
- [ ] Review 24-hour metrics and health
- [ ] Summarize user feedback
- [ ] Document any issues encountered
- [ ] Plan fixes for critical issues
- [ ] Schedule next review

### Weekly Review (Every Monday)

**Metrics to review**:
- Uptime percentage
- Error rate trends
- Latency trends  
- User growth rate
- Feature adoption
- Support tickets

**Decisions to make**:
- [ ] Feature flag rollout progress
- [ ] Infrastructure scaling needs
- [ ] Bug fixes vs. new features
- [ ] Next week's priorities

---

## Success Criteria

✓ **Technical Success**:
- Uptime >99.5%
- Error rate <0.5%
- p99 latency <2 seconds
- Database performance stable
- All alerts working

✓ **User Success**:
- Signup completion rate >80%
- First goal creation >70%
- Daily active users growing
- User feedback positive
- <5 critical bugs reported

✓ **Business Success**:
- On-track for 500 beta users by week 2
- User retention >50% week 1-2
- No security incidents
- Support team handling load
- Team confident in launch

---

## Stay Calm and Launch!

Remember:
- You've prepared thoroughly
- Systems are tested and ready
- Team is experienced and capable
- Failures are learning opportunities
- Users understand this is beta

**Let's launch! 🚀**
