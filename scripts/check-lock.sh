#!/bin/bash
# Check Relay Navigation Lock Status
# Run this script to verify locked files are unchanged

echo "🔒 Relay Navigation Lock Status Check"
echo "======================================"
echo ""

# Files to check
FILES=(
  "src/components/dashboard/header.tsx"
  "src/components/layout/top-navigation.tsx"
  "src/app/relay/page.tsx"
)

ALL_LOCKED=true

for FILE in "${FILES[@]}"; do
  if [ -f "$FILE" ]; then
    PERMISSIONS=$(stat -c %a "$FILE" 2>/dev/null || stat -f %Lp "$FILE")

    # Check if owner has write permission
    # In octal: 6=rw, 7=rwx, 4=r, 5=rx
    # Files with 6 or 7 are writable, 4 or 5 are read-only
    OWNER_PERM=${PERMISSIONS:0:1}

    if [[ "$OWNER_PERM" =~ [67] ]]; then
      echo "⚠️  $FILE"
      echo "   Status: NOT locked (writable by owner)"
      echo "   Permissions: $PERMISSIONS (octal)"
      echo ""
      echo "   To lock: chmod -w $FILE"
      ALL_LOCKED=false
    else
      echo "✅ $FILE"
      echo "   Status: Read-only locked"
      echo "   Permissions: $PERMISSIONS (octal)"
    fi
  else
    echo "❌ $FILE"
    echo "   Status: File not found"
    ALL_LOCKED=false
  fi
  echo ""
done

if [ "$ALL_LOCKED" = true ]; then
  echo "✅ All Relay navigation files are LOCKED"
  echo ""
  echo "To make changes (with user approval):"
  echo "  1. chmod u+w <file>"
  echo "  2. Make changes"
  echo "  3. chmod -w <file>"
  echo "  4. Commit with [UNLOCK] message"
else
  echo "⚠️  Some files are NOT locked"
  echo ""
  echo "To lock all files:"
  echo "  chmod -w src/components/dashboard/header.tsx"
  echo "  chmod -w src/components/layout/top-navigation.tsx"
  echo "  chmod -w src/app/relay/page.tsx"
fi

echo ""
echo "📖 See RELAY-NAV-LOCKED.md for details"
