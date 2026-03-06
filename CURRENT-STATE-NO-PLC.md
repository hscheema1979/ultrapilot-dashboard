# GitHub Mission Control Dashboard - Current State (No Manual Phase Control)

**Date:** 2026-03-06
**Decision:** Remove manual phase control - phases should be agent-driven

---

## What We Removed

### ❌ PLC Manager Page (`/plc`)
**Reason:** Phase control should be automatic, not manual

**What it had:**
- Manual phase advance buttons
- Manual review requests
- Manual pause/resume
- Manual agent spawning

**Why it's wrong:**
- ultra:architect should advance phases automatically when work is complete
- ultra:team-lead should handle transitions automatically
- Manual control defeats the purpose of AI agent orchestration
- Creates human bottleneck in agent-driven workflow

**What it should be instead:**
```typescript
// ultra:architect automatically manages phases
class UltraArchitect {
  async manageLifecycle() {
    for (const phase of phases) {
      await this.executePhase(phase)

      // Automatically advance when complete
      if (this.isPhaseComplete(phase)) {
        await this.advanceToNextPhase()
      }
    }
  }
}
```

---

## What We Keep (Working Now)

### ✅ Projects Page (`/projects`)
**Purpose:** Jira-style project management with multiple views

**Features:**
- Board View (Kanban columns)
- List View (Sortable/filterable table)
- Timeline View (Gantt chart - coming soon)
- Backlog View (Icebox)
- Search, filter, sort controls
- Stats bar (All, To Do, In Progress, Review, Done)

**Why it works:**
- Projects are created from Relay chat requests
- GitHub issues are the source of truth
- Shows work organized in a familiar way
- Doesn't interfere with agent automation

**How agents use it:**
- ultra:team-lead creates GitHub issues
- ultra:architect updates issue status via labels
- Dashboard reflects current state from GitHub
- No manual control needed - just visibility

### ✅ Agents Monitor Page (`/agents`)
**Purpose:** View active agent activity

**Features:**
- List of all active agents
- Agent status and workload
- Current projects and phases
- Performance metrics
- Quick actions (message, adjust)

**Why it works:**
- Purely observational - shows what agents are doing
- Doesn't control agents, just monitors
- Useful for seeing agent workload
- Helps identify bottlenecks

**How agents use it:**
- Agents report status via API
- Dashboard displays agent activity
- Users can see what's happening
- No direct control - just visibility

### ✅ GitHub Integration Page (`/github`)
**Purpose:** GitHub App connection status

**Features:**
- Connection status (repository, app, webhooks)
- Stats (issues, PRs)
- Project boards
- Recent activity
- Manual sync button

**Why it works:**
- Shows health of GitHub integration
- Displays real-time data from GitHub
- Useful for troubleshooting
- Manual sync when needed

**How agents use it:**
- GitHub is the backend/persistence layer
- Agents update GitHub issues/comments
- Dashboard shows GitHub state
- Bi-directional sync

---

## Current Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│           GitHub Mission Control Dashboard                   │
│              (Visibility + Organization)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │/projects │  │/agents   │  │/github   │                 │
│  │  Board   │  │ Monitor  │  │ Status   │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       └──────────────┴──────────────┘                      │
│                       │                                    │
│                       ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              GitHub App Backend                     │   │
│  │  (Issues = Projects, Comments = Activity)          │   │
│  └──────────────────────┬──────────────────────────────┘   │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Agent Layer (Background)   │
            ├──────────────────────────────┤
            │ ultra:team-lead               │
            │ ultra:architect               │
            │ ultra:executor                │
            │ ultra:verifier                │
            │ ultra:reviewer                │
            └──────────────────────────────┘
```

**Dashboard = Visibility layer**
- Shows what agents are doing
- Organizes projects from GitHub
- Monitors agent activity
- Displays GitHub status

**No manual control - agents drive everything**

---

## How Phases Will Work (When Implemented)

### Agent-Driven Phase Transitions

```typescript
// ultra:architect manages phases automatically
class UltraArchitect {
  async manageProject(issueId: number) {
    const phases = [
      'requirements', 'architecture', 'planning',
      'execution', 'verification', 'review', 'deployment'
    ]

    for (const phase of phases) {
      // Start phase
      await this.updateGitHubLabel(issueId, `phase:${phase}`)
      await this.createComment(issueId, `Starting ${phase} phase...`)

      // Execute phase work
      const result = await this.executePhase(phase, issueId)

      // Check if complete
      if (result.success) {
        await this.createComment(issueId, `✅ ${phase} phase complete`)

        // Automatically advance to next phase
        await this.advanceToNextPhase(issueId, phase)
      } else {
        // Handle failure
        await this.createComment(issueId, `❌ ${phase} phase failed: ${result.error}`)
        await this.updateGitHubLabel(issueId, `status:blocked`)

        // Stop - don't advance
        throw new Error(`Phase ${phase} failed`)
      }
    }

    await this.createComment(issueId, '🎉 All phases complete!')
    await this.closeIssue(issueId)
  }
}
```

### Dashboard Shows Phase Progress (Read-Only)

```typescript
// /projects page shows current phase
<ProjectCard>
  <PhaseIndicator currentPhase="architecture" />
  <ProgressBar progress={60} />
  <p>ultra:architect working on this phase</p>
</ProjectCard>

// No manual controls - just status
```

### Users Can Observe, Not Control

**What users CAN do:**
- View which phase a project is in
- See progress through phases
- Monitor agent activity
- Read phase completion comments
- View overall project status

**What users CANNOT do:**
- Manually advance phases
- Skip phases
- Pause phases
- Override agent decisions

**Why:** Agents are the experts. Let them manage the workflow.

---

## Future: When to Bring Back PLC Control

### Scenario 1: Agent Timeout (Emergency Override)
```typescript
// If agent is stuck for too long
if (phase.stuckFor > 4 hours) {
  // Show "Force Advance" button to user
  <Button variant="destructive">
    Force Phase Advance (Agent Unresponsive)
  </Button>
}
```

### Scenario 2: Human Approval Required
```typescript
// Certain phases require human approval
if (phase === 'deployment') {
  // Show "Approve Deployment" button
  <Button onClick={approveDeployment}>
    Approve Deployment
  </Button>

  // But agent still controls when to request approval
}
```

### Scenario 3: Manual Override (Rare)
```typescript
// User explicitly wants to bypass agent
if (userRequestsOverride) {
  <Button onClick={manualOverride}>
    Override Agent Decision
  </Button>

  // Logs the override for analysis
}
```

**But these are EXCEPTIONS, not the norm.**

---

## Current Working Dashboard

### Navigation
```
Management
├── Projects (Board, List, Timeline, Backlog)
├── Agents (Monitor active agents)
├── GitHub (Integration status)
└── Settings
```

### What Works Now
1. **Projects** - See all work from GitHub issues
2. **Agents** - Monitor agent activity (when agents are running)
3. **GitHub** - Check connection status

### What's Missing (Until Agent Implementation)
- Agent-driven phase transitions
- Automatic phase advancement
- Agent orchestration
- Time tracking

---

## Summary

**Removed:**
- ❌ PLC Manager page (manual phase control)
- ❌ Manual advance buttons
- ❌ Manual pause/resume
- ❌ Manual agent spawning

**Kept:**
- ✅ Projects page (visibility into work)
- ✅ Agents page (monitor agent activity)
- ✅ GitHub page (integration status)

**Principle:**
Dashboard = Visibility layer
Agents = Control layer

**Users observe, agents act.**

---

**This is the right approach - dashboard provides visibility, agents provide control!** 🎯
