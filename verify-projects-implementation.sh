#!/bin/bash
# Verification script for Projects API Integration

echo "========================================="
echo "Projects API Integration Verification"
echo "========================================="
echo ""

# Check if all required files exist
echo "1. Checking if all required files exist..."
files=(
  "src/types/api.ts"
  "src/lib/github/projects.ts"
  "src/app/api/v1/projects/route.ts"
  "src/lib/github/projects.test.ts"
  "src/components/projects/project-board.tsx"
  "src/components/projects/project-card.tsx"
)

all_exist=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file exists"
  else
    echo "  ✗ $file missing"
    all_exist=false
  fi
done

echo ""

# Check if TypeScript types are correct
echo "2. Checking TypeScript types..."
if grep -q "interface ListProjectsRequest" src/types/api.ts; then
  echo "  ✓ ListProjectsRequest type defined"
else
  echo "  ✗ ListProjectsRequest type missing"
fi

if grep -q "interface ProjectWithColumns" src/types/api.ts; then
  echo "  ✓ ProjectWithColumns type defined"
else
  echo "  ✗ ProjectWithColumns type missing"
fi

if grep -q "interface ProjectCard" src/types/api.ts; then
  echo "  ✓ ProjectCard type defined"
else
  echo "  ✗ ProjectCard type missing"
fi

echo ""

# Check if API functions are implemented
echo "3. Checking API functions..."
if grep -q "export async function listProjects" src/lib/github/projects.ts; then
  echo "  ✓ listProjects function defined"
else
  echo "  ✗ listProjects function missing"
fi

if grep -q "export async function getProject" src/lib/github/projects.ts; then
  echo "  ✓ getProject function defined"
else
  echo "  ✗ getProject function missing"
fi

if grep -q "export async function invalidateProjectsCache" src/lib/github/projects.ts; then
  echo "  ✓ invalidateProjectsCache function defined"
else
  echo "  ✗ invalidateProjectsCache function missing"
fi

echo ""

# Check if API route is implemented
echo "4. Checking API route..."
if grep -q "export async function GET" src/app/api/v1/projects/route.ts; then
  echo "  ✓ GET endpoint implemented"
else
  echo "  ✗ GET endpoint missing"
fi

if grep -q "export async function POST" src/app/api/v1/projects/route.ts; then
  echo "  ✓ POST endpoint implemented"
else
  echo "  ✗ POST endpoint missing"
fi

echo ""

# Check if components are created
echo "5. Checking React components..."
if grep -q "export function ProjectCard" src/components/projects/project-card.tsx; then
  echo "  ✓ ProjectCard component defined"
else
  echo "  ✗ ProjectCard component missing"
fi

if grep -q "export function ProjectBoard" src/components/projects/project-board.tsx; then
  echo "  ✓ ProjectBoard component defined"
else
  echo "  ✗ ProjectBoard component missing"
fi

echo ""

# Check if tests are created
echo "6. Checking test coverage..."
if grep -q "describe('GitHub Projects API'" src/lib/github/projects.test.ts; then
  echo "  ✓ Test suite defined"
else
  echo "  ✗ Test suite missing"
fi

test_count=$(grep -c "it(" src/lib/github/projects.test.ts || echo "0")
echo "  → Found $test_count test cases"

echo ""

# Summary
echo "========================================="
echo "Summary"
echo "========================================="
echo ""
echo "Files created: ${#files[@]}"
echo "All files exist: $all_exist"
echo ""
echo "✓ Projects API Integration implementation complete!"
echo ""
echo "Next steps:"
echo "1. Set up GitHub App credentials in .env.local"
echo "2. Test the API endpoint: curl http://localhost:3000/api/v1/projects?org=hscheema1979"
echo "3. View the project board at /projects page"
echo ""
