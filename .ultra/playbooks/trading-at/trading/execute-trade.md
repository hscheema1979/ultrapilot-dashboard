# Playbook: Execute Trading Strategy

```yaml
name: "Execute Trading Strategy"
id: "trading-execute-strategy"
version: "1.0.0"
description: "Execute a trading strategy with risk management"

workspace: "trading-at"
category: "trading"
default_agent: "trading:executor"
estimated_duration: "5 minutes"
phase: 2

parameters:
  - name: "symbol"
    type: "string"
    required: true
    description: "Trading symbol (e.g., AAPL)"
    default: ""

  - name: "strategy"
    type: "select"
    required: true
    description: "Trading strategy"
    options: ["momentum", "mean-reversion", "breakout", "scalping"]
    default: "momentum"

  - name: "side"
    type: "select"
    required: true
    description: "Trade direction"
    options: ["buy", "sell"]
    default: "buy"

  - name: "quantity"
    type: "integer"
    required: true
    description: "Number of shares/contracts"
    default: 100

  - name: "order_type"
    type: "select"
    required: false
    description: "Order type"
    options: ["market", "limit", "stop"]
    default: "market"

  - name: "risk_percent"
    type: "float"
    required: false
    description: "Risk percentage per trade"
    default: 2.0

steps:
  - name: "Connect to VPS4"
    commands:
      - "ssh ubuntu@100.97.253.91 'echo Connected to trading-at'"

  - name: "Check market data"
    agent: "trading:analyzer"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/market_data.py --symbol {{symbol}}'"

  - name: "Run strategy analysis"
    agent: "trading:analyzer"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/analyze_strategy.py --symbol {{symbol}} --strategy {{strategy}}'"

  - name: "Calculate position size"
    agent: "trading:risk-manager"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/calculate_position.py --capital=100000 --risk={{risk_percent}}'"

  - name: "Execute trade"
    agent: "trading:executor"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/execute_trade.py --symbol {{symbol}} --side {{side}} --quantity {{quantity}} --type {{order_type}}'"

  - name: "Record trade"
    agent: "trading:recorder"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/record_trade.py --symbol {{symbol}} --strategy {{strategy}}'"

  - name: "Set stop loss"
    agent: "trading:risk-manager"
    commands:
      - "ssh ubuntu@100.97.253.91 'cd ~/trading-at && python scripts/set_stop_loss.py --symbol {{symbol}} --risk={{risk_percent}}'"

prerequisites:
  - "VPS4 accessible via Tailscale"
  - "Trading API credentials configured"
  - "Market data connection active"
  - "Sufficient account balance"

outcomes:
  - "Trade executed"
  - "Position recorded"
  - "Stop loss set"
  - "Risk managed"

success_criteria:
  - "Order confirmation received"
  - "Position appears in portfolio"
  - "Stop loss order placed"
  - "Trade logged in database"
```

## Usage

```bash
# From dashboard
1. Select "Execute Trading Strategy" playbook
2. Configure:
   - symbol: AAPL
   - strategy: momentum
   - side: buy
   - quantity: 100
   - risk_percent: 2.0
3. Click "Execute"
4. Monitor execution on VPS4
```

## Example Execution

```
✓ Connected to VPS4 (100.97.253.91)
✓ Market data: AAPL $175.20 (+0.5%)
✓ Strategy analysis: Bullish momentum signal
✓ Position size: 100 shares (2% risk)
✓ Trade executed: BUY 100 AAPL @ $175.20
✓ Position recorded
✓ Stop loss set at $171.50 (-2.1%)

Trade ID: TRD-20260306-001
Status: FILLED
```
