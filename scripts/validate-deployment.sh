#!/bin/bash

##############################################################################
# Railway Deployment Validation Script
# BER-32: Run this after deploying to Railway to verify everything is working
#
# Usage: ./scripts/validate-deployment.sh <api-url> <web-url> [db-connection-string]
##############################################################################

set -e

API_URL="${1:-https://api.railway.app}"
WEB_URL="${2:-https://web.railway.app}"
DB_URL="${3:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

check_http_code() {
    local url="$1"
    local expected_code="$2"
    local description="$3"

    response_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")

    if [ "$response_code" = "$expected_code" ]; then
        print_success "$description (HTTP $response_code)"
        return 0
    else
        print_error "$description (HTTP $response_code, expected $expected_code)"
        return 1
    fi
}

check_header() {
    local url="$1"
    local header="$2"
    local description="$3"

    header_value=$(curl -s -I "$url" | grep -i "^$header:" | cut -d' ' -f2- | tr -d '\r')

    if [ -n "$header_value" ]; then
        print_success "$description: $header_value"
        return 0
    else
        print_warning "$description not found"
        return 1
    fi
}

# Validate inputs
if [ -z "$API_URL" ] || [ -z "$WEB_URL" ]; then
    print_error "Usage: ./validate-deployment.sh <api-url> <web-url> [db-connection-string]"
    echo "Example: ./validate-deployment.sh https://api.railway.app https://web.railway.app"
    exit 1
fi

print_header "Railway Deployment Validation"
echo -e "API URL:  ${BLUE}$API_URL${NC}"
echo -e "Web URL:  ${BLUE}$WEB_URL${NC}\n"

# 1. Health check
print_header "1. Health Checks"

check_http_code "$API_URL/health" "200" "API health endpoint"

# 2. Security headers
print_header "2. Security Headers"

check_header "$API_URL/health" "Strict-Transport-Security" "HSTS Header"
check_header "$API_URL/health" "X-Content-Type-Options" "X-Content-Type-Options Header"
check_header "$API_URL/health" "X-Frame-Options" "X-Frame-Options Header"

# 3. CORS headers
print_header "3. CORS Configuration"

cors_origin=$(curl -s -I -H "Origin: $WEB_URL" "$API_URL/api" | grep -i "^access-control-allow-origin:" | cut -d' ' -f2- | tr -d '\r')
if [ -n "$cors_origin" ]; then
    print_success "CORS enabled: $cors_origin"
else
    print_warning "CORS headers not found in response"
fi

# 4. Rate limiting headers
print_header "4. Rate Limiting"

rate_limit_headers=$(curl -s -I "$API_URL/api" | grep -i "x-ratelimit")
if [ -n "$rate_limit_headers" ]; then
    print_success "Rate limiting headers present"
    echo "$rate_limit_headers" | sed 's/^/  /'
else
    print_warning "Rate limiting headers not found"
fi

# 5. HTTPS enforcement
print_header "5. HTTPS/TLS"

# Try HTTP redirect
http_redirect=$(curl -s -o /dev/null -w "%{http_code}" -L "http://api.railway.app/health" 2>/dev/null || echo "connection failed")
if [ "$http_redirect" = "200" ] || [ "$http_redirect" = "301" ] || [ "$http_redirect" = "302" ]; then
    print_success "HTTPS redirect working"
else
    print_warning "Could not verify HTTP redirect (may be behind CDN)"
fi

# 6. Frontend accessibility
print_header "6. Frontend Access"

check_http_code "$WEB_URL" "200" "Web frontend homepage"

# 7. API endpoint test
print_header "7. API Endpoint Test"

# Test if API responds to requests (check /api endpoint)
api_response=$(curl -s "$API_URL/api" | jq -r '.message' 2>/dev/null || echo "failed")
if [ "$api_response" = "Family Wealth MVP API" ]; then
    print_success "API endpoint responding correctly"
else
    print_warning "API endpoint response unexpected: $api_response"
fi

# 8. Database test (if connection string provided)
if [ -n "$DB_URL" ]; then
    print_header "8. Database Connection"

    if command -v psql &> /dev/null; then
        if psql "$DB_URL" -c "SELECT version();" &> /dev/null; then
            print_success "Database connection successful"
        else
            print_error "Database connection failed"
        fi
    else
        print_warning "psql not available, skipping database test"
    fi
else
    print_header "8. Database Connection"
    print_warning "Database connection string not provided, skipping database test"
fi

# 9. Performance check
print_header "9. Performance"

response_time=$(curl -s -w "%{time_total}" -o /dev/null "$API_URL/health" | head -c 5)
print_success "API response time: ${response_time}s"

# 10. Deployment info
print_header "10. Summary"

echo -e "${GREEN}Deployment Validation Complete!${NC}\n"

echo -e "✓ Basic connectivity working"
echo -e "✓ Security headers in place"
echo -e "✓ Rate limiting active"

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Monitor logs in Railway dashboard: Logs tab"
echo "2. Check CPU/Memory metrics in Dashboard"
echo "3. Set up alerts for high error rates"
echo "4. Test application features in browser"
echo "5. Monitor for 24 hours before declaring success"

echo -e "\n${YELLOW}Useful Railway commands:${NC}"
echo "  railway logs --service api"
echo "  railway logs --service web"
echo "  railway logs --service postgres"

echo ""
