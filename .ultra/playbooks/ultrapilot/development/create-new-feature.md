# Playbook: Create New Feature

```yaml
name: "Create New Feature"
id: "ultrapilot-dev-feature"
version: "1.0.0"
description: "Create a new feature branch and scaffold feature files"

workspace: "ultrapilot"
category: "development"
default_agent: "ultra:executor"
estimated_duration: "15 minutes"
phase: 1

parameters:
  - name: "feature_name"
    type: "string"
    required: true
    description: "Name of the feature (e.g., 'user-authentication')"
    default: ""

  - name: "feature_type"
    type: "select"
    required: true
    description: "Type of feature"
    options: ["frontend", "backend", "full-stack", "infrastructure"]
    default: "full-stack"

  - name: "repo"
    type: "string"
    required: true
    description: "Repository name"
    default: "ultrapilot-dashboard"

  - name: "base_branch"
    type: "string"
    required: false
    description: "Base branch to create from"
    default: "main"

steps:
  - name: "Create feature branch"
    commands:
      - "cd /home/ubuntu/hscheema1979/{{repo}}"
      - "git fetch origin"
      - "git checkout {{base_branch}}"
      - "git pull origin {{base_branch}}"
      - "git checkout -b feature/{{feature_name}}"

  - name: "Scaffold feature files"
    commands:
      - "cd /home/ubuntu/hscheema1979/{{repo}}"
      - "mkdir -p src/features/{{feature_name}}"
      - "touch src/features/{{feature_name}}/index.ts"
      - "touch src/features/{{feature_name}}/{{feature_name}}.test.ts"

  - name: "Create feature documentation"
    commands:
      - "cd /home/ubuntu/hscheema1979/{{repo}}"
      - "cat > src/features/{{feature_name}}/README.md << 'EOF'"
      - "# {{feature_name}}"
      - ""
      - "## Overview"
      - "Feature description here"
      - ""
      - "## Implementation"
      - "- [ ] Step 1"
      - "- [ ] Step 2"
      - ""
      - "## Testing"
      - "- [ ] Unit tests"
      - "- [ ] Integration tests"
      - "EOF"

prerequisites:
  - "Git installed and configured"
  - "Repository cloned locally"
  - "Write permissions"

outcomes:
  - "Feature branch created"
  - "Feature files scaffolded"
  - "Documentation initialized"
  - "Ready for development"

success_criteria:
  - "Branch exists: feature/{{feature_name}}"
  - "Files created in src/features/{{feature_name}}/"
  - "README.md exists"
  - "Git status shows new files"
```

## Usage

```bash
# From dashboard
1. Select "Create New Feature" playbook
2. Configure parameters:
   - feature_name: "user-dashboard"
   - feature_type: "frontend"
   - repo: "ultrapilot-dashboard"
   - base_branch: "main"
3. Click "Execute"
4. Watch progress in dashboard
```

## Example Execution

```
✓ Created branch: feature/user-dashboard
✓ Created files: src/features/user-dashboard/
✓ Initialized documentation
✓ Ready for development
```
