# ✅ Relay Links - Open in New Tab

**Date:** 2026-03-05 21:09
**Status:** 🎉 **UPDATED**
**Change:** Relay navigation links now open in new tabs

---

## What Changed

All Relay navigation links throughout the dashboard now open in **new tabs** instead of navigating in the current tab.

### Before:
- Clicking "Relay" → Opened dashboard's Relay metrics page in same tab
- Required clicking "Open Relay Interface" button to see actual Relay service
- Confusing UX - users didn't know which page they were on

### After:
- Clicking "Relay" → **Opens actual Relay service in new tab**
- Direct access to Relay interface
- Clear separation between dashboard and Relay

---

## Files Modified

### 1. `/src/components/dashboard/header.tsx`
**Line 63-70:** Changed from Next.js `Link` to HTML `<a>` tag

**Before:**
```tsx
<Link href="/relay">
  <Button variant="outline" size="sm" asChild>
    <span className="hidden sm:inline-flex">
      <Zap className="h-4 w-4 mr-2" />
      Relay
    </span>
  </Button>
</Link>
```

**After:**
```tsx
<a href="/relay" target="_blank" rel="noopener noreferrer">
  <Button variant="outline" size="sm" asChild>
    <span className="hidden sm:inline-flex">
      <Zap className="h-4 w-4 mr-2" />
      Relay
    </span>
  </Button>
</a>
```

### 2. `/src/components/layout/top-navigation.tsx`
**Lines 76-94 (Desktop Nav):** Added conditional logic to detect Relay link
**Lines 153-176 (Mobile Nav):** Added conditional logic to detect Relay link

**Key Changes:**
- Check if `item.href === '/relay'`
- If Relay: Use `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"`
- If other: Use Next.js `<Link>` component

---

## Behavior

### Desktop Navigation:
1. User clicks "Relay" in dropdown menu
2. **New tab opens** with Relay service interface
3. Dashboard stays open in original tab

### Mobile Navigation:
1. User taps "Relay" in mobile menu
2. **New tab opens** with Relay service interface
3. Dashboard stays open in original tab

### Header Button:
1. User clicks "Relay" button in header
2. **New tab opens** with Relay service interface
3. Dashboard stays open in original tab

---

## Benefits

✅ **Direct Access:** One click takes you directly to Relay
✅ **Dashboard Remains Open:** Original tab stays on dashboard
✅ **Clear UX:** Users know they're going to a different service
✅ **No Confusion:** Can easily switch between dashboard and Relay tabs

---

## Technical Details

### `target="_blank"`
Opens the link in a new tab/window instead of the current one.

### `rel="noopener noreferrer"`
Security best practice for links opening in new windows:
- **noopener:** Prevents the new page from accessing the window.opener property
- **noreferrer:** Prevents passing the referrer URL to the new page

### Conditional Rendering
```tsx
const isRelay = item.href === '/relay'

{isRelay ? (
  <a href="/relay" target="_blank" rel="noopener noreferrer">
    {/* Button */}
  </a>
) : (
  <Link href={item.href}>
    {/* Button */}
  </Link>
)}
```

---

## URLs

All Relay links go to:
- **HTTPS:** https://bitloom.cloud/relay
- **Bypasses OAuth:** No authentication required
- **Direct to Relay:** Proxies to port 3002 (Relay service)
- **New Tab:** Opens in new browser tab

---

## User Experience

### Before (Confusing):
1. User clicks "Relay"
2. Stays on same tab, shows dashboard metrics
3. User has to click "Open Relay Interface" button
4. Gets confused about which page is which

### After (Clear):
1. User clicks "Relay"
2. **New tab opens** with actual Relay service
3. Dashboard remains available in original tab
4. User can easily switch between tabs

---

## Testing

### ✅ Desktop Header:
- Click "Relay" button → Opens Relay in new tab

### ✅ Desktop Navigation:
- Click "Relay" in dropdown → Opens Relay in new tab

### ✅ Mobile Navigation:
- Tap "Relay" in mobile menu → Opens Relay in new tab

### ✅ All Links:
- Open in new tab
- Don't interfere with dashboard session
- Bypass OAuth correctly
- Load actual Relay interface

---

## Status: ✅ COMPLETE

**All Relay navigation links** now open in new tabs, providing direct access to the Relay service while keeping the dashboard accessible in the original tab.

**Users can now easily navigate between the dashboard and Relay service!** 🎉
