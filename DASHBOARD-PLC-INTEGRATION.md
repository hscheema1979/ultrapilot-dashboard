# GitHub Mission Control Dashboard - PLC Management System

**What it is:** Management interface for ultra:architect + ultra:team-lead to execute Product Lifecycle with GitHub App backend

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   GitHub Mission Control Dashboard             │
│                  (Management & Control Interface)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐            │
│  │ Relay Chat  │  │   Projects  │  │ PLC Manager  │            │
│  │ Interface   │  │   Board     │  │   (NEW)      │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘            │
│         │                │                 │                     │
│         └────────────────┼─────────────────┘                     │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              GitHub App Integration Layer                   │ │
│  │  (Issues = Tasks, Project Board = Kanban, PRs = Results)   │ │
│  └──────────────────────────┬──────────────────────────────────┘ │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   Agent Orchestration Layer   │
              ├───────────────────────────────┤
              │                               │
              │  ultra:team-lead (Manager)    │
              │  ultra:architect (Technical)  │
              │  ultra:planner (Planning)     │
              │  ultra:executor (Execution)   │
              │  ultra:verifier (QA)          │
              │  ultra:reviewer (Review)      │
              │                               │
              └───────────────────────────────┘
```

---

## Dashboard = Management Interface

### What the Dashboard Does

**1. Pipeline Management (PLC Manager)** NEW
```
┌────────────────────────────────────────┐
│     Product Lifecycle Controller       │
├────────────────────────────────────────┤
│                                        │
│  Phase Controls:                       │
│  ┌──────────────────────────────────┐ │
│  │ [→ Requirements]  [→ Architecture]│ │
│  │ [→ Planning]       [→ Execution]  │ │
│  │ [→ Verification]   [→ Review]     │ │
│  │ [→ Approval]       [→ Deployment] │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Active Agents:                        │
│  • ultra:team-lead (Managing)          │
│  • ultra:architect (Leading)           │
│  • ultra:executor-1 (Task #123)        │
│  • ultra:executor-2 (Task #124)        │
│                                        │
│  Quick Actions:                        │
│  [Spawn Agent] [Advance Phase] [Pause] │
│                                        │
└────────────────────────────────────────┘
```

**2. Projects Board (Enhanced)**
```
┌────────────────────────────────────────┐
│         Projects Pipeline              │
├────────────────────────────────────────┤
│                                        │
│  To Do (3)  │  In Progress (2)  │ Done │
│  ───────────────────────────────────── │
│  [FR] API   │ [BUG] Login      │      │
│  [FR] Auth  │ [FR] Dashboard   │      │
│  [REV] DB   │                 │      │
└────────────────────────────────────────┘
```

**3. Agent Monitor (NEW)**
```
┌────────────────────────────────────────┐
│         Active Agents                  │
├────────────────────────────────────────┤
│                                        │
│  ultra:team-lead                        │
│  Status: Orchestrating                 │
│  Active: Project #123 (REST API)       │
│  Since: 2h ago                         │
│  ─────────────────────────────────     │
│                                        │
│  ultra:architect                       │
│  Status: Architecture Phase            │
│  Active: Project #123 (REST API)       │
│  Progress: 60%                         │
│  ─────────────────────────────────     │
│                                        │
│  ultra:executor-1                      │
│  Status: Executing Task #456           │
│  Active: Building /api/tasks           │
│  Progress: 80%                         │
└────────────────────────────────────────┘
```

**4. GitHub Integration Panel**
```
┌────────────────────────────────────────┐
│      GitHub App Status                 │
├────────────────────────────────────────┤
│                                        │
│  Connected: hscheema1979/ultrapilot    │
│  Issues: 12 open, 45 closed            │
│  PRs: 3 open, 28 merged                │
│  Project Board: Active                 │
│  Webhooks: Connected ✓                 │
└────────────────────────────────────────┘
```

---

## How Agents Work WITH Dashboard

### ultra:team-lead Role

**Reports TO Dashboard:**
```typescript
// ultra:team-lead skill
class UltraTeamLead {
  async orchestrateProject(projectId: string) {
    // 1. Create GitHub issue
    const issue = await this.createGitHubIssue(projectId)

    // 2. Update Dashboard state
    await this.updateDashboard({
      action: 'project_created',
      projectId,
      issueId: issue.number,
      status: 'to-do',
      agent: 'ultra:team-lead'
    })

    // 3. Assign ultra:architect
    await this.assignAgent({
      agent: 'ultra:architect',
      projectId,
      role: 'technical-lead'
    })

    // 4. Monitor progress
    await this.monitorAndReport(projectId)
  }

  async updateDashboard(state: any) {
    // POST to dashboard API
    await fetch('/api/dashboard/update', {
      method: 'POST',
      body: JSON.stringify(state)
    })
  }
}
```

**Dashboard Shows:**
- Project card appears in "To Do" column
- Agent status in "Active Agents" panel
- Phase indicator in PLC Manager

### ultra:architect Role

**Executes AND Reports:**
```typescript
// ultra:architect skill
class UltraArchitect {
  async manageLifecycle(projectId: string) {
    const phases = [
      'requirements', 'architecture', 'planning',
      'execution', 'verification', 'review', 'deployment'
    ]

    for (const phase of phases) {
      // 1. Update Dashboard phase
      await this.reportPhase(projectId, phase, 'start')

      // 2. Execute phase
      const result = await this.executePhase(phase, projectId)

      // 3. Update Dashboard with progress
      await this.reportProgress(projectId, {
        phase,
        progress: result.progress,
        status: result.status
      })

      // 4. Get approval if needed
      if (result.needsApproval) {
        const approved = await this.requestApproval(projectId, phase)
        if (!approved) {
          await this.handleRejection(projectId, phase)
          continue
        }
      }

      // 5. Mark phase complete
      await this.reportPhase(projectId, phase, 'complete')
    }
  }

  async reportPhase(projectId: string, phase: string, status: string) {
    // Update GitHub issue label
    await this.updateGitHubLabel(projectId, `phase:${phase}`)

    // Update Dashboard
    await fetch('/api/dashboard/phase-update', {
      method: 'POST',
      body: JSON.stringify({ projectId, phase, status })
    })
  }
}
```

**Dashboard Shows:**
- Phase progress bar advances
- Current phase highlighted in PLC Manager
- Ultra:architect activity in Agent Monitor

---

## Dashboard Pages

### 1. Main Dashboard (/)

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  GitHub Mission Control Dashboard                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  [Top Nav: Dashboard | Projects | Agents | PLC | Settings]│
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Overview (3 tabs: Active, Completed, All Projects)  │ │
│  │                                                       │ │
│  │  Metrics: 3 Active | 12 Completed | 98% Success Rate  │ │
│  │                                                       │ │
│  │  Projects Pipeline (Kanban from GitHub Project Board)│ │
│  │  ┌──────────┬──────────────┬──────────┐            │ │
│  │  │ To Do (3)│ In Progress  │ Done     │            │ │
│  │  │          │ (2)          │ (45)     │            │ │
│  │  ├──────────┼──────────────┼──────────┤            │ │
│  │  │[FR] API  │[BUG] Login   │          │            │ │
│  │  │[FR] Auth │[FR] Dash     │          │            │ │
│  │  │[REV] DB  │              │          │            │ │
│  │  └──────────┴──────────────┴──────────┘            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Active Agents Panel                                 │ │
│  │  • ultra:team-lead - Orchestrating 3 projects        │ │
│  │  • ultra:architect - Architecture phase (API)        │ │
│  │  • ultra:executor-1 - Building /api/tasks (80%)      │ │
│  │  • ultra:verifier - Running tests (47 passing)       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Quick Actions                                      │ │
│  │  [New Project] [Spawn Agent] [View GitHub]          │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 2. PLC Manager Page (/plc) - NEW

**Purpose:** Control and monitor product lifecycle phases

```
┌────────────────────────────────────────────────────────────┐
│  Product Lifecycle Controller                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Select Project: [REST API v]                              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Phase Pipeline Visualization                        │ │
│  │                                                       │ │
│  │  [Requirements] → [Architecture] → [Planning]        │ │
│  │       ✓             ⚡ In Progress    ○              │ │
│  │                                                       │ │
│  │  [Execution] → [Verification] → [Review]             │ │
│  │      ○              ○               ○                │ │
│  │                                                       │ │
│  │  [Approval] → [Deployment] → [Monitoring]            │ │
│  │      ○              ○               ○                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Current Phase: Architecture                         │ │
│  │  ├─ Agent: ultra:architect                           │ │
│  │  ├─ Started: 2h ago                                  │ │
│  │  ├─ Progress: 60%                                    │ │
│  │  ├─ Tasks: 4/7 complete                              │ │
│  │  └─ ETA: 45min                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Phase Controls                                      │ │
│  │  [Advance to Next] [Request Review] [Pause Project] │ │
│  │  [Spawn Additional Agent] [View Details]            │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Activity Log (from GitHub comments)                │ │
│  │  • ultra:architect: Started architecture phase       │ │
│  │  • ultra:architect: Designed API endpoints           │ │
│  │  • ultra:architect: Created database schema          │ │
│  │  • ultra:architect: Documented interfaces           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 3. Agents Monitor Page (/agents) - NEW

**Purpose:** View and control active agents

```
┌────────────────────────────────────────────────────────────┐
│  Agents Monitor                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Active Agents (4)                                         │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ultra:team-lead                                     │ │
│  │  Status: <span class="text-green-500">● Active</span>│ │
│  │  Role: Project Management                            │ │
│  │  Active Projects: 3                                  │ │
│  │  └─ REST API (orchestrating)                         │ │
│  │  └─ Login Bug (orchestrating)                        │ │
│  │  └─ Auth System (orchestrating)                      │ │
│  │  Since: 4h ago                                       │ │
│  │  Actions: [Message] [Reassign] [Pause]               │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ultra:architect                                     │ │
│  │  Status: <span class="text-green-500">● Active</span>│ │
│  │  Role: Technical Lead                                │ │
│  │  Active Project: REST API                            │ │
│  │  Current Phase: Architecture                         │ │
│  │  Progress: 60%                                       │ │
│  │  Since: 2h ago                                       │ │
│  │  Actions: [Message] [View Work] [Advance Phase]      │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  ultra:executor-1                                    │ │
│  │  Status: <span class="text-green-500">● Active</span>│ │
│  │  Role: Execution                                     │ │
│  │  Task: Build /api/tasks endpoint                    │ │
│  │  Project: REST API                                   │ │
│  │  Progress: 80%                                       │ │
│  │  ETA: 10min                                          │ │
│  │  Actions: [Message] [View Code] [Assist]             │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

### 4. GitHub Integration Page (/github) - NEW

**Purpose:** GitHub App connection status and controls

```
┌────────────────────────────────────────────────────────────┐
│  GitHub Integration                                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Connection Status                                   │ │
│  │  Repository: hscheema1979/ultrapilot-dashboard       │ │
│  │  App: UltraPilot Bot (#3009773)                     │ │
│  │  Installation: ✓ Active                              │ │
│  │  Webhooks: ✓ Connected (3 events)                   │ │
│  │  Last Sync: 2min ago                                 │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Project Boards                                       │ │
│  │  • Main Projects (active) - 12 issues                │ │
│  │  • Bug Backlog (active) - 5 issues                   │ │
│  │  • Completed (archived) - 47 issues                  │ │
│  │  Actions: [Create Board] [Sync Now]                  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Recent Activity                                     │ │
│  │  • Issue #234 opened: "Fix login bug"                │ │
│  │  • PR #156 merged: "Add OAuth support"               │ │
│  │  • ultra:architect commented on #123                │ │
│  │  Actions: [View on GitHub] [Refresh]                 │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## GitHub App as Backend

### Data Model

**Issues = Projects:**
```markdown
# Issue #123 - FR: REST API for Tasks

**Labels:**
- lifecycle (marks as managed project)
- phase:execution (current phase)
- agent:ultra-architect (lead agent)
- project:ubuntu (relay project)
- type:feature-request
- priority:high
- status:on-track

**Project Board:** Main Projects → Column: In Progress
```

**Comments = Activity Log:**
```markdown
### ultra:team-lead - 2h ago
**Created project**
Assigned ultra:architect as technical lead
Moving to requirements phase

### ultra:architect - 1h 50min ago
**Phase: Requirements - STARTED**
Gathering requirements from user...

### ultra:architect - 1h 30min ago
**Phase: Requirements - COMPLETE**
Requirements documented in spec.md
User approved
Moving to architecture phase

### ultra:architect - 1h ago
**Phase: Architecture - STARTED**
Designing system architecture...
```

**Project Board = Kanban:**
```
Main Projects Board:
├─ To Do (3 issues)
├─ In Progress (2 issues)
├─ Review (1 issue)
└─ Done (47 issues)
```

---

## API Endpoints

### Dashboard APIs

```typescript
// Project Management
GET  /api/projects                    // Get all projects
POST /api/projects                    // Create new project
GET  /api/projects/:id                // Get project details
PUT  /api/projects/:id                // Update project
DELETE /api/projects/:id              // Delete project

// PLC Management
GET  /api/plc/phases                  // Get all phases
GET  /api/plc/:projectId/phases       // Get project phases
PUT  /api/plc/:projectId/advance      // Advance to next phase
POST /api/plc/:projectId/approve      // Approve current phase

// Agent Management
GET  /api/agents                      // Get all agents
GET  /api/agents/active               // Get active agents
POST /api/agents/spawn                // Spawn new agent
PUT  /api/agents/:id/reassign         // Reassign agent
DELETE /api/agents/:id                // Stop agent

// GitHub Integration
GET  /api/github/status               // Get GitHub status
GET  /api/github/issues               // Sync issues
POST /api/github/sync                 // Manual sync
GET  /api/github/boards               // Get project boards
```

### Agent → Dashboard APIs

```typescript
// Agents call these to update dashboard
POST /api/dashboard/heartbeat         // Agent heartbeat
POST /api/dashboard/phase-update      // Phase change
POST /api/dashboard/progress          // Progress update
POST /api/dashboard/status            // Status change
POST /api/dashboard/message           // Send message to user
POST /api/dashboard/error             // Report error
```

---

## Real-Time Updates

### WebSocket Connection

```typescript
// Dashboard connects to WebSocket
const ws = new WebSocket('wss://bitloom.cloud/api/dashboard/stream')

ws.onmessage = (event) => {
  const update = JSON.parse(event.data)

  switch (update.type) {
    case 'project_created':
      // Add project to dashboard
      addProjectCard(update.project)
      break

    case 'phase_advanced':
      // Update PLC visualization
      updatePhaseProgress(update.projectId, update.phase)
      break

    case 'agent_spawned':
      // Add to agents panel
      addAgentCard(update.agent)
      break

    case 'agent_status':
      // Update agent status
      updateAgentStatus(update.agentId, update.status)
      break

    case 'progress_update':
      // Update progress bars
      updateProgress(update.projectId, update.progress)
      break
  }
}
```

### Agents Push Updates

```typescript
// ultra:architect pushes updates
class UltraArchitect {
  async reportProgress(projectId: string, progress: number) {
    // Update GitHub issue
    await this.createComment(projectId, `Progress: ${progress}%`)

    // Push to dashboard via WebSocket
    await this.pushToDashboard({
      type: 'progress_update',
      projectId,
      progress,
      timestamp: new Date().toISOString()
    })
  }
}
```

---

## User Workflow

### Creating a New Project

```
1. User clicks [New Project] on dashboard
   ↓
2. Form appears:
   - Title: "Build REST API for tasks"
   - Type: [Feature Request | Bug Fix | Review]
   - Priority: [Low | Medium | High | Critical]
   - Project: [ubuntu | hscheema1979 | ...]
   ↓
3. User submits
   ↓
4. Dashboard creates GitHub issue
   ↓
5. ultra:team-lead auto-assigned
   ↓
6. ultra:architect assigned as technical lead
   ↓
7. Project appears in "To Do" column
   ↓
8. User can see in:
   - Dashboard Projects board
   - PLC Manager page
   - Agents Monitor page
```

### Managing a Project

```
1. User goes to PLC Manager page
   ↓
2. Selects "REST API" project
   ↓
3. Sees phase pipeline visualization
   ↓
4. Sees ultra:architect working on "Architecture" phase
   ↓
5. Sees progress: 60%
   ↓
6. Can:
   - Message ultra:architect
   - Request phase review
   - Pause project
   - Add more agents
   - Advance to next phase (when ready)
```

### Monitoring Agents

```
1. User goes to Agents Monitor page
   ↓
2. Sees all active agents
   ↓
3. Clicks on ultra:architect
   ↓
4. Sees detailed view:
   - Current activity
   - Projects working on
   - Recent messages
   - Performance metrics
   ↓
5. Can:
   - Send message to agent
   - Reassign to different project
   - Adjust workload
   - View detailed logs
```

---

## What to Build

### Phase 1: Core Dashboard (Now)

1. **Enhance Main Dashboard (/)**
   - Add Projects Pipeline (Kanban from GitHub)
   - Add Active Agents panel
   - Add GitHub Integration status

2. **Create PLC Manager (/plc)**
   - Phase pipeline visualization
   - Current phase details
   - Phase controls
   - Activity log

3. **Create Agents Monitor (/agents)**
   - Active agents list
   - Agent details
   - Agent controls

4. **Create GitHub Integration (/github)**
   - Connection status
   - Project boards
   - Recent activity

### Phase 2: Agent Integration

1. **Enhance ultra:team-lead skill**
   - Add dashboard reporting
   - Add WebSocket updates
   - Add phase management

2. **Enhance ultra:architect skill**
   - Add PLC execution
   - Add progress reporting
   - Add approval requests

3. **Create dashboard APIs**
   - Agent heartbeat endpoint
   - Phase update endpoint
   - Progress update endpoint

### Phase 3: Real-Time

1. **WebSocket server**
   - Agent updates → Dashboard
   - Dashboard controls → Agents
   - GitHub webhooks → Dashboard

2. **Real-time sync**
   - GitHub issues → Dashboard
   - Dashboard actions → GitHub
   - Agent activity → All

---

**This is the RIGHT architecture: Dashboard = Management Interface for Agents to execute PLC with GitHub as backend!** ✅
