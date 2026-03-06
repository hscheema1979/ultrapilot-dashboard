# Security Audit - GitHub Mission Control Dashboard

**Generated:** 2026-03-06
**Dashboard Path:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/`
**Phase:** 0.5.1 - Component Inventory & Security Audit
**Audit Type:** Comprehensive Security Review
**Severity Scale:** Critical (9-10) | High (7-8) | Medium (4-6) | Low (1-3)

---

## Executive Summary

This security audit identified **8 security issues** across the dashboard codebase:
- **3 Critical** issues requiring immediate remediation
- **3 High** severity issues
- **2 Medium** severity issues

**Most Critical Issue:** Exposed GitHub credentials via `NEXT_PUBLIC_` environment variable prefixes, which makes sensitive data visible to all frontend users.

**Overall Security Rating:** ⚠️ **NEEDS IMPROVEMENT** (4/10)

---

## 1. CRITICAL ISSUES

### 1.1 🔴 Exposed GitHub Credentials - `NEXT_PUBLIC_GITHUB_TOKEN`

**Severity:** CRITICAL (10/10)
**CVSS Score:** 9.8 (Critical)
**CWE:** CWE-200 (Exposure of Sensitive Information)
**Location:** `.env.example`, `/src/lib/github-auth.ts`

**Issue:**
The `.env.example` file contains:
```bash
NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
```

**Why This Is Critical:**
1. `NEXT_PUBLIC_` prefix in Next.js makes environment variables **publicly accessible in the browser**
2. Any user can inspect the frontend JavaScript and extract the GitHub token
3. The token provides full repository access (read/write/delete)
4. Attackers can use exposed tokens to:
   - Steal source code
   - Push malicious commits
   - Delete repositories
   - Access private issues/PRs
   - Impersonate the application

**Evidence:**
- File: `.env.example`, line 4
- File: `/src/lib/github-auth.ts`, lines 17-18 (fallback logic)
- The GitHub auth service falls back to `NEXT_PUBLIC_GITHUB_OWNER` and `NEXT_PUBLIC_GITHUB_REPO`

**Impact:**
- Complete compromise of GitHub repository
- Data breach
- Code injection
- Supply chain attack

**Remediation:**
1. **IMMEDIATE:** Remove `NEXT_PUBLIC_GITHUB_TOKEN` from `.env.example`
2. **IMMEDIATE:** Remove fallback logic in `/src/lib/github-auth.ts` (lines 17-18)
3. Use server-side only environment variables:
   ```bash
   # .env.local (server-side only, NEVER commit)
   GITHUB_APP_ID=123456
   GITHUB_APP_INSTALLATION_ID=789012
   GITHUB_APP_PRIVATE_KEY_PATH=/path/to/key.pem
   GITHUB_OWNER=username
   GITHUB_REPO=repository
   ```
4. Update `.gitignore` to ensure `.env.local` is never committed
5. Rotate all exposed GitHub tokens immediately

---

### 1.2 🔴 Open CORS Policy - `/api/relay/proxy`

**Severity:** CRITICAL (9/10)
**CVSS Score:** 9.1 (Critical)
**CWE:** CWE-942 (Permissive Cross-domain Policy)
**Location:** `/src/app/api/relay/proxy/route.ts`

**Issue:**
The Relay proxy route allows unrestricted CORS access:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}
```

**Why This Is Critical:**
1. **Open Proxy:** Any website can make requests to your Relay service
2. **No Authentication:** Anyone can proxy requests through your dashboard
3. **SSRF Vulnerability:** Attackers can use this to scan internal networks
4. **Data Exfiltration:** Attackers can bypass CORS restrictions on other sites

**Attack Scenario:**
```javascript
// Attacker's malicious site
fetch('https://your-dashboard.com/api/relay/proxy?path=/admin/delete-all')
  .then(r => r.json())
  .then(data => console.log('Data stolen:', data))
```

