# Hiring Engineer #2 for Public Beta Scaling (BER-19)

## Context & Urgency

- **Public Beta Launch**: May 6, 2026 (9 days)
- **Expected Users**: 500+ beta testers
- **Critical Deadline**: May 1, 2026 (infrastructure, security, load testing due)
- **Current Team Size**: 1 engineer (backend/full-stack)
- **Scope Gap**: Multiple critical path items incomplete per BETA_LAUNCH_PLAN.md

## Role Definition: Senior/Mid-Level DevOps/Infrastructure Engineer

### Primary Responsibilities

**Immediate (May 1 deadline):**
1. **Production Deployment Infrastructure** (blocking item)
   - Set up Railway.app or Vercel deployment for frontend (Next.js)
   - Configure backend deployment pipeline (Express.js container)
   - Set up managed PostgreSQL production database
   - Configure environment variables and secrets management
   - Establish CI/CD pipeline integration

2. **Security Hardening** (5+ incomplete items)
   - Rate limiting on authentication endpoints
   - Account lockout mechanism (failed attempts)
   - Password strength validation
   - Email verification on signup
   - HTTPS enforcement in production
   - CORS configuration hardening
   - Input validation across all endpoints
   - DDoS protection setup
   - WAF configuration (if using AWS)
   - Regular backup automation with verification
   - Security monitoring and alerting rules

3. **Performance & Load Testing**
   - Run load testing (k6/Artillery) against target: 500 concurrent users
   - Identify and fix bottlenecks
   - Optimize database queries if needed
   - Configure caching strategy (Redis if needed)
   - Performance monitoring setup (APM tool)

4. **Monitoring & Alerting** (blocking for launch)
   - Implement critical alert rules (error rate >5%, p99 latency >5s, etc.)
   - Set up monitoring dashboard (Grafana/Datadog)
   - Configure log aggregation
   - Implement uptime monitoring and status page
   - Define incident response runbook

**Post-Launch (May 6+):**
5. **24/7 On-Call Support** (first 48 hours minimum)
   - Monitor system health and metrics
   - Respond to critical incidents
   - Support user onboarding at scale
   - Quick hotfix deployment capability

6. **Post-Launch Optimization** (Weeks 2-4)
   - Monitor daily error logs and user feedback
   - Performance tuning based on real user load
   - Feature flag rollout management
   - Infrastructure cost optimization

## Required Skills & Experience

### Must Have
- **3+ years**: DevOps/Infrastructure engineering or full-stack with strong ops experience
- **Hands-on experience** with:
  - Docker containerization and container orchestration
  - PostgreSQL production deployments and optimization
  - Linux/Unix system administration
  - Git and CI/CD pipelines (GitHub Actions experience preferred)
  - SSL/TLS and security best practices
  - APM/monitoring tools (Datadog, New Relic, Prometheus, etc.)

### Nice to Have
- Experience with Railway.app, Vercel, or similar PaaS platforms
- Load testing tools (k6, Artillery, JMeter)
- AWS or cloud platform infrastructure experience
- Database backup and disaster recovery setup
- Rate limiting and DDoS mitigation experience
- Incident response and on-call support experience

### Soft Skills
- **Startup mentality**: Comfortable with tight deadlines and high urgency
- **Communication**: Can quickly understand requirements and escalate blockers
- **Ownership**: Takes initiative on critical path items without micromanagement
- **Triaging**: Can prioritize between multiple urgent tasks
- **Documentation**: Leaves clear notes for team handoff and troubleshooting

## Hiring Timeline

### Phase 1: Sourcing (ASAP - Complete by Apr 28)
- **Channels**: 
  - LinkedIn (DevOps/Infrastructure engineers in your network)
  - Hacker News hiring threads
  - YCombinator startup job boards
  - Referrals from existing network
  - Job boards: Positioning for "urgent" contract/FT role

- **Outreach Template**:
  ```
  Subject: Urgent DevOps Engineer Needed - Family Wealth MVP (Public Beta May 6)

  We're launching our financial goal-tracking platform for public beta on May 6 
  with 500+ users. We need an experienced DevOps/Infrastructure engineer to handle 
  production deployment, security hardening, and load testing before launch.

  **Timeline**: 9 days until launch, 4 days for critical infrastructure deadline
  **Commitment**: Full-time through May 20 (end of Phase 1 beta), with potential 
  to extend if interested
  
  Key responsibilities:
  - Production infrastructure setup (Railway/Vercel)
  - Security audit implementation
  - Load testing and performance optimization
  - Monitoring/alerting configuration
  - 24/7 on-call during first 48 hours post-launch

  If you're interested in a high-impact startup role with immediate urgency, 
  let's chat. Can you jump on a call tomorrow?
  ```

### Phase 2: Screening (Apr 28-29)
- **Quick 30-min call** to assess:
  1. Current availability (can start immediately?)
  2. Experience with similar projects
  3. Comfort level with tight deadline
  4. Understanding of required tech stack
  5. Red flags (over-committed, no DevOps experience, etc.)

### Phase 3: Technical Interview (Apr 29-30)
- **Format**: 60-90 min technical discussion + code review (if time)
- **Topics**:
  1. Walk through their most recent DevOps/infra project
  2. How would you set up production deployment for our stack? (Docker + Node.js + Next.js + PostgreSQL)
  3. Security hardening checklist - what's your approach?
  4. Load testing methodology - how would you stress test our API?
  5. Incident response - describe a production incident you responded to

