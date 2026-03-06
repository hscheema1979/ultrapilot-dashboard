# 🔒 LOCKED - Relay Navigation Design

**Status:** 🔒 **PERMANENTLY LOCKED**
**Date Locked:** 2026-03-05 21:35
**Reason:** User-approved design, working perfectly, DO NOT MODIFY

---

## ⚠️ IMPORTANT - READ BEFORE CHANGING

**This Relay navigation design and functionality is LOCKED and should NEVER be changed.**

Any changes to these files require explicit user approval:
- `/src/components/dashboard/header.tsx` (Lines 63-123: Relay dropdown)
- `/src/components/layout/top-navigation.tsx` (Relay navigation items)
- `/src/app/relay/page.tsx` (Lines 249-259: Project card "Open Chat" buttons)

---

## Locked Design Specifications

### **Header Relay Button (Dropdown)**
- **Component:** Dropdown menu with 5 Relay projects
- **Behavior:** All links open in new tabs (`target="_blank"`)
- **Projects:**
  1. Ubuntu → `/p/ubuntu/`
  2. hscheema1979 → `/p/hscheema1979/`
  3. Projects → `/p/projects/`
  4. Dev → `/p/dev/`
  5. MyHealthTeam → `/p/myhealthteam/`
- **Visual:** Zap icon + ExternalLink icon + descriptions
- **Implementation:** Lines 63-123 in `header.tsx`

### **Top Navigation Relay Section**
- **Location:** Separate "Relay" section in dropdown
- **Items:** 5 project links with `external: true` flag
- **Behavior:** Open in new tabs
- **Implementation:** `top-navigation.tsx`

### **Relay Page Project Cards**
- **Buttons:** "Open Chat" on each project card
- **URL Format:** `/p/{project.id}/`
- **Action:** `window.open(url, '_blank')`
- **Implementation:** Line 254 in `relay/page.tsx`

---

## Protection Mechanisms

### 1. **File System Lock** (Read-Only)
```bash
# Make files read-only (prevents accidental edits)
chmod -w src/components/dashboard/header.tsx
chmod -w src/components/layout/top-navigation.tsx
chmod -w src/app/relay/page.tsx
```

### 2. **Git Pre-Commit Hook** (Warns on changes)
```bash
# Hook will reject changes without user confirmation
# See: .git/hooks/pre-commit
```

### 3. **Test Verification** (Enforces behavior)
```typescript
// tests/relay-navigation.spec.ts
// Tests verify:
// - All Relay links open in new tabs
// - URLs match exact format: /p/{project}/
// - Dropdown has exactly 5 projects
// - External link icons present
```

### 4. **Documentation Lock** (This file)
- Clearly marked as locked
- Design specifications documented
- Change approval required

---

## Changing This Design (If Absolutely Necessary)

**Step 1:** Get explicit user approval
**Step 2:** Update this locked.md with new design
**Step 3:** Update tests to match new behavior
**Step 4:** Remove file system lock: `chmod u+w <file>`
**Step 5:** Make changes
**Step 6:** Re-enable lock: `chmod -w <file>`
**Step 7:** Update tests pass
**Step 8:** Commit with "[UNLOCK] Design change" message

---

## Verification Commands

```bash
# Check if files are locked
ls -l src/components/dashboard/header.tsx
ls -l src/components/layout/top-navigation.tsx
ls -l src/app/relay/page.tsx

# Should show: -r--r--r-- (read-only)

# Run verification tests
npm run test:relay-nav

# Should pass: All Relay navigation tests
```

---

## Sign-off

**Locked by:** User request (2026-03-05 21:35)
**Verified:** Working perfectly - one-click direct project access
**Approval Required:** Any changes must have user sign-off

---

## 🚫 DO NOT MODIFY WITHOUT USER APPROVAL 🚫