**Impact:**
- Unauthorized access to Relay service
- Internal network scanning
- Data exfiltration
- Bypass of security controls

**Remediation:**
1. **IMMEDIATE:** Remove `Access-Control-Allow-Origin: *`
2. Add authentication middleware:
   ```typescript
   // Add to route.ts
   import { verifyAuth } from '@/lib/auth'

   export async function GET(request: NextRequest) {
     // Verify user is authenticated
     const user = await verifyAuth(request)
     if (!user) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
     // ... rest of code
   }
   ```
3. Restrict CORS to specific origins:
   ```typescript
   const allowedOrigins = ['https://yourdomain.com']
   const origin = request.headers.get('origin')
   if (!allowedOrigins.includes(origin)) {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
   }
   ```
4. Add rate limiting
5. Add request logging and monitoring

---

### 1.3 🔴 Unauthenticated API Routes

**Severity:** CRITICAL (8/10)
**CVSS Score:** 8.6 (High)
**CWE:** CWE-306 (Missing Authentication for Critical Function)
**Location:** All API routes in `/src/app/api/`

**Issue:**
**All API routes lack authentication checks:**
- `/api/metrics` - Anyone can fetch metrics
- `/api/workflows` - Anyone can trigger workflows
- `/api/tasks` - Anyone can create/modify/delete tasks
- `/api/projects` - Anyone can modify projects
- `/api/lifecycle/active` - Anyone can view active sessions
- `/api/lifecycle/metrics` - Anyone can view metrics

**Evidence:**
```typescript
// /src/app/api/projects/route.ts
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await createProject(body)  // NO AUTH CHECK!
    return NextResponse.json({ project }, { status: 201 })
  }
}
```

**Why This Is Critical:**
1. **Unauthorized Data Access:** Anyone can fetch sensitive project data
2. **Data Manipulation:** Anyone can create/update/delete projects
3. **Workflow Abuse:** Attackers can trigger unwanted workflows
4. **Privacy Violation:** User data exposed without authentication

**Impact:**
- Data breach
- Unauthorized project modifications
- Resource abuse (workflow triggering)
- Privacy violations

**Remediation:**
1. **IMMEDIATE:** Add authentication middleware to all API routes
2. Implement session-based authentication or JWT tokens
3. Add authorization checks (user can only access their own projects)
4. Example middleware:
   ```typescript
   // middleware.ts
   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'

   export async function middleware(request: NextRequest) {
     const token = request.headers.get('authorization')
     if (!token || !verifyToken(token)) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
     }
     return NextResponse.next()
   }

   export const config = {
     matcher: '/api/:path*'
   }
   ```

---

## 2. HIGH SEVERITY ISSUES

### 2.1 🟠 GitHub Token in Server-Side Code

**Severity:** HIGH (7/10)
**CVSS Score:** 7.5 (High)
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)
**Location:** `/src/app/api/github/status/route.ts`, `/src/lib/github-auth.ts`

**Issue:**
GitHub tokens are used directly in server-side code without encryption:
```typescript
'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
```

**Why This Is High Risk:**
1. Tokens stored in environment variables in cleartext
2. If server is compromised, tokens are easily accessible
3. No token rotation mechanism
4. Tokens may be logged in error messages

**Impact:**
- If server is compromised, attacker gets GitHub access
- Token leakage through error logs
- No automatic token expiration

**Remediation:**
1. Use secret management service (AWS Secrets Manager, Azure Key Vault, etc.)
2. Implement token rotation
3. Add token encryption at rest
4. Sanitize error messages to prevent token leakage
5. Use GitHub App authentication (already implemented) instead of personal tokens

---

### 2.2 🟠 Missing Rate Limiting

**Severity:** HIGH (7/10)
**CVSS Score:** 7.5 (High)
**CWE:** CWE-770 (Allocation of Resources Without Limits)
**Location:** All API routes