### Phase 4: Team Meeting (Apr 30)
- Meet with current backend engineer and CTO
- Discuss on-call expectations and support model
- Confirm timeline and deliverables
- Offer decision within 24 hours

### Phase 5: Onboarding (May 1 morning)
- Quick walkthrough of codebase and deployment requirements
- Access to infrastructure setup guide
- Clear prioritized list of deliverables by May 1 EOD
- Pair programming session if needed for critical path items

## Compensation Framework

### For 9-Day Critical Launch Support + 2-Week Post-Launch (Target)

**Option A: Contract (Preferred for urgency)**
- **Daily Rate**: $1,500-2,000/day (includes on-call)
- **Total Estimate**: $15,000-20,000 for 9-day launch + 2-week support (13 days work)
- **Advantages**: Quick hiring, no benefits negotiation, clear end date

**Option B: Equity + Hourly (If founder fit)**
- **Hourly**: $150-200/hr (40-50 hrs/week = $6-10k/week)
- **Equity**: 0.25-0.5% (4-year vesting)
- **Advantages**: Potential long-term team member if they want to stay

**Option C: Hybrid (If they want to stay post-launch)**
- **Launch period (May 1-20)**: $1,500/day contract
- **Post-launch (May 20+)**: Convert to $120-150k/year FT if retention desired
- **Equity**: Negotiate based on early contribution

## Interview Questions (Technical Depth)

1. **Production Deployment**: "Our stack is Node.js/Express backend + Next.js frontend + PostgreSQL. We need production-ready deployment by May 1 for 500 users. Walk me through your approach. What are the first 3 things you'd do?"

2. **Security Hardening**: "Here are 15 incomplete security items in our checklist. How would you prioritize which to implement first by May 1? What's your rationale?"

3. **Load Testing**: "We need to support 100 concurrent users day 1, scaling to 500 by end of week 1. How would you load test our infrastructure? What tools and metrics would you use?"

4. **Problem-Solving Under Pressure**: "It's May 1, 11:59 PM. You just discovered the API p99 latency is 8 seconds under load, target is 2s. We launch tomorrow. Walk me through your diagnosis and fix approach."

5. **Documentation & Handoff**: "This is a startup - documentation matters. Walk me through what you'd document for the on-call team during launch week."

## Evaluation Rubric

### Must-Have Score (Go/No-Go)
- ✅ Can articulate a concrete deployment plan for our stack
- ✅ Has real production DevOps experience (not just hobby projects)
- ✅ Can start within 24-48 hours
- ✅ Comfortable with on-call support and startup urgency
- ❌ Any red flags on security knowledge or past incidents

### Nice-to-Have Score (Tie-breaker)
- PaaS platform experience (Railway, Vercel)
- Load testing tools hands-on
- PostgreSQL optimization background
- Kubernetes/container orchestration
- Startup or high-growth SaaS experience

## Contingency Plan (If cannot hire by May 1)

If Engineer #2 cannot be hired in time:

1. **May 1 (Current engineer + CTO manual work)**:
   - Deploy to Railway.app (simpler than custom infra)
   - Implement critical security items only (rate limiting, HTTPS, CORS)
   - Skip load testing (accept risk, monitor closely on launch day)
   - Basic monitoring only (server uptime + error tracking)
   - Both CTO and engineer on-call 24/7 May 6-7

2. **May 8+ (After launch)**:
   - Hire Engineer #2 for post-launch hardening
   - Run load tests and optimize
   - Implement deferred security items
   - Build out monitoring/alerting

## Success Criteria (for this hire)

### By May 1 EOD (Launch Readiness)
- ✅ Production infrastructure deployed and tested
- ✅ Critical security items implemented
- ✅ Load testing completed (100+ concurrent users confirmed stable)
- ✅ Monitoring/alerting configured
- ✅ Incident runbook documented

### By May 7 AM (Post-Launch Support)
- ✅ 48 hours of on-call support completed
- ✅ All critical incidents resolved within SLA
- ✅ No unplanned downtime during launch week
- ✅ Team feels confident handing off to other support systems

### Retention Signal
- ✅ Engineer reports positive experience
- ✅ Found the urgency/scope interesting
- ✅ Would consider staying for scaling phase
- (Make offer for permanent FT role if signals positive)

## Next Steps for CTO

1. **Today (Apr 27)**: Finalize this hiring plan and role description
2. **Tomorrow (Apr 28)**: Begin outreach via LinkedIn, referrals, job boards (emphasize urgency)
3. **Apr 28 PM**: First screening calls with responsive candidates
4. **Apr 29**: Technical interviews with top 2-3 candidates
5. **Apr 30**: Team meeting + offer decision
6. **May 1**: Onboarding + critical path delivery

---

## References

- BETA_LAUNCH_PLAN.md - Detailed infrastructure and launch requirements
- SECURITY_CHECKLIST.md - Security hardening requirements
- BETA_LAUNCH_RUNBOOK.md - Operational procedures

## Contact

**CTO**: murshid@trale.ai
**Urgency Level**: CRITICAL (launch in 9 days)
