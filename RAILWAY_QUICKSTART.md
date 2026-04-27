# Railway.app Quick Start Guide
## family-wealth-mvp - May 6 Launch

**Timeline:** April 28 - May 6, 2026  
**Status:** Ready for deployment  
**Last Updated:** 2026-04-27

---

## 1. Prerequisites (5 minutes)

- [ ] Railway.app account (sign up free at https://railway.app)
- [ ] GitHub account with access to family-wealth-mvp
- [ ] Node.js 18+ installed locally
- [ ] Local copy of family-wealth-mvp repo

---

## 2. Quick Setup (30 minutes total)

### Step 1: Prepare Code (5 min)

```bash
# Clone repo (if not already done)
cd /Users/assistantcomputer/.paperclip/instances/default/workspaces/family-wealth-mvp

# Run pre-deployment validation
chmod +x scripts/railway-setup.sh
./scripts/railway-setup.sh
```

This will:
- ✓ Verify Node.js and npm installed
- ✓ Build the application
- ✓ Generate JWT secret
- ✓ Validate configuration

**Save the JWT_SECRET output - you'll need this in Step 3**

### Step 2: Create Railway Project (10 min)

1. Go to https://railway.app/dashboard
2. Click "Create New Project"
3. Select "PostgreSQL" (database)
4. Rename to: `family-wealth-mvp-prod`
5. Add more services:
   - Click "+" → GitHub
   - Select `family-wealth-mvp` repo
   - Click "+" → GitHub again
   - Select `family-wealth-mvp` repo (for second app)

### Step 3: Configure Services (15 min)

#### 3a. PostgreSQL (Automatic)
- Railway auto-generates connection string
- Copy the `DATABASE_URL` from Variables tab

#### 3b. API Service (Express backend)

1. Click "API" service in Railway dashboard
2. Go to **Variables** tab
3. Add these variables:

```
NODE_ENV              production
PORT                  3000
DATABASE_URL          <paste from PostgreSQL step above>
JWT_SECRET            <paste generated secret from Step 1>
JWT_EXPIRES_IN        7d
REDIS_URL             (optional - can skip for MVP)
CORS_ORIGIN           https://<web-domain.railway.app>
LOG_LEVEL             info
```

4. Go to **Settings** tab
5. Set:
   - **Root Directory:** `.` (root of monorepo)
   - **Build Command:** `npm run build`
   - **Start Command:** `cd apps/api && npm run start`

#### 3c. Web Service (Next.js frontend)

1. Click "Web" service
2. Go to **Variables** tab
3. Add:

```
NODE_ENV                production
NEXT_PUBLIC_API_URL     https://<api-domain.railway.app>
```

4. Go to **Settings** tab
5. Set:
   - **Root Directory:** `.`
   - **Build Command:** `npm run build`
   - **Start Command:** `cd apps/web && npm run start`

#### 3d. Get Domain Names

After deploying, Railway assigns:
- **API:** `api-<random>.railway.app` (or custom domain)
- **Web:** `web-<random>.railway.app` (or custom domain)

Update `CORS_ORIGIN` and `NEXT_PUBLIC_API_URL` with actual domains.

---

## 3. Deploy (5 minutes)

### Automatic Deploy (Recommended)
1. Go to each service (API, Web, PostgreSQL)
2. Railway auto-deploys when variables are saved
3. Watch status in **Deployments** tab (should see green checkmark)

### Manual Redeploy (if needed)
1. Service → **Deployments** tab
2. Click "Redeploy" on latest deployment

---

## 4. Validate Deployment (10 minutes)

```bash
# Test API health
curl -i https://api-<random>.railway.app/health

# Run full validation script
chmod +x scripts/validate-deployment.sh
./scripts/validate-deployment.sh \
  https://api-<random>.railway.app \
  https://web-<random>.railway.app
```

**Expected Results:**
- ✓ HTTP 200 responses
- ✓ Security headers present (HSTS, X-Frame-Options, etc.)
- ✓ CORS headers present
- ✓ Rate limiting active
- ✓ Frontend loads

---

## 5. Monitor (Ongoing)

### Dashboard Metrics
- Go to **Deployments** → your service
- Check CPU, Memory, Disk usage
- Review logs in **Logs** tab

### Common Commands
```bash
# View API logs
railway logs --service api

# View Web logs
railway logs --service web

# View Database logs
railway logs --service postgres
```

---

## 6. Troubleshooting

### Issue: "Deployment Failed"
1. Check **Logs** tab for errors
2. Verify environment variables are set
3. Ensure root directory is `.` (monorepo root)
4. Check `package.json` has proper scripts

### Issue: "502 Bad Gateway"
1. Wait 2-3 minutes (service may still starting)
2. Check logs for startup errors
3. Verify DATABASE_URL is correct
4. Redeploy the failing service

### Issue: "Database Connection Error"
1. Go to PostgreSQL service in Railway
2. Copy the full `DATABASE_URL` from Variables
3. Paste into API service's `DATABASE_URL` variable
4. Redeploy API

### Issue: "CORS Errors"
1. Check Web URL in Railway dashboard
2. Update API's `CORS_ORIGIN` to match exact Web domain
3. Redeploy API service

### Issue: "404 on Frontend"
1. Check Web service logs
2. Ensure `NEXT_PUBLIC_API_URL` is set correctly
3. Verify API service is running (`/health` returns 200)
4. Redeploy Web service

---

## 7. Performance Tips

### Database
- PostgreSQL 15 included in Railway (suitable for MVP)
- Run migrations: Railway auto-runs on service start
- Backup: Enable in PostgreSQL service settings

### API
- Rate limiting active (100 req/min per IP)
- Security headers enforced
- Error handling in production mode (no stack traces)

### Frontend
- Next.js caching enabled
- Static assets served from Railway edge
- API calls go through rate limiting

---

## 8. Cost Estimation

**Railway Pricing (as of April 2026):**
- PostgreSQL: ~$9-15/month (included in free tier trial)
- API service: ~$5/month (Fluid Compute, minimal)
- Web service: ~$5/month (Fluid Compute, minimal)

**Total for MVP:** ~$15-25/month (free during trial)

---

## 9. Next Steps (May 6 - Launch)

- [ ] Monitor logs for errors
- [ ] Check dashboard metrics every hour
- [ ] Be on-call for incident response
- [ ] Document any issues for post-mortem
- [ ] Plan improvements for next release

---

## 10. Rollback Plan (Emergency)

If critical issue after launch:

```bash
# Find previous working deployment
# In Railway dashboard → Deployments tab → choose service

# Redeploy previous version
Click "Redeploy" button on previous deployment
# Service reverts in 2-3 minutes
```

---

## 11. Support & Documentation

- **Railway Docs:** https://docs.railway.app
- **Next.js Guide:** https://docs.railway.app/guides/nextjs
- **Express Guide:** https://docs.railway.app/guides/express
- **Troubleshooting:** https://docs.railway.app/guides/troubleshooting

---

## 12. Deployment Checklist (May 5 EOD)

- [ ] Ran `./scripts/railway-setup.sh` successfully
- [ ] All environment variables set in Railway
- [ ] PostgreSQL migrations applied
- [ ] Security headers configured
- [ ] CORS_ORIGIN and NEXT_PUBLIC_API_URL correct
- [ ] Validation script passes
- [ ] Logs show no critical errors
- [ ] All services have green status
- [ ] Health check responds 200 OK
- [ ] Frontend loads without errors
- [ ] API responds to requests

---

**Questions?** Check RAILWAY_DEPLOYMENT.md for detailed documentation.
