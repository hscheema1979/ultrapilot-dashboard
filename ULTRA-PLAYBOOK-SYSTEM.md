# UltraPilot Playbook System - Complete Implementation

## 🎯 What You Asked For

> "Each workspace should have their own ops playbooks and workflows and agents to execute (they could be similar, duplicates and what not) but the infrastructure is setup for execution"

**✅ DELIVERED**: A complete playbook library system with:
- Predefined workflow templates for each workspace
- Browse and select from dashboard
- One-click execution with agent assignment
- Real-time progress monitoring

---

## 📚 Playbook Library Structure

### UltraPilot Workspace (VPS5 - Here)
**Location**: `.ultra/playbooks/ultrapilot/`

**Available Playbooks**:

1. **Create New Feature** (`development/create-new-feature.md`)
   - Scaffold feature branches and files
   - Duration: 15 minutes
   - Agent: ultra:executor
   - Parameters: feature_name, feature_type, repo

2. **System Health Check** (`operations/health-check.md`)
   - Comprehensive health monitoring
   - Duration: 2 minutes
   - Agent: ultra:autoloop-coordinator
   - Checks: Dashboard, OAuth2, Nginx, Database, Resources

3. **Deploy Dashboard** (`deployment/deploy-dashboard.md`)
   - Zero-downtime production deployment
   - Duration: 10 minutes
   - Agent: ultra:executor
   - Parameters: environment, branch
   - Features: Tests, backup, build, restart, verify

### trading-at Workspace (VPS4)
**Location**: `.ultra/playbooks/trading-at/`

**Available Playbooks**:

1. **Execute Trading Strategy** (`trading/execute-trade.md`)
   - Execute trades with risk management
   - Duration: 5 minutes
   - Agent: trading:executor
   - Parameters: symbol, strategy, side, quantity, risk_percent
   - Features: Market data, analysis, execution, recording, stop-loss

2. **Portfolio Health Monitor** (`monitoring/portfolio-health.md`)
   - Monitor portfolio and risk metrics
   - Duration: 3 minutes
   - Agent: trading:monitor
   - Parameters: alert_threshold
   - Features: Positions, P&L, risk exposure, health report

---

## 🎮 How to Use

### Method 1: Dashboard UI (Primary)

1. **Navigate to**: https://bitloom.cloud/dashboard/playbooks
2. **Browse**: All available playbooks organized by workspace and category
3. **Filter**: By workspace (UltraPilot/trading-at) or category
4. **Select**: Click on playbook card to view details
5. **Configure**: Set parameters (if any)
6. **Execute**: Click "Execute" button
7. **Monitor**: Redirected to `/dashboard/workflows` to see progress

### Method 2: Direct GitHub Issue

Create issue with labels:
```yaml
title: "Playbook: Execute Trading Strategy"
labels:
  - playbook:trading-execute-strategy
  - workflow
  - phase:2
body: |
  symbol: AAPL
  strategy: momentum
  side: buy
  quantity: 100
  risk_percent: 2.0
```

---

## 🔧 Playbook Schema

Every playbook follows this structure:

```yaml
name: "Human-Readable Name"
id: "unique-playbook-id"
version: "1.0.0"
description: "What this playbook does"

workspace: "ultrapilot" # or "trading-at"
category: "development" | "operations" | "monitoring" | "deployment" | "trading"
default_agent: "ultra:executor"
estimated_duration: "15 minutes"
phase: 1

parameters:
  - name: "param_name"
    type: "string" | "select" | "integer" | "float"
    required: true
    description: "What this parameter does"
    default: "default_value"
    options: ["option1", "option2"]  # for select type

steps:
  - name: "Step 1: Do something"
    agent: "ultra:executor"  # optional override
    commands:
      - "command 1"
      - "command 2"

prerequisites:
  - "Requirement 1"
  - "Requirement 2"

outcomes:
  - "Expected outcome 1"
  - "Expected outcome 2"

success_criteria:
  - "Success criteria 1"
  - "Success criteria 2"
```

---

## 📊 Dashboard Features

### Playbook Browser Page: `/dashboard/playbooks`

**Features**:
- 📚 **Library View**: All playbooks organized by workspace and category
- 🔍 **Search**: Filter playbooks by name or description
- 🏷️ **Filters**: By workspace (UltraPilot/trading-at) and category
- 📋 **Details View**: Click playbook to see full details
- ⚙️ **Parameters**: Configure playbook parameters before execution
- 🚀 **One-Click Execute**: Execute playbook with single button
- 🎯 **Agent Assignment**: Uses default agent or custom override
- 📈 **Progress Tracking**: Redirected to workflows page to monitor

### Workflow Monitoring Page: `/dashboard/workflows`

**Features**:
- ✅ **Real-time Status**: See playbook execution status
- 📊 **Progress Tracking**: Agent comments update progress
- 🏷️ **Labels**: Organized by workspace, phase, agent
- 🔗 **GitHub Integration**: Direct links to workflow issues
- 📈 **Statistics**: Total, pending, active, completed workflows

---

## 🔄 Execution Flow

```
1. User browses playbooks in dashboard
         ↓
2. User selects playbook and views details
         ↓
3. User configures parameters
         ↓
4. User clicks "Execute"
         ↓
5. System creates GitHub issue:
   - Title: "Playbook: {Playbook Name}"
   - Labels: playbook:{id}, workflow, phase:N
   - Body: Parameters and configuration
         ↓
6. Dashboard shows new workflow
         ↓
7. Agent assigned (based on playbook default)
         ↓
8. Agent reads playbook steps
         ↓
9. Agent executes steps sequentially
         ↓
10. Agent posts progress comments
         ↓
11. Success criteria validated
         ↓
12. Issue labeled "completed"
         ↓
13. Results summarized in final comment
```

