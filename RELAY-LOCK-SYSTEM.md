# 🔒 Relay Navigation Lock System - Complete Guide

**Date:** 2026-03-05 21:40
**Status:** ✅ **ACTIVE**
**What:** Multi-layer protection for Relay navigation design

---

## Overview

The Relay navigation design is now protected by **multiple independent lock mechanisms** to prevent accidental changes. This ensures the working design remains stable unless explicitly modified with approval.

---

## Lock Mechanisms (4 Layers)

### Layer 1: Documentation Lock ✅

**File:** `RELAY-NAV-LOCKED.md`

**Purpose:** Clearly mark design as locked, document specifications

**Contains:**
- Design specifications (exact behavior)
- Protected line numbers
- Change approval process
- Verification commands

**How it works:**
- Anyone changing code sees this file
- Serves as contract/documentation
- Reference for what's locked

---

### Layer 2: Git Pre-Commit Hook ✅

**File:** `.git/hooks/pre-commit`

**Purpose:** Warn before committing changes to locked code

**Protected Sections:**
- `header.tsx` lines 63-123 (Relay dropdown)
- `top-navigation.tsx` Relay items
- `relay/page.tsx` line ~254 (Open Chat buttons)

**Behavior:**
```bash
# Normal commit
$ git commit -m "Update header"
⚠️  WARNING: Changes detected to locked Relay dropdown in header.tsx
🔒 Relay navigation design is LOCKED. See RELAY-NAV-LOCKED.md
Continue with commit? (y/N):
```

**To bypass (with approval):**
```bash
git commit --no-verify -m "[UNLOCK] Fix bug in Relay dropdown"
```

---

### Layer 3: Automated Tests ✅

**File:** `src/__tests__/relay-navigation.spec.ts`

**Purpose:** Verify locked behavior through automated tests

**Tests:**
- ✅ Exactly 5 Relay projects in dropdown
- ✅ All links use `target="_blank"`
- ✅ All links use `rel="noopener noreferrer"`
- ✅ URLs follow exact format: `/p/{project}/`
- ✅ Project descriptions present
- ✅ External link icons present
- ✅ No incorrect URL formats

**Behavior:**
```bash
# If tests fail
npm test relay-navigation.spec.ts

❌ Relay Navigation Tests
  ✗ should have exactly 5 Relay projects in dropdown
    Expected: 5
    Received: 4

🔒 TEST FAILURE: Locked behavior broken!
   See RELAY-NAV-LOCKED.md before changing tests
```

---

### Layer 4: Lock Status Script ✅

**File:** `scripts/check-lock.sh`

**Purpose:** Check and display lock status of all files

**Usage:**
```bash
./scripts/check-lock.sh
```

**Output:**
```
🔒 Relay Navigation Lock Status Check
======================================

✅ src/components/dashboard/header.tsx
   Status: Read-only locked
   Permissions: -r--r--r--

⚠️  src/components/layout/top-navigation.tsx
   Status: NOT locked (writable)
   Permissions: -rw-r--r--

   To lock: chmod -w src/components/layout/top-navigation.tsx
```

---

## How to Use This System

### Normal Development

Just work as usual. The locks only trigger if you try to change the Relay navigation code.

```bash
# Edit other files - no warnings
git commit -m "Fix typo in footer"
✅ Commit accepted

# Try to change Relay dropdown - warning!
git commit -m "Update Relay projects"
⚠️  WARNING: Changes detected to locked Relay dropdown
Continue with commit? (y/N): N
❌ Commit aborted
```

### Check Lock Status

```bash
./scripts/check-lock.sh
```

Shows which files are locked/unlocked.

### If You MUST Change Something (With Approval)

**Step 1:** Read the lock documentation
```bash
cat RELAY-NAV-LOCKED.md
```

**Step 2:** Get user approval

**Step 3:** Temporarily unlock file (if read-only)
```bash
chmod u+w src/components/dashboard/header.tsx
```

**Step 4:** Make your changes

**Step 5:** Update tests to match new behavior

**Step 6:** Re-lock file
```bash
chmod -w src/components/dashboard/header.tsx
```

**Step 7:** Commit with unlock message
```bash
git commit --no-verify -m "[UNLOCK] Add new Relay project: Production"
```

**Step 8:** Update documentation
```bash
# Update RELAY-NAV-LOCKED.md with new design
```

---

## File Permissions (Optional Layer)

You can optionally make files read-only:

```bash
# Lock files (make read-only)
chmod -w src/components/dashboard/header.tsx
chmod -w src/components/layout/top-navigation.tsx
chmod -w src/app/relay/page.tsx

# Unlock file (temporarily)
chmod u+w src/components/dashboard/header.tsx

# Re-lock
chmod -w src/components/dashboard/header.tsx
```

**Note:** This is optional. The git hook and tests provide sufficient protection.

---

## Verification

All 4 layers work independently:

1. **Documentation** → Human-readable warning
2. **Git Hook** → Automated warning on commit
3. **Tests** → Automated verification of behavior
4. **Status Script** → Visual check of lock state

**Result:** Design is protected from casual changes while still allowing intentional modifications with approval.

---

## Summary

| Layer | Mechanism | Automatic? | Bypass |
|-------|-----------|------------|--------|
| 1 | Documentation | No | N/A |
| 2 | Git Hook | Yes | `--no-verify` flag |
| 3 | Tests | Yes (on test run) | Modify tests |
| 4 | File Permissions | No | `chmod u+w` |

**Together:** Multiple overlapping protections ensure the design stays stable unless intentionally changed.

---

## 🎯 Result

**Your Relay navigation design is now LOCKED and PROTECTED** by:

✅ Clear documentation marking it as locked
✅ Git pre-commit hook warning on changes
✅ Automated tests verifying behavior
✅ Status check script for visibility

**Casual changes are prevented. Intentional changes (with approval) are still possible.**

Perfect balance of stability and flexibility!
