# Apr 29 Morning Quick Reference - Infrastructure Execution Start

**Date:** April 29, 2026 (Morning)  
**Status:** Ready to execute  
**Timeline:** 8 hours (9 AM - 5 PM PT)  
**Goal:** Railway.app infrastructure fully deployed and running

---

## ✅ Pre-Execution Verification

Before starting, verify these are all ✅:

- [ ] You have Railway.app account or can create one
- [ ] You have GitHub credentials (family-wealth-mvp repo access)
- [ ] Terminal open in `/Users/assistantcomputer/.paperclip/instances/default/workspaces/family-wealth-mvp`
- [ ] Browser ready to access https://railway.app
- [ ] Slack/email ready for standups at 10 AM & 3 PM

---

## 🚀 Main Execution (9 AM - 12 PM)

### Step 1: Create Railway Account (5 minutes)
```bash
# Go to https://railway.app
# Sign up with GitHub
# Authorize family-wealth-mvp repo access
```

### Step 2: Create Railway Project (10 minutes)
```bash
# Dashboard → "Create New Project"
# Name: family-wealth-mvp-prod
# Add PostgreSQL 15
# Copy DATABASE_URL from PostgreSQL Variables tab
```

### Step 3: Deploy API Service (15 minutes)
```bash
# Project → "+" → GitHub
# Select family-wealth-mvp repo
# Settings tab:
#   Root Directory: .
#   Build Command: npm run build
#   Start Command: cd apps/api && npm run start
# Click Deploy
```

### Step 4: Deploy Web Service (15 minutes)
```bash
# Project → "+" → GitHub  
# Select family-wealth-mvp repo (same)
# Settings tab:
#   Root Directory: .
#   Build Command: npm run build
#   Start Command: cd apps/web && npm run start
# Click Deploy
```

### Step 5: Configure API Environment Variables (20 minutes)
Go to API Service → Variables tab. Add these variables (press Tab after each):

```
NODE_ENV                     production
PORT                         3000
DATABASE_URL                 <PASTE from PostgreSQL>
JWT_SECRET                   <GENERATE BELOW>
JWT_EXPIRES_IN               7d
CORS_ORIGIN                  https://web-<random>.railway.app
LOG_LEVEL                    info
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Configure Web Environment Variables (10 minutes)
Go to Web Service → Variables tab. Add:

```
NODE_ENV                     production
NEXT_PUBLIC_API_URL          https://api-<random>.railway.app
```

---

## 📊 Check Progress (12 PM)

By 12 PM, you should see:
- [ ] API service: "Building..." → "Running" ✅
- [ ] Web service: "Building..." → "Running" ✅
- [ ] PostgreSQL service: "Running" ✅

If not running, check build logs in Railway dashboard.

---

## ⚙️ Afternoon (12 PM - 5 PM)

### Step 7: Get Actual Domain Names
1. API Service → Deployments tab → look for green "Running" status
   - Domain format: `https://api-ABC123.railway.app`
   - Copy this domain

2. Web Service → Deployments tab → look for green "Running"  
   - Domain format: `https://web-XYZ789.railway.app`
   - Copy this domain

### Step 8: Update Environment Variables
Go back to API Service → Variables tab:
- Update `CORS_ORIGIN` with actual Web domain
- Save (Tab key)
- Service will redeploy automatically

Then Web Service → Variables tab:
- Update `NEXT_PUBLIC_API_URL` with actual API domain
- Save (Tab key)
- Service will redeploy automatically

### Step 9: Quick Tests (10 minutes)
```bash
# Test API health
curl https://api-ABC123.railway.app/health

# Test Web access
curl https://web-XYZ789.railway.app

# Check security headers
curl -I https://api-ABC123.railway.app/health
```

Look for:
- HTTP 200 responses
- HSTS, X-Content-Type-Options, X-Frame-Options headers

---

## 📋 Daily Standups

**10:00 AM (30 min after start):** Update status
```
"Created Railway account, deployed API and Web services, both building"
```

**3:00 PM (end of day):** Final status
```
"All services running, environment variables configured, domain names verified, ready for Apr 30 validation"
```

---

## 🆘 Troubleshooting

**Build is failing**
→ Check logs in Railway dashboard
→ Most likely: missing NODE_ENV or PORT variable

**Service keeps crashing**
→ Verify DATABASE_URL is correct
→ Check logs for connection errors

**Domain not visible**
→ Look in DEPLOYMENTS tab, not Services tab
→ Make sure service status is green (Running)

**Can't login to Railway**
→ Use GitHub OAuth
→ Make sure you authorize the family-wealth-mvp repo

---

## 📞 Support

**Reference docs in workspace:**
- `APRIL_29-30_EXECUTION.md` - Detailed step-by-step
- `RAILWAY_DEPLOYMENT.md` - Full documentation
- `CTO_INFRASTRUCTURE_READINESS_CHECKLIST.md` - Tracking checklist

**Questions?** Check the reference docs first - answer is there.

---

## ✨ Success Definition (by 5 PM)

- [ ] Railway account created
- [ ] PostgreSQL running
- [ ] API deployed and responding  
- [ ] Web deployed and accessible
- [ ] Environment variables all configured
- [ ] Domain names identified
- [ ] Services redeployed with correct domains

**If all ✅:** Great! Tomorrow you'll validate and run final checks.

---

**Start time:** Apr 29, 9 AM PT  
**Next update:** Apr 29, 3 PM PT (at daily standup)  
**Final validation:** Apr 30, 9 AM PT
