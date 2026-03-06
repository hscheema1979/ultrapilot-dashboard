# UltraPilot Playbook Schema

## What is a Playbook?

A **playbook** is a reusable, predefined workflow template that can be:
- Browsed and selected from the dashboard
- Configured with parameters
- Assigned to specific agents
- Executed with one click
- Monitored through the workflow system

## Playbook Structure

```yaml
name: "Human-Readable Name"
id: "unique-playbook-id"
version: "1.0.0"
description: "What this playbook does"

workspace: "ultrapilot" # or "trading-at"
category: "development" | "operations" | "monitoring" | "deployment"

# Default agent assignment (can be overridden)
default_agent: "ultra:executor"

# Estimated duration
estimated_duration: "30 minutes"

# Phase this playbook operates in
phase: 1 # 0-6

# Parameters that can be configured
parameters:
  - name: "repo_url"
    type: "string"
    required: true
    description: "GitHub repository URL"
    default: ""

  - name: "branch"
    type: "string"
    required: false
    description: "Git branch to work on"
    default: "main"

# Steps the agent will execute
steps:
  - name: "Step 1: Do something"
    agent: "ultra:executor" # optional override
    commands:
      - "echo 'Executing step 1'"
      - "git clone {{repo_url}}"

  - name: "Step 2: Verify"
    agent: "ultra:verifier"
    commands:
      - "ls -la"

# Prerequisites that must be met
prerequisites:
  - "Git installed"
  - "SSH access configured"
  - "Write permissions"

# Expected outcomes
outcomes:
  - "Repository cloned"
  - "Dependencies installed"
  - "Tests passing"

# Success criteria
success_criteria:
  - "All steps completed without errors"
  - "Expected files created"
  - "Tests passing"
```

## Playbook Categories

### Development Playbooks
- Create new feature
- Run tests
- Code review
- Deploy to staging

### Operations Playbooks
- System health check
- Log rotation
- Backup database
- Clear cache

### Monitoring Playbooks
- Check service status
- Monitor metrics
- Alert on thresholds
- Generate reports

### Deployment Playbooks
- Deploy to production
- Rollback deployment
- Blue-green deploy
- Canary release

## Playbook Execution Flow

```
1. User browses playbook library
2. User selects playbook
3. User configures parameters
4. User assigns agents (or use defaults)
5. User clicks "Execute"
6. System creates GitHub issue with workflow labels
7. Dashboard shows new workflow
8. Agent executes playbook steps
9. Progress updated in real-time
10. Completion confirmed with success criteria
```

## Playbook Storage

Playbooks are stored in:
```
.ultra/playbooks/
├── ultrapilot/
│   ├── development/
│   ├── operations/
│   ├── monitoring/
│   └── deployment/
└── trading-at/
    ├── trading/
    ├── analysis/
    ├── monitoring/
    └── risk-management/
```

## Playbook Metadata

Each playbook has:
- `name`: Human-readable name
- `id`: Unique identifier
- `version`: Semver version
- `description`: What it does
- `workspace`: Which workspace it belongs to
- `category`: Type of playbook
- `parameters`: Configurable inputs
- `steps`: Execution steps
- `prerequisites`: Required conditions
- `outcomes`: Expected results
- `success_criteria`: How to verify success

## Playbook Execution

When a playbook is executed:

1. **Create Workflow Issue**
   - GitHub issue created with playbook metadata
   - Labeled: `workflow`, `playbook:playbook-id`, `phase:N`
   - Agent assigned based on playbook defaults

2. **Dashboard Display**
   - Appears in /dashboard/workflows
   - Shows playbook name, parameters, progress
   - Real-time updates via GitHub comments

3. **Agent Execution**
   - Agent reads playbook steps
   - Executes each step sequentially
   - Posts progress comments
   - Handles errors and retries

4. **Completion**
   - Success criteria validated
   - Issue labeled "completed"
   - Results summarized in final comment
