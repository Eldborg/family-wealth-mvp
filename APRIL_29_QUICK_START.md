# April 29 Quick Start
## Infrastructure Setup - Day 1 (TL;DR Version)

**When:** April 29, 2026, starting at 9:00 AM  
**Duration:** ~60 minutes of active work spread over 8 hours  
**Goal:** Get API and Web deployed on Railway, configured, and responding  
**Reference:** Full details in APRIL_29-30_EXECUTION.md

---

## 📋 DO THIS IN ORDER

### 1. Create Railway Account (5 min)
```
→ Go to https://railway.app
→ Sign up with GitHub
→ Authorize access to family-wealth-mvp repo
```

### 2. Create Railway Project (10 min)
```
→ Dashboard: "Create New Project"
→ Name: family-wealth-mvp-prod
→ Add PostgreSQL 15
→ Copy DATABASE_URL from PostgreSQL service
```

### 3. Deploy API Service (15 min)
```
→ Project: "+" → "GitHub"
→ Select family-wealth-mvp repo
→ Settings:
   Root Directory: .
   Build Command: npm run build
   Start Command: cd apps/api && npm run start
→ Deploy (wait for "Running" status)
```

### 4. Deploy Web Service (15 min)
```
→ Project: "+" → "GitHub"
→ Select family-wealth-mvp repo
→ Settings:
   Root Directory: .
   Build Command: npm run build
   Start Command: cd apps/web && npm run start
→ Deploy (wait for "Running" status)
```

### 5. Configure API Environment (20 min)
```
→ API Service → Variables tab
→ Add each variable (press Enter after each):

NODE_ENV                 production
PORT                     3000
DATABASE_URL             [paste from PostgreSQL above]
JWT_SECRET               [generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN          7d
CORS_ORIGIN             https://web-<random>.railway.app
LOG_LEVEL               info
```

### 6. Configure Web Environment (10 min)
```
→ Web Service → Variables tab
→ Add:

NODE_ENV                production
NEXT_PUBLIC_API_URL     https://api-<random>.railway.app
```

### 7. Get Actual Domain Names (10 min)
```
→ API Service → Deployments tab
→ Copy domain (looks like: https://api-abc123xyz.railway.app)
→ Web Service → Deployments tab
→ Copy domain (looks like: https://web-def456uvw.railway.app)
```

### 8. Update Env Variables with Actual Domains (10 min)
```
→ API Service → Variables
→ Update CORS_ORIGIN: https://web-def456uvw.railway.app
→ Redeploy API

→ Web Service → Variables
→ Update NEXT_PUBLIC_API_URL: https://api-abc123xyz.railway.app
→ Redeploy Web
```

### 9. Verify Deployments
```
→ Check both services show "Running"
→ Note any failed builds (check logs)
→ Document the two domains
```

### 10. Document Configuration
```
Create a note:
API Domain:  https://api-abc123xyz.railway.app
Web Domain:  https://web-def456uvw.railway.app

Keep this handy for April 30 testing.
```

---

## ⏰ TIMELINE BREAKDOWN

```
9:00 AM   - Start (Steps 1-2)
9:30 AM   - Services deploying (Steps 3-4)
10:00 AM  - Daily standup (quick update)
10:30 AM  - Continue configuration (Steps 5-6)
12:00 PM  - Get domain names (Step 7)
12:30 PM  - Update with actual domains (Step 8)
1:00 PM   - Verify deployments (Step 9)
1:30 PM   - Document (Step 10)
3:00 PM   - Daily standup (status update)
```

---

## 🆘 IF SOMETHING FAILS

**Build fails?**
→ Click service → Logs → find error → fix → Redeploy

**Service keeps crashing?**
→ Check DATABASE_URL is set correctly
→ Check all env variables are entered properly
→ Redeploy

**Can't find domain name?**
→ Go to Deployments tab (not Services)
→ Look for domain next to running service

**Getting 502 Bad Gateway?**
→ Wait 30 seconds
→ Check logs in Railway
→ Verify env variables

**Other issues?**
→ Reference: APRIL_29-30_EXECUTION.md Troubleshooting section

---

## ✅ END OF DAY CHECKLIST

By 5 PM, confirm:
- [ ] PostgreSQL running in Railway
- [ ] API service running and has domain
- [ ] Web service running and has domain
- [ ] API domain documented
- [ ] Web domain documented
- [ ] Environment variables configured
- [ ] Both services redeployed with correct domains

If all checked: ✅ Day 1 complete, ready for April 30.

---

## 📞 STANDUPS

- **10:00 AM:** Brief CTO on progress so far
- **3:00 PM:** Update on configuration and domains

Use DAILY_STANDUP_TEMPLATE.md format.

---

**That's it.** 10 steps, ~60 min of work, spread over 8 hours. By 5 PM you'll have both services running on Railway.

**Next:** April 30 - Validation and testing.

---

**Prepared by:** Full-Stack Engineer  
**For:** April 29 morning execution  
**Reference:** See APRIL_29-30_EXECUTION.md for detailed step-by-step guide
