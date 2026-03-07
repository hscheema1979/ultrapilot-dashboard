# UltraPilot Skill Integration - Real Workflows

## 🎯 What You Actually Have

**NOT** playbook templates - but **actual UltraPilot skills** installed in your system!

### Installed Skills (from `~/.claude/skills/`)

1. **ultrapilot** - Strategic orchestration system
   - File: `~/.claude/skills/ultrapilot/SKILL.md`
   - Purpose: Requirements → Architecture → Planning → Execution
   - Trigger: `/ultrapilot <task>`

2. **ultra-lead** - Planning & execution orchestrator
   - File: `~/.claude/skills/ultra-lead/SKILL.md`
   - Purpose: Phase 0-1 planning, task decomposition
   - Trigger: Called by ultrapilot (or `/ultra-lead <task>`)

3. **ultra-autoloop** - Continuous execution daemon
   - File: `~/.claude/skills/ultra-autoloop/SKILL.md`
   - Purpose: 60s heartbeat, task queues, continuous execution
   - Trigger: `/ultra-autoloop` or persistent daemon

### Additional Available Skills

- **ultra-ralph** - Persistent execution loop
- **ultra-team** - Multi-agent coordination
- **ultra-planning** - Detailed implementation planning
- **ultra-review** - Multi-dimensional code review
- **ultra-verification** - Evidence-backed verification
- **ultra-tdd** - Test-driven development
- **ultra-brainstorm** - Creative brainstorming
- **ultra-domain-setup** - Domain initialization
- And 20+ more...

---

## 🎮 Dashboard Integration

### Playbooks Page: `/dashboard/playbooks`

The page now shows your **REAL** UltraPilot workflows:

```
┌─────────────────────────────────────────────┐
│ UltraPilot - Strategic Orchestration        │
│─────────────────────────────────────────────│
│ Strategic orchestration system: Requirements │
│ → Architecture → Planning with Multi-        │
│ Perspective Review, then hands off to       │
│ Ultra-Lead for operational execution        │
│                                             │
│ Category: Core Workflow                     │
│ Duration: Hours to days                     │
│                                             │
│ Parameters:                                 │
│ • task (required)                           │
│ • workspace (optional)                      │
│ • direct (optional)                         │
│                                             │
│ [Execute] [View on GitHub]                  │
└─────────────────────────────────────────────┘
```

---

## 🚀 Execution Flow

### When You Click "Execute" in Dashboard:

1. **API Call**: `POST /api/v1/playbooks/execute`
   ```json
   {
     "playbookId": "ultrapilot",
     "playbookName": "UltraPilot - Strategic Orchestration",
     "task": "Build me a REST API for task management",
     "workspace": "/home/ubuntu/hscheema1979/ultrapilot-dashboard"
   }
   ```

2. **GitHub Issue Created** (e.g., #71)
   - Title: "🤖 UltraPilot - Strategic Orchestration"
   - Labels: `workflow`, `skill`, `ultrapilot`, `playbook`
   - Body: Task description, configuration, execution instructions

3. **Initial Comment Posted**
   - Skill file path: `~/.claude/skills/ultrapilot/SKILL.md`
   - Manual execution instructions
   - Monitoring links

4. **Dashboard Updates**
   - Redirected to `/dashboard/workflows`
   - Shows new workflow issue
   - Status: "Pending manual execution"

5. **Manual Execution** (in your terminal)
   ```bash
   cd /home/ubuntu/hscheema1979/ultrapilot-dashboard
   /ultrapilot Build me a REST API for task management
   ```

6. **Progress Updates**
   - Agent posts comments to GitHub issue
   - Dashboard shows real-time updates
   - Phase transitions tracked

---

## 📊 What Each Workflow Does

### UltraPilot (Strategic Orchestrator)

**Purpose**: Complex development tasks requiring planning

**Phases**:
- Phase 0: Requirements + Architecture → `spec.md`
- Phase 1: Planning + Multi-Perspective Review → `plan-final.md`
- Phase 2-5: Hands off to Ultra-Lead for execution

**When to Use**:
- Complex features (5+ steps)
- Multi-file work
- Production code
- User says: "build me", "create", "implement"

**Output**: Validated plan ready for execution

---

### Ultra-Lead (Planning Orchestrator)

**Purpose**: Strategic planning with task decomposition

**Phases**:
- Phase 0: Requirements + Architecture → `spec.md`
- Phase 1: Planning + Review → `plan-final.md`
- Task Decomposition → DomainManager
- Sets routines for AutoloopDaemon

**When to Use**:
- Detailed implementation planning
- Task breakdown needed
- Multi-perspective validation
- Pre-execution preparation

**Output**: Decomposed tasks ready for AutoloopDaemon

---

### Ultra-Autoloop (Continuous Execution)

**Purpose**: Continuous heartbeat daemon

**Behavior**:
- 60-second heartbeat cycle
- Processes task queues
- Coordinates agents via WorkingManager
- Executes routine maintenance
- "The boulder never stops"

**When to Use**:
- Continuous monitoring
- Task queue processing
- Persistent execution
- Routine automation

**Output**: Continuous task execution

---

## 🔗 How Everything Connects

```
User clicks "Execute" in dashboard
         ↓
GitHub issue created (#71)
         ↓
Initial comment with execution instructions
         ↓
User executes skill in terminal:
  /ultrapilot <task>
         ↓
Skill runs autonomously:
  Phase 0: Requirements → Architecture
  Phase 1: Planning → Multi-Perspective Review
  Phase 2+: Hands off to Ultra-Lead
         ↓
Progress posted as GitHub comments
         ↓
Dashboard shows real-time updates
         ↓
Completion verified with evidence
```

---

## 📚 All Available UltraPilot Skills

### Core Workflows (Shown in Dashboard)
- ✅ ultrapilot - Strategic orchestration
- ✅ ultra-lead - Planning & execution
- ✅ ultra-autoloop - Continuous execution

### Additional Skills (Can Add to Dashboard)
- ultra-ralph - Persistent execution loop
- ultra-team - Multi-agent coordination
- ultra-planning - Detailed planning
- ultra-review - Code review
- ultra-verification - Verification
- ultra-tdd - Test-driven development
- ultra-brainstorm - Brainstorming
- ultra-domain-setup - Domain setup
- ultra-pipeline - Pipeline orchestration
- ultra-ccg - Tri-model orchestration
- ultra-ui-standardizer - UI standardization
- ultra-hud - HUD configuration
- ultra-cancel - Cancel active mode
- skill - Manage skills
- skill-creator - Create skills
- And 20+ more...

---

## 🎯 Key Insight

You're **NOT** using playbook templates - you're integrating with your **ACTUAL UltraPilot skills** that:

1. **Exist as Claude Code skills** in `~/.claude/skills/`
2. **Have real orchestration logic** (phases, agents, workflows)
3. **Execute autonomously** once invoked
4. **Track progress via GitHub issues**
5. **Monitor from dashboard**

**The dashboard is the UI layer on top of your existing UltraPilot skill system!**

---

## 🚀 Next Steps

1. **Browse Workflows**: Go to `/dashboard/playbooks`
2. **Select One**: Choose ultrapilot, ultra-lead, or ultra-autoloop
3. **Click Execute**: Creates GitHub issue with instructions
4. **Execute Manually**: Run the skill in your terminal
5. **Monitor Progress**: Watch updates in `/dashboard/workflows`

**Your real UltraPilot skills are now integrated with the dashboard!** 🎉