**Issue:**
**No rate limiting on any API routes.**

**Why This Is High Risk:**
1. **DoS Attacks:** Attackers can flood API with requests
2. **Resource Exhaustion:** Can exhaust server resources
3. **Cost Attack:** Can abuse GitHub API quotas
4. **Brute Force:** Can attempt authentication without limits

**Attack Scenario:**
```bash
# Attacker floods the API
for i in {1..10000}; do
  curl https://dashboard.com/api/workflows &
done
```

**Impact:**
- Service unavailability
- Increased costs (GitHub API rate limits)
- Poor performance for legitimate users

**Remediation:**
1. Implement rate limiting middleware:
   ```typescript
   import { Ratelimit } from "@upstash/ratelimit"
   import { Redis } from "@upstash/redis"

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, "10 s"),
   })

   export async function GET(request: NextRequest) {
     const identifier = request.ip ?? 'anonymous'
     const { success } = await ratelimit.limit(identifier)
     if (!success) {
       return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
     }
     // ... rest of code
   }
   ```
2. Use Next.js rate limiting libraries (upstash/ratelimit)
3. Add request logging and monitoring
4. Implement IP-based blocking for repeated violations

---

### 2.3 🟠 Path Traversal Vulnerability - `/api/relay/proxy`

**Severity:** HIGH (7/10)
**CVSS Score:** 7.5 (High)
**CWE:** CWE-22 (Improper Limitation of a Pathname)
**Location:** `/src/app/api/relay/proxy/route.ts`

**Issue:**
The proxy route accepts any path without validation:
```typescript
const relayPath = searchParams.get('path') || '/'
const relayUrl = `http://localhost:3002${relayPath}`
```

**Why This Is High Risk:**
1. **Path Traversal:** Attacker can access unintended endpoints
2. **Internal Network Access:** Can access internal services
3. **Local File Inclusion:** May access local files if Relay service is misconfigured

**Attack Scenario:**
```bash
# Access admin endpoints
curl 'https://dashboard.com/api/relay/proxy?path=/admin/delete-all'

