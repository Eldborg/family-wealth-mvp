# BER-32: April 29-30 Execution Phase
## Infrastructure Setup & Configuration

**Date:** April 29-30, 2026  
**Phase:** Infrastructure Setup & Configuration  
**Timeline:** 2 days to prepare Railway infrastructure  
**Outcome:** All Railway services configured and ready for May 1 deployment  
**Status:** ✅ Code preparation complete - Ready to execute

---

## Pre-Execution Status

### ✅ Code is Production-Ready
```
Build Status: ✅ PASSING (all 4 packages)
Type Checking: ✅ PASSING
API Build: 64 artifacts ready
Security: ✅ Headers implemented
Rate Limiting: ✅ Active
CORS: ✅ Configured
```

### Pre-Deployment Script Results
```
✓ Node.js v25.8.1 verified
✓ npm 11.11.0 verified  
✓ All builds successful
✓ API start script confirmed
✓ Ready for Railway deployment
```

**All critical checks passed. Ready to proceed with infrastructure setup.**

---

## Day 1: April 29 - Railway Infrastructure Setup

### Morning (Before 12 PM)

#### 1. Create Railway Account (5 minutes)
If not already done:
1. Go to https://railway.app
2. Sign up with GitHub account
3. Authorize access to family-wealth-mvp repo
4. Create new organization if needed

