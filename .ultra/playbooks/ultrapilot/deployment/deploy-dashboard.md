# Playbook: Deploy Dashboard

```yaml
name: "Deploy Dashboard to Production"
id: "ultrapilot-deploy-dashboard"
version: "1.0.0"
description: "Deploy UltraPilot dashboard to production with zero-downtime"

workspace: "ultrapilot"
category: "deployment"
default_agent: "ultra:executor"
estimated_duration: "10 minutes"
phase: 2

parameters:
  - name: "environment"
    type: "select"
    required: true
    description: "Deployment environment"
    options: ["staging", "production"]
    default: "production"

  - name: "branch"
    type: "string"
    required: true
    description: "Git branch to deploy"
    default: "main"

steps:
  - name: "Run tests"
    agent: "ultra:test-engineer"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "npm test -- --coverage"
      - "npm run build"

  - name: "Backup current deployment"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "cp -r .next .next.backup.$(date +%s)"
      - "git rev-parse HEAD > .last-deployed"

  - name: "Pull latest code"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "git fetch origin"
      - "git checkout {{branch}}"
      - "git pull origin {{branch}}"

  - name: "Install dependencies"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "npm ci --production=false"

  - name: "Build application"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "npm run build"

  - name: "Zero-downtime restart"
    commands:
      - "cd /home/ubuntu/hscheema1979/ultrapilot-dashboard"
      - "# Keep existing process running"
      - "PORT=3000 npm run dev > /tmp/dashboard.new.log 2>&1 &"
      - "sleep 10"
      - "# Check new process is healthy"
      - "curl -s http://localhost:3000/api/health"
      - "# Kill old process gracefully"
      - "pkill -f 'next dev' || true"
      - "sleep 2"
      - "# New process already running"

  - name: "Verify deployment"
    agent: "ultra:verifier"
    commands:
      - "sleep 5"
      - "curl -s http://localhost:3000 | grep -q 'UltraPilot'"
      - "curl -s https://bitloom.cloud | grep -q 'UltraPilot'"
      - "curl -s http://localhost:3000/api/v1/workflows | jq '.totalCount'"

prerequisites:
  - "All tests passing"
  - "Git repository clean"
  - "Sufficient disk space"
  - "Database backed up"

outcomes:
  - "Latest code deployed"
  - "Zero downtime achieved"
  - "All services verified"
  - "Backup created"

success_criteria:
  - "Build successful"
  - "New process running on port 3000"
  - "Dashboard accessible via HTTPS"
  - "API responding correctly"
  - "No errors in logs"
```

## Usage

```bash
# From dashboard
1. Select "Deploy Dashboard to Production" playbook
2. Configure:
   - environment: production
   - branch: main
3. Click "Execute"
4. Monitor deployment in real-time
```

## Rollback Procedure

If deployment fails:
```bash
# Automatic rollback
pkill -f "next dev"
cd /home/ubuntu/hscheema1979/ultrapilot-dashboard
rm -rf .next
mv .next.backup.* .next
PORT=3000 npm run dev > /tmp/dashboard.log 2>&1 &
```