# Access internal services
curl 'https://dashboard.com/api/relay/proxy?path=/../internal-service/config'
```

**Impact:**
- Unauthorized access to internal services
- Data exposure
- Service manipulation

**Remediation:**
1. **IMMEDIATE:** Implement path validation:
   ```typescript
   const ALLOWED_PATHS = ['/projects', '/sessions', '/metrics']

   export async function GET(request: NextRequest) {
     const searchParams = request.nextUrl.searchParams
     const relayPath = searchParams.get('path') || '/'

     // Validate path
     const isAllowed = ALLOWED_PATHS.some(allowed =>
       relayPath.startsWith(allowed)
     )
     if (!isAllowed) {
       return NextResponse.json(
         { error: 'Invalid path' },
         { status: 400 }
       )
     }
     // ... rest of code
   }
   ```
2. Whitelist allowed paths
3. Sanitize path input
4. Add authentication (see 1.3)

---

## 3. MEDIUM SEVERITY ISSUES

### 3.1 🟡 Lack of Input Validation

**Severity:** MEDIUM (6/10)
**CVSS Score:** 6.5 (Medium)
**CWE:** CWE-20 (Improper Input Validation)
**Location:** Multiple API routes

**Issue:**
API routes don't validate input data:
```typescript
// /src/app/api/projects/route.ts
export async function POST(request: Request) {
  const body = await request.json()
  const project = await createProject(body)  // NO VALIDATION!
}
```

**Why This Is Risky:**
1. Invalid data can corrupt database
2. Missing required fields can cause errors
3. Injection attacks possible
4. Data type mismatches

**Impact:**
- Data corruption
- Application crashes
- Potential injection attacks

**Remediation:**
1. Implement schema validation with Zod:
   ```typescript
   import { z } from 'zod'

   const ProjectSchema = z.object({
     name: z.string().min(1).max(100),
     owner: z.string().min(1),
     repo: z.string().min(1),
     description: z.string().max(500).optional(),
     color: z.string().regex(/^#[0-9A-F]{6}$/i),
     enabled: z.boolean().default(true),
   })

   export async function POST(request: Request) {
     const body = await request.json()
     const validated = ProjectSchema.parse(body)
     const project = await createProject(validated)
   }
   ```
2. Validate all user input
3. Sanitize data before storage
4. Use TypeScript for type safety

---

### 3.2 🟡 Error Messages Expose Internal Information

**Severity:** MEDIUM (5/10)
**CVSS Score:** 5.3 (Medium)
**CWE:** CWE-209 (Information Exposure Through Error Messages)
**Location:** Multiple API routes

**Issue:**
Detailed error messages expose internal implementation:
```typescript
return NextResponse.json(
  {
    error: 'Failed to fetch projects',
    message: error instanceof Error ? error.message : 'Unknown error'
  },
  { status: 500 }
)
```

**Why This Is Risky:**
1. Exposes file paths
2. Reveals database structure
3. Shows internal logic
4. Aids attackers in reconnaissance

**Impact:**
- Information leakage
- Easier exploitation of other vulnerabilities

**Remediation:**
1. Use generic error messages for users:
   ```typescript
   return NextResponse.json(
     { error: 'An error occurred' },
     { status: 500 }
   )
   ```
2. Log detailed errors server-side:
   ```typescript
   console.error('[ERROR] Project fetch failed:', {
     error: error.message,
     stack: error.stack,
     userId: session.user.id,
     timestamp: new Date().toISOString()
   })
   ```
3. Implement error tracking (Sentry, etc.)
4. Never expose stack traces to users

---

## 4. SECURITY CHECKLIST

### ✅ Implemented
- [x] GitHub App authentication (recommended approach)
- [x] Token caching with expiration
- [x] TypeScript for type safety
- [x] Error boundary for graceful error handling

### ❌ Missing (Critical)
- [ ] Authentication on API routes
- [ ] Authorization checks (user-specific data access)
- [ ] Rate limiting
- [ ] Input validation
- [ ] CORS restrictions
- [ ] Path validation on proxy
- [ ] Secure error handling
- [ ] Logging and monitoring
- [ ] Security headers (CSP, X-Frame-Options, etc.)

---

## 5. RECOMMENDED SECURITY IMPROVEMENTS

### Immediate Actions (Within 24 Hours)
1. **Rotate all GitHub tokens** that may have been exposed
2. **Remove NEXT_PUBLIC_ prefixes** from `.env.example`
3. **Remove fallback logic** in `/src/lib/github-auth.ts`
4. **Add authentication** to all API routes
5. **Restrict CORS** on `/api/relay/proxy`

### Short-Term Actions (Within 1 Week)
1. Implement rate limiting on all API routes
2. Add input validation with Zod
3. Implement path validation on proxy routes
4. Add security headers (via Next.js config)
5. Set up error logging (Sentry, LogRocket, etc.)

### Long-Term Actions (Within 1 Month)
1. Implement comprehensive authentication system
2. Add role-based access control (RBAC)
3. Implement audit logging
4. Set up security monitoring and alerts
5. Conduct penetration testing
6. Implement Content Security Policy (CSP)
7. Add CSRF protection

---

## 6. SECURITY HEADERS CONFIGURATION

Add to `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}
```

---

## 7. ENVIRONMENT VARIABLE SECURITY

### ❌ Current (INSECURE)
```bash
# .env.example
NEXT_PUBLIC_GITHUB_TOKEN=your_token_here
NEXT_PUBLIC_GITHUB_OWNER=your_username
NEXT_PUBLIC_GITHUB_REPO=your_repository
```

### ✅ Recommended (SECURE)
```bash
# .env.local (NEVER COMMIT TO GIT)
# GitHub App Configuration (Server-side only)
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=789012
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_OWNER=username
GITHUB_REPO=repository

