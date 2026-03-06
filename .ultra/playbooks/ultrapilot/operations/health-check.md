# Playbook: System Health Check

```yaml
name: "System Health Check"
id: "ultrapilot-ops-health"
version: "1.0.0"
description: "Comprehensive system health check for UltraPilot dashboard"

workspace: "ultrapilot"
category: "operations"
default_agent: "ultra:autoloop-coordinator"
estimated_duration: "2 minutes"
phase: 0

parameters: []

steps:
  - name: "Check dashboard service"
    commands:
      - "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000"
      - "ps aux | grep 'next dev' | grep -v grep"

  - name: "Check OAuth2 proxy"
    commands:
      - "curl -s -o /dev/null -w '%{http_code}' http://localhost:4180"
      - "ps aux | grep oauth2-proxy | grep -v grep"

  - name: "Check nginx"
    commands:
      - "systemctl status nginx --no-pager"
      - "curl -s -o /dev/null -w '%{http_code}' https://bitloom.cloud"

  - name: "Check database"
    commands:
      - "ls -lh /home/ubuntu/hscheema1979/ultrapilot-dashboard/data/cache.db"
      - "sqlite3 /home/ubuntu/hscheema1979/ultrapilot-dashboard/data/cache.db 'PRAGMA integrity_check;'"

  - name: "Check disk space"
    commands:
      - "df -h /home/ubuntu/hscheema1979/"
      - "du -sh /home/ubuntu/hscheema1979/ultrapilot-dashboard/.next"

  - name: "Check memory"
    commands:
      - "free -h"
      - "ps aux --sort=-%mem | head -10"

  - name: "Generate health report"
    commands:
      - "cat > /tmp/health-report.txt << 'EOF'"
      - "UltraPilot Dashboard Health Report"
      - "Generated: $(date)"
      - ""
      - "Services Status:"
      - "- Dashboard: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000)"
      - "- OAuth2: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:4180)"
      - "- Nginx: $(systemctl is-active nginx)"
      - ""
      - "Resources:"
      - "- Disk: $(df -h /home/ubuntu/hscheema1979/ | tail -1 | awk '{print $5}') used"
      - "- Memory: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}') used"
      - "EOF"

prerequisites:
  - "Dashboard running"
  - "SSH access to server"

outcomes:
  - "Health report generated"
  - "All services checked"
  - "Resource status documented"

success_criteria:
  - "Dashboard returns HTTP 200"
  - "OAuth2 proxy returns HTTP 200 or 302"
  - "Nginx is active"
  - "Database integrity OK"
  - "Disk usage < 90%"
  - "Memory usage < 90%"
```

## Usage

```bash
# From dashboard
1. Select "System Health Check" playbook
2. Click "Execute" (no parameters needed)
3. View health report in comments
```

## Example Output

```
UltraPilot Dashboard Health Report
Generated: 2026-03-06 20:00:00

Services Status:
- Dashboard: 200 ✓
- OAuth2: 302 ✓
- Nginx: active ✓

Resources:
- Disk: 45% used ✓
- Memory: 62.3% used ✓

Overall Health: HEALTHY
```