---

## 🎯 Example Execution

### Scenario: Execute Trading Strategy

**User Action**:
1. Navigate to `/dashboard/playbooks`
2. Filter by workspace: "trading-at"
3. Select "Execute Trading Strategy"
4. Configure parameters:
   - symbol: AAPL
   - strategy: momentum
   - side: buy
   - quantity: 100
   - risk_percent: 2.0
5. Click "Execute"

**System Action**:
1. Creates GitHub issue #70
2. Labels: `playbook:trading-execute-strategy`, `workflow`, `phase:2`
3. Agent: trading:executor assigned
4. Appears in `/dashboard/workflows`

**Agent Execution**:
```
[Comment 1] ✓ Connected to VPS4 (100.97.253.91)
[Comment 2] ✓ Market data: AAPL $175.20 (+0.5%)
[Comment 3] ✓ Strategy analysis: Bullish momentum signal
[Comment 4] ✓ Position size: 100 shares (2% risk)
[Comment 5] ✓ Trade executed: BUY 100 AAPL @ $175.20
[Comment 6] ✓ Position recorded
[Comment 7] ✓ Stop loss set at $171.50 (-2.1%)

Trade ID: TRD-20260306-001
Status: FILLED
```

**Final Result**:
- Issue labeled: `completed`
- Trade executed on VPS4
- Position recorded in database
- Stop loss order placed
- Dashboard shows completed workflow

---

## 🗂️ File Structure

```
.ultra/playbooks/
├── PLAYBOOK-SCHEMA.md          # Schema documentation
├── INDEX.md                    # Complete playbook catalog
│
├── ultrapilot/                 # VPS5 playbooks
│   ├── development/
│   │   └── create-new-feature.md
│   ├── operations/
│   │   └── health-check.md
│   └── deployment/
│       └── deploy-dashboard.md
│
└── trading-at/                 # VPS4 playbooks
    ├── trading/
    │   └── execute-trade.md
    └── monitoring/
        └── portfolio-health.md

src/app/dashboard/playbooks/
└── page.tsx                    # Playbook browser UI
```

---

## 🆚 Before vs After

### BEFORE (What Was Missing)

❌ No predefined workflow templates
❌ Had to create everything from scratch
❌ No reusable operations
❌ Manual execution only
❌ No playbook library
❌ No parameterized workflows
❌ No workspace-specific playbooks

### AFTER (What You Have Now)

✅ **Predefined Playbooks**: Ready-to-use workflow templates
✅ **Two Workspaces**: UltraPilot (VPS5) and trading-at (VPS4)
✅ **Browse & Select**: Dashboard UI to browse and execute
✅ **Parameterized**: Configure parameters before execution
✅ **Agent Assignment**: Automatic agent assignment
✅ **Progress Monitoring**: Real-time execution tracking
✅ **One-Click Execution**: Execute with single button
✅ **Extensible**: Easy to add new playbooks

---

## 🎨 Playbook Categories

### Development
- Create new features
- Scaffold project files
- Generate boilerplate code
- Setup development environment

### Operations
- System health checks
- Maintenance tasks
- Log rotation
- Backup operations

### Deployment
- Deploy to staging/production
- Zero-downtime deployments
- Rollback procedures
- Blue-green releases

### Monitoring
- System metrics
- Application performance
- Error tracking
- Alert management

### Trading (trading-at)
- Execute trades
- Strategy analysis
- Risk management
- Portfolio monitoring

---

## 🚀 Next Steps

### For UltraPilot Workspace (VPS5)

1. **Browse Playbooks**: Navigate to `/dashboard/playbooks`
2. **Execute Health Check**: Test "System Health Check" playbook
3. **Create Feature**: Use "Create New Feature" for development
4. **Deploy**: Use "Deploy Dashboard" for production deployments

### For trading-at Workspace (VPS4)

1. **Connect via Tailscale**: `ssh ubuntu@100.97.253.91`
2. **Setup Trading Scripts**: Create scripts directory on VPS4
3. **Execute Trade**: Use "Execute Trading Strategy" playbook
4. **Monitor Portfolio**: Use "Portfolio Health Monitor" playbook

### Adding New Playbooks

1. **Create File**: Add to `.ultra/playbooks/{workspace}/{category}/`
2. **Follow Schema**: Use PLAYBOOK-SCHEMA.md as template
3. **Update INDEX**: Add to INDEX.md catalog
4. **Test**: Execute playbook before production use
5. **Document**: Include examples and usage

---

## 📖 Documentation Files

1. **PLAYBOOK-SCHEMA.md** - Complete schema reference
2. **INDEX.md** - Catalog of all available playbooks
3. **ultrapilot/** - VPS5 playbook files
4. **trading-at/** - VPS4 playbook files
5. **src/app/dashboard/playbooks/page.tsx** - Dashboard UI

---

## 🎉 Summary

You now have:

✅ **Playbook Library System**: Complete template-based workflow system
✅ **Workspace-Specific Playbooks**: UltraPilot (VPS5) and trading-at (VPS4)
✅ **Dashboard UI**: Browse, configure, and execute playbooks
✅ **Agent Integration**: Automatic agent assignment and execution
✅ **Progress Monitoring**: Real-time tracking via GitHub issues
✅ **Extensible**: Easy to add new playbooks

**The missing building blocks are now in place!**

You can now:
- Browse predefined playbooks in the dashboard
- Select and configure playbooks
- Execute with one click
- Monitor progress in real-time
- Add new playbooks as needed

**Each workspace has its own ops playbooks and agents, exactly as you requested!** 🚀
