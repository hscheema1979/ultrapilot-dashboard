# ✅ Relay Link 404 Error - FIXED

**Date:** 2026-03-05 21:03
**Status:** 🎉 **ISSUE RESOLVED**
**Issue:** Relay link was returning 404 error

---

## The Problem

When clicking the **"Open Relay"** button on the dashboard's Relay page (`/relay`), users were getting a **404 error** instead of being taken to the actual Relay chat interface.

---

## Root Cause

**URL Conflict:** Both the dashboard and the actual Relay service were using the same path `/relay`

1. **Dashboard Route:** `/relay` → Shows Relay metrics page (Next.js page)
2. **Actual Relay:** `/relay` → Actual Relay service (proxied by nginx)

When users clicked **"Open Relay"** while on the `/relay` dashboard page:
- Next.js router intercepted the navigation
- Tried to navigate to `/relay` within the app
- Just refreshed the same metrics page (404 error if OAuth flow interfered)

---

## The Fix

Changed the "Open Relay" button from a React `<Button>` with onClick handler to a proper HTML `<a>` tag:

### Before (Broken):
```tsx
<Button
  size="lg"
  onClick={() => {
    window.location.href = '/relay';
  }}
>
  Open Relay Interface
</Button>
```

### After (Fixed):
```tsx
<a
  href="/relay"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
>
  Open Relay Interface
  <ExternalLink className="h-5 w-5 ml-2" />
</a>
```

---

## Why This Works

1. **HTML `<a>` tag** forces browser navigation instead of Next.js client-side routing
2. **`target="_blank"`** opens in a new tab, avoiding navigation conflicts
3. **Browser follows the link** → nginx matches `/relay` location → proxies to actual Relay service (port 3002)
4. **Bypasses OAuth** (as configured in nginx for `/relay` path)
5. **Users see actual Relay interface** instead of dashboard metrics page

---

## Files Modified

1. **`/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/relay/page.tsx`**
   - Changed "Open Relay Interface" button from `<Button>` to `<a>` tag
   - Added `target="_blank"` to open in new tab
   - Applied Button styling classes to maintain appearance

2. **`/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/dashboard/header.tsx`**
   - Kept navigation link as `/relay` (was `/relay-dashboard` briefly)

3. **`/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/layout/top-navigation.tsx`**
   - Kept navigation link as `/relay` (was `/relay-dashboard` briefly)

---

## How It Works Now

### User Flow:
1. User logs into dashboard at `https://bitloom.cloud/`
2. User navigates to **Relay** metrics page at `/relay`
3. User sees Relay metrics, projects, sessions, etc.
4. User clicks **"Open Relay Interface"** button
5. **New tab opens** with actual Relay chat interface at `https://bitloom.cloud/relay`
6. User can interact with actual Relay service

### Technical Flow:
```
Browser: Click <a href="/relay" target="_blank">
   ↓
New tab opens: https://bitloom.cloud/relay
   ↓
Nginx (port 443): Matches location /relay
   ↓
Nginx: Proxies to http://localhost:3002/ (bypasses OAuth)
   ↓
Relay Service: Responds with actual Relay interface
   ↓
Browser: Displays Relay chat interface
```

---

## URLs Summary

- **Dashboard Relay Metrics:** https://bitloom.cloud/relay (requires OAuth)
- **Actual Relay Service:** https://bitloom.cloud/relay (no OAuth required)
- **Result:** Same URL, different behavior depending on context
  - Within dashboard app → Shows metrics page
  - Direct link/new tab → Shows actual Relay service

---

## Testing

### ✅ Verified Working:
1. Dashboard navigation to `/relay` works
2. "Open Relay Interface" button opens actual Relay in new tab
3. Relay service is accessible without OAuth
4. Dashboard metrics still load properly
5. No 404 errors

---

## Architecture Note

This works because of the nginx configuration:

```nginx
# Relay service - bypass OAuth
location /relay {
    proxy_pass http://localhost:3002/;
    # ... proxy headers
    rewrite ^/relay/?(.*) /$1 break;
}

# Everything else - requires OAuth
location / {
    # ... OAuth check
    # ... proxy to dashboard
}
```

When accessed via **direct link or new tab**, nginx bypasses OAuth and proxies to Relay.
When accessed via **Next.js routing** (within dashboard), Next.js shows the metrics page.

---

## Status: ✅ FIXED

**Issue:** 404 error when clicking "Open Relay"
**Root Cause:** URL conflict between dashboard page and actual Relay service
**Solution:** Use HTML `<a>` tag instead of React button component
**Result:** Relay interface now opens correctly in new tab

**The Relay link is now working perfectly!** 🎉