#### 2. Create Railway Project (10 minutes)
1. Dashboard → "Create New Project"
2. Name: `family-wealth-mvp-prod`
3. Add **PostgreSQL 15** database
   - Railway auto-generates connection string
   - Save the `DATABASE_URL` (you'll need it in Step 4)

**Get the PostgreSQL Connection String:**
- Service → "PostgreSQL" → "Variables" tab
- Copy the entire `DATABASE_URL` value
- Store securely (you'll enter it in API service next)

#### 3. Add API Service (15 minutes)
1. In Railway project: "+" → "GitHub"
2. Select `family-wealth-mvp` repo
3. Go to **Settings** tab (appears after repo connects)
4. Configure:
   ```
   Root Directory:    .
   Build Command:     npm run build
   Start Command:     cd apps/api && npm run start
   ```
5. Click "Deploy"
   - Railway will start the first build (takes ~3-5 minutes)
   - Status should show "Building..." then "Running"

#### 4. Add Web Service (15 minutes)
1. In Railway project: "+" → "GitHub"
2. Select `family-wealth-mvp` repo again
3. Go to **Settings** tab
4. Configure:
   ```
   Root Directory:    .
   Build Command:     npm run build
   Start Command:     cd apps/web && npm run start
   ```
5. Click "Deploy"
   - First build will start automatically
   - Wait for status to show "Running"

### Afternoon (12 PM - 5 PM)

#### 5. Configure API Environment Variables (20 minutes)

Go to **API service** in Railway → **Variables** tab

**IMPORTANT: Add these variables in this EXACT order:**

```
NODE_ENV                production
PORT                    3000
DATABASE_URL            <PASTE from PostgreSQL above>
JWT_SECRET              <Generate below - IMPORTANT>
JWT_EXPIRES_IN          7d
CORS_ORIGIN             https://web-<random>.railway.app
LOG_LEVEL               info
```

**How to generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Important:** After pasting a variable, press Tab or Enter to save it. Each variable needs individual confirmation.

**CORS_ORIGIN note:** 
- Leave as `https://web-<random>.railway.app` for now
- After Web deploys, you'll see the exact domain in Railway dashboard
- Update this variable with the exact domain before May 1

#### 6. Configure Web Environment Variables (10 minutes)

Go to **Web service** → **Variables** tab

```
NODE_ENV                production
NEXT_PUBLIC_API_URL     https://api-<random>.railway.app
```

**NEXT_PUBLIC_API_URL note:**
- Leave as `https://api-<random>.railway.app` for now
- After API deploys, you'll see exact domain
- Update with exact domain before May 1

#### 7. Verify Domain Names (10 minutes)

Railway auto-assigns domains. To find them:

1. **API Service → Deployments**
   - Look for green "Running" status
   - Domain appears next to service name
   - Format: `https://api-<RANDOM_ID>.railway.app`
   - Example: `https://api-abc123xyz.railway.app`

2. **Web Service → Deployments**
   - Same process
   - Format: `https://web-<RANDOM_ID>.railway.app`
   - Example: `https://web-def456uvw.railway.app`

#### 8. Update Environment Variables (Final Step)

Once both services are running and you have their domains:

**Update API service CORS_ORIGIN:**
- Change from: `https://web-<random>.railway.app`
- To: `https://web-def456uvw.railway.app` (your actual domain)
- Redeploy API service

**Update Web service NEXT_PUBLIC_API_URL:**
- Change from: `https://api-<random>.railway.app`
- To: `https://api-abc123xyz.railway.app` (your actual domain)
- Redeploy Web service

### Evening (5 PM - 8 PM)

#### 9. Monitor Deployments (Ongoing)
- Go to **Deployments** tab for each service
- Watch for:
  - ✅ Green "Running" status = Success
  - 🟡 "Building" = In progress
  - ❌ "Failed" = Check logs

**If deployment fails:**
1. Click service name
2. Go to **Logs** tab
3. Read error messages
4. Fix the issue (usually env variable or root directory)
5. Click "Redeploy"

#### 10. Document the Configuration
Create a note with your actual values:
```
API Domain:  https://api-abc123xyz.railway.app
Web Domain:  https://web-def456uvw.railway.app
DB Host:     [from PostgreSQL service]
```

Keep these handy for the May 1 validation phase.

---

## Day 2: April 30 - Database Setup & Final Validation

### Morning (Before 12 PM)

#### 1. Verify Services are Running (5 minutes)

Check Railway dashboard:
- PostgreSQL: Should show "Running"
- API: Should show "Running"
- Web: Should show "Running"

If any show "Failed":
- Click service
- Go to **Logs** tab
- Check error messages
- Fix config and redeploy

#### 2. Test API Health Endpoint (5 minutes)

```bash
curl https://api-abc123xyz.railway.app/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-04-30T10:00:00.000Z"}
```

If this works: ✅ API is healthy
If not: Check logs in Railway dashboard

#### 3. Run Post-Deployment Validation (20 minutes)

```bash
cd /Users/assistantcomputer/.paperclip/instances/default/workspaces/family-wealth-mvp

# Make scripts executable
chmod +x scripts/validate-deployment.sh

# Run validation
./scripts/validate-deployment.sh \
  https://api-abc123xyz.railway.app \
  https://web-def456uvw.railway.app
```

This script checks:
- ✓ HTTP response codes
- ✓ Security headers
- ✓ CORS configuration
- ✓ Rate limiting
- ✓ Frontend accessibility

**Expected output:**
```
✓ All systems go
✓ Security headers in place
✓ Rate limiting active
✓ Next steps: Monitor and test features
```

### Afternoon (12 PM - 5 PM)

#### 4. Manual Testing (30 minutes)

Open each service in browser:

**Frontend (Web):**
```
https://web-def456uvw.railway.app
```
- Does it load without errors?
- Check browser console (F12) for errors
- Can you navigate pages?
- Does it look correct?

**API Health:**
```
https://api-abc123xyz.railway.app/health
```
- Do you see the health check response?
- Is the response time < 1 second?

**API Endpoint:**
```
https://api-abc123xyz.railway.app/api
```
- Do you see: `{"message":"Family Wealth MVP API"}`

#### 5. Check Logs (20 minutes)

For each service, review logs for errors:

```bash
# API logs
railway logs --service api

# Web logs  
railway logs --service web

# PostgreSQL logs
railway logs --service postgres
```

Look for:
- ❌ Errors (red text) - investigate
- ⚠️ Warnings (yellow) - usually OK
- ℹ️ Info (blue) - expected

### Evening (5 PM - 8 PM)

#### 6. Document Everything (30 minutes)

Create April 30 end-of-day report:

```markdown
## April 30 Deployment Report

### Status: ✅ READY FOR MAY 1 DEPLOYMENT

### Services Running
- [x] PostgreSQL: https://[db-host]
- [x] API: https://api-abc123xyz.railway.app
- [x] Web: https://web-def456uvw.railway.app

### Testing Results
- [x] API health check: PASS
- [x] Validation script: PASS  
- [x] Frontend loads: PASS
- [x] Security headers: VERIFIED
- [x] CORS working: VERIFIED
- [x] Logs clean: NO CRITICAL ERRORS

### Configuration
- JWT_SECRET: Set and working
- DATABASE_URL: Connected
- CORS_ORIGIN: Correctly configured
- NEXT_PUBLIC_API_URL: Correctly configured

### Next Steps (May 1)
- [ ] Run final validation script
- [ ] Check metrics in Railway dashboard
- [ ] Be ready for launch May 6
```

#### 7. Team Standup (10 minutes)

Brief CTO:
- Infrastructure is up
- All services running
- Validation tests passing
- Ready for May 1 execution phase

---

## Troubleshooting Guide

### Issue: Build Fails
**Symptom:** Red "Failed" status on service

**Solution:**
1. Click service → Logs
2. Find the error message
3. Common causes:
   - Root directory wrong (should be `.`)
   - Build command typo
   - Missing environment variables
4. Fix → Click "Redeploy"

### Issue: Service Keeps Crashing
**Symptom:** "Running" → "Failed" → repeat

**Solution:**
1. Check logs (red text errors)
2. Usually missing DATABASE_URL or incorrect env var
3. Update variable → Redeploy
4. Wait 2-3 minutes for service to stabilize

### Issue: API Returns 502 Bad Gateway
**Symptom:** Accessing API gives 502 error

**Solution:**
1. Wait 30 seconds (service may be starting)
2. Check if service shows "Running" in Railway
3. Check API logs for startup errors
4. Verify DATABASE_URL is correct
5. Try `/health` endpoint

### Issue: CORS Headers Missing
**Symptom:** Validation script shows CORS warning

**Solution:**
1. Check API service CORS_ORIGIN variable
2. Must be exactly: `https://web-def456uvw.railway.app` (exact domain)
3. If wrong, update variable
4. Redeploy API service

### Issue: Can't Find Domain Name
**Symptom:** "Where is my domain?"

**Solution:**
1. In Railway dashboard
2. Click the service (API or Web)
3. Go to **Deployments** tab
4. Look at the service name/status area
5. Domain is displayed there
6. Format: `https://[service]-[random].railway.app`

---

## Success Checklist (End of April 30)

- [ ] PostgreSQL running and verified
- [ ] API service running and responding
- [ ] Web service running and accessible
- [ ] API health check returns 200 OK
- [ ] Validation script passes all checks
- [ ] Frontend loads in browser without errors
- [ ] CORS headers present
- [ ] Security headers present
- [ ] Rate limiting headers present
- [ ] Logs show no critical errors
- [ ] Domain names documented
- [ ] Environment variables all set correctly
- [ ] CTO briefed and aligned
- [ ] Ready for May 1 execution

**If all checked:** You're ready for the May 1-2 deployment phase.

---

## Communication Checklist

- [ ] Daily standup at 10 AM (brief CTO)
- [ ] Daily standup at 3 PM (status update)
- [ ] Document any issues encountered
- [ ] Keep team informed of progress
- [ ] Alert CTO immediately if major blocker

---

## Key Contacts & Resources

**Railway Support:** https://railway.app/help  
**Documentation:** https://docs.railway.app  
**Team Chat:** [Your Slack/Teams channel]

---

**Target Outcome:** By end of April 30, all Railway infrastructure is configured, tested, and ready for May 1 deployment phase.

**Current Status:** April 28 - Code ready, validation passing, ready to execute infrastructure setup beginning April 29.
