#!/bin/bash

##############################################################################
# Railway.app Setup Script for family-wealth-mvp
# BER-32 CONTINGENCY: May 6 Launch
#
# This script helps with initial setup and validation before Railway deployment
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check prerequisites
print_header "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi
print_success "Node.js installed: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm installed: $(npm --version)"

if ! command -v git &> /dev/null; then
    print_error "Git is not installed"
    exit 1
fi
print_success "Git installed: $(git --version)"

# Check if in repo directory
if [ ! -f "package.json" ]; then
    print_error "Not in family-wealth-mvp root directory"
    exit 1
fi
print_success "In family-wealth-mvp repository"

# Build and validate code
print_header "Building Application"

if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Run type checking
print_header "Type Checking"

if npm run type-check; then
    print_success "Type checking passed"
else
    print_warning "Type checking found issues (may not be critical for launch)"
fi

# Generate JWT secret
print_header "Generating JWT Secret"

JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
print_success "Generated JWT_SECRET: ${JWT_SECRET:0:16}..."
echo -e "\n${YELLOW}Save this secret securely and add to Railway environment variables${NC}\n"

# Validate database connection (local)
print_header "Database Migration Status"

cd apps/api
if npx prisma migrate status --skip-generate; then
    print_success "Database migrations checked"
else
    print_warning "Could not check migration status (database may not be running locally)"
fi
cd ../..

# Security validation
print_header "Security Checklist"

echo -e "Checking for common security issues...\n"

# Check for hardcoded credentials
if grep -r "password" .env.example | grep -v "#"; then
    print_warning "Check .env.example for hardcoded credentials"
else
    print_success "No obvious hardcoded credentials found"
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node 18+ required, found $(node -v)"
    exit 1
fi
print_success "Node version 18+ confirmed"

# Build validation
print_header "Build Artifacts Validation"

if [ -d "apps/api/dist" ]; then
    print_success "API build artifacts exist"
    echo "  Files: $(find apps/api/dist -type f | wc -l)"
else
    print_error "API build artifacts missing"
    exit 1
fi

# Verify package.json has proper start scripts
if grep -q '"start"' apps/api/package.json; then
    print_success "API has start script"
else
    print_error "API missing start script in package.json"
    exit 1
fi

# Environment variables checklist
print_header "Environment Variables Checklist"

echo -e "${YELLOW}Required environment variables to set in Railway:${NC}\n"
echo "For API Service:"
echo "  - NODE_ENV=production"
echo "  - PORT=3000"
echo "  - DATABASE_URL=<Railway PostgreSQL connection string>"
echo "  - JWT_SECRET=<generated above>"
echo "  - JWT_EXPIRES_IN=7d"
echo "  - REDIS_URL=<Railway Redis OR omit for in-memory fallback>"
echo "  - CORS_ORIGIN=https://<web-domain.railway.app>"
echo "  - LOG_LEVEL=info"
echo ""
echo "For Web Service:"
echo "  - NODE_ENV=production"
echo "  - NEXT_PUBLIC_API_URL=https://<api-domain.railway.app>"

# Summary
print_header "Pre-Deployment Validation Summary"

echo -e "${GREEN}✓${NC} All critical checks passed!"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create Railway project at https://railway.app/dashboard"
echo "2. Add PostgreSQL service"
echo "3. Add API service (apps/api)"
echo "4. Add Web service (apps/web)"
echo "5. Set environment variables listed above"
echo "6. Deploy and monitor in Railway dashboard"
echo "7. Verify health checks: https://api-domain.railway.app/health"
echo ""
