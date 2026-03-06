# Playbook: Portfolio Health Monitor

```yaml
name: "Portfolio Health Monitor"
id: "trading-portfolio-health"
version: "1.0.0"
description: "Monitor portfolio health and risk metrics"

workspace: "trading-at"
category: "monitoring"
default_agent: "trading:monitor"
estimated_duration: "3 minutes"
phase: 0

parameters:
  - name: "alert_threshold"
    type: "float"
    required: false
    description: "Loss percentage for alerts"
    default: 5.0

steps:
  - name: "Connect to VPS4"
    commands:
      - "ssh ubuntu@100.97.253.91 'echo Connected to trading-at'"

  - name: "Get portfolio positions"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/get_positions.py'"

  - name: "Calculate portfolio metrics"
    agent: "trading:analyzer"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/portfolio_metrics.py'"

  - name: "Check open P&L"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/open_pnl.py'"

  - name: "Assess risk exposure"
    agent: "trading:risk-manager"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/risk_exposure.py'"

  - name: "Generate health report"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/health_report.py --threshold={{alert_threshold}}' > /tmp/portfolio-health.txt"
      - "scp ubuntu@100.97.253.91:/tmp/portfolio-health.txt /tmp/"

  - name: "Alert if needed"
    commands:
      - "if grep -q 'ALERT' /tmp/portfolio-health.txt; then"
      - "  echo 'Portfolio health alert triggered'"
      - "fi"

prerequisites:
  - "VPS4 accessible via Tailscale"
  - "Portfolio database accessible"
  - "Brokerage API connected"

outcomes:
  - "Portfolio metrics calculated"
  - "Risk exposure assessed"
  - "Health report generated"
  - "Alerts triggered if needed"

success_criteria:
  - "All positions retrieved"
  - "Metrics calculated successfully"
  - "Health report generated"
  - "No critical alerts"
```

## Usage

```bash
# From dashboard
1. Select "Portfolio Health Monitor" playbook
2. Configure alert threshold (default 5%)
3. Click "Execute"
4. View health report in comments
```

## Example Output

```
Portfolio Health Report
Generated: 2026-03-06 14:30:00

=== Positions ===
AAPL: 100 shares @ $175.20 (P&L: +$120, +0.69%)
TSLA: 50 shares @ $220.50 (P&L: -$75, -0.68%)
MSFT: 75 shares @ $380.10 (P&L: +$225, +0.79%)

=== Portfolio Metrics ===
Total Value: $37,595.00
Open P&L: +$270.00 (+0.72%)
Daily Change: +$1,230.00 (+3.4%)

=== Risk Assessment ===
Portfolio Beta: 1.05
Max Drawdown: -2.3%
Risk Exposure: $12,450 (33% of capital)

=== Alerts ===
✓ No alerts triggered
✓ Portfolio within normal parameters
```