# Application Configuration
NEXT_PUBLIC_SITE_URL=https://dashboard.example.com
SESSION_SECRET=your-random-session-secret-here

# .env.example (SAFE TO COMMIT)
GITHUB_APP_ID=your_app_id_here
GITHUB_APP_INSTALLATION_ID=your_installation_id_here
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/key.pem
GITHUB_OWNER=your_username
GITHUB_REPO=your_repository
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 8. COMPLIANCE & STANDARDS

### OWASP Top 10 (2021) Coverage
- [ ] A01:2021 – Broken Access Control ❌
- [ ] A02:2021 – Cryptographic Failures ⚠️ (tokens in env vars)
- [ ] A03:2021 – Injection ⚠️ (no input validation)
- [ ] A04:2021 – Insecure Design ⚠️ (no auth on API routes)
- [ ] A05:2021 – Security Misconfiguration ❌ (open CORS)
- [ ] A06:2021 – Vulnerable Components ✅ (deps up-to-date)
- [ ] A07:2021 – Identification and Authentication Failures ❌
- [ ] A08:2021 – Software and Data Integrity Failures ⚠️
- [ ] A09:2021 – Security Logging and Monitoring Failures ❌
- [ ] A10:2021 – Server-Side Request Forgery (SSRF) ⚠️ (proxy route)

### ASVS Level 1 Coverage
- [x] V1: Architecture ⚠️
- [ ] V2: Authentication ❌
- [ ] V3: Session Management ❌
- [ ] V4: Access Control ❌
- [ ] V5: Validation ⚠️
- [ ] V6: Cryptography ⚠️
- [ ] V7: Error Handling ⚠️
- [ ] V8: Data Protection ⚠️
- [ ] V9: Communications ⚠️
- [ ] V10: Malicious Code ✅
- [ ] V11: Business Logic ✅
- [ ] V12: Files and Data ✅

---

## 9. DEPENDENCY SECURITY

### Checked Dependencies
✅ All dependencies are up-to-date
✅ No known critical vulnerabilities in current versions
✅ Using latest Next.js (16.1.6) and React (19.2.3)

### Recommendations
1. Run `npm audit` regularly
2. Set up Dependabot for automated dependency updates
3. Review security advisories for GitHub dependencies
4. Implement Snyk or similar for ongoing monitoring

---

## 10. CONCLUSION

The UltraPilot Dashboard has **significant security vulnerabilities** that require immediate attention:

### Critical Path to Remediation:
1. **Day 1:** Fix exposed credentials (remove NEXT_PUBLIC_)
2. **Day 1:** Add authentication to all API routes
3. **Day 2:** Fix CORS and path validation on proxy
4. **Week 1:** Implement rate limiting and input validation
5. **Week 2:** Add comprehensive logging and monitoring

### Security Posture Assessment:
- **Current:** ⚠️ **VULNERABLE** (4/10)
- **After Critical Fixes:** 🟡 **NEEDS IMPROVEMENT** (6/10)
- **After All Recommendations:** ✅ **SECURE** (8/10)

### Key Takeaways:
- The dashboard uses GitHub App authentication (good), but has fallback to exposed credentials (bad)
- No authentication on API routes is the most critical vulnerability
- Open CORS policy creates a significant attack surface
- The codebase is well-structured, making security improvements straightforward

---

**Next Steps:**
1. Review this audit with the development team
2. Prioritize critical issues for immediate remediation
3. Create security tickets for each issue
4. Implement fixes in order of severity
5. Conduct follow-up audit after fixes

---

**End of Security Audit**

**Audit conducted by:** Claude (UltraPilot Agent)
**Audit methodology:** Manual code review, OWASP Top 10, ASVS standards
**Recommendations:** Prioritized by severity and business impact
