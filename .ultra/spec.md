# GitHub Mission Control Dashboard - Workflow Automation System

**Project:** Workflow Automation System
**Date:** 2025-03-06
**Status:** Phase 0 Complete
**Version:** 1.0

---

## Executive Summary

A comprehensive workflow automation system that enables users to submit feature requests through the GitHub Mission Control Dashboard and automatically trigger AI agents (ultra:architect, ultra:team-lead) to resolve them with proper orchestration, phase management, and user control points.

**Three Supported Workflows:**
1. **Quick Feature Request** - Simple, single-agent execution with minimal friction
2. **Full Ultrapilot Project** - Complete 5-phase development lifecycle with approval gates
3. **Ultra-Lead Task Queue** - Multi-project task management and prioritization

**Inspired By:** Monday.com, Jira Automation, Asana Project Templates, Linear Issue Management

---

## 1. Requirements

### 1.1 Functional Requirements

**FR-1: Feature Request Submission**
- User interface for submitting feature requests (form-based and chat-based)
- Automatic intent detection (feature-request, bug-report, question, review)
- GitHub issue auto-creation with templates and labels
- File/screenshot attachment support
- Draft auto-save

**FR-2: Agent Orchestration**
- Automatic agent assignment based on intent:
  - ultra:analyst (requirements)
  - ultra:architect (design)
  - ultra:planner (planning)
  - ultra:team-lead (coordination)
  - ultra:executor (implementation)
  - ultra:verifier (testing)
  - ultra:reviewer (review)
- Multi-phase workflow support (10 phases)
- Parallel execution for independent tasks
- File ownership management to prevent conflicts

**FR-3: User Control Points**
- Approval gates at key decision points:
  - Post-requirements (confirm understanding)
  - Post-architecture (approve approach)
  - Post-planning (confirm tasks)
  - Pre-deployment (approve release)
- Real-time progress monitoring
- Pause/resume/intervention capabilities
- Cancellation with cleanup

**FR-4: Task Queue Management**
- Prioritized task queue
- Bulk task submission
- Task dependency support
- Manual reordering and reassignment
- Multi-project coordination

**FR-5: Progress Visibility**
- Real-time dashboard with active workflows
- Phase progress tracking
- Agent utilization metrics
- Artifact access (specs, plans, code)
- Audit trail

### 1.2 User Requirements

**UR-1: Quick Feature Request** (< 30 min)
- Submit in under 2 minutes
- Automatic agent execution
- Progress without approvals
- Notification on completion

**UR-2: Full Ultrapilot** (Hours to days)
- Requirements clarification (interactive)
- Architecture approval
- Implementation plan approval
- Test results review
- Final deployment approval

**UR-3: Task Queue** (Parallel execution)
- Submit multiple related tasks
- See prioritization recommendations
- Monitor parallel execution
- Reassign tasks between agents

### 1.3 Technical Requirements

**TR-1: Tech Stack**
- Frontend: Next.js 15, TypeScript, shadcn/ui, Tailwind CSS
- Backend: Node.js, GitHub App (webhooks, GraphQL)
- Real-time: WebSockets or Server-Sent Events
- Storage: JSON files in `.ultra/state/` (Git-tracked)

**TR-2: Agent Integration**
- UltraPilot plugin integration
- Claude Code CLI agent invocation
- Agent lifecycle management (spawn, monitor, terminate)
- File-based communication

**TR-3: GitHub Integration**
- GitHub App authentication (not PAT)
- Issue creation with templates
- Label/state management via labels
- Comment-based activity logging
- Pull request automation

**TR-4: State Management**
- Atomic state updates in JSON
- Version history and rollback
- Checkpoint system for recovery
- Compression for old states

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB MISSION CONTROL                      │
│                      NEXT.JS DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  WorkflowRouter  │  ProgressMonitor  │  ControlPanel  │  QueueUI │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌──────────────────────┐      ┌──────────────────────┐
│  WebSocket Gateway  │      │   REST API Layer     │
│  (Real-time Updates)  │      │ (Submission/Control) │
└──────────────────────┘      └──────────────────────┘
              │                           │
              └─────────────┬─────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  WorkflowEngine  │  AgentOrchestrator  │  GitHubIntegrator  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AGENT LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  ultra:architect  │  ultra:team-lead  │  UltraPilot Skills    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB APP BACKEND                          │
│  (Issues = State, Comments = Activity, PRs = Deliverables)    │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Frontend Components

**Workflow Submission Component:**
```typescript
// src/components/workflows/submit-form.tsx
<WorkflowSubmitForm>
  - Title input
  - Description textarea (rich text)
  - Type selector (Feature/Bug/Review)
  - Priority selector (Low/Medium/High/Critical)
  - Project selector
  - Workflow type: Quick | Full Ultrapilot | Queue
  - Attachments (files, screenshots)
  - Intent detection preview
  - Submit button
</WorkflowSubmitForm>
```

**Workflow Selection Component:**
```typescript
// src/components/workflows/workflow-selector.tsx
<WorkflowSelector>
  Radio buttons:
  ◉ Quick Request (Simple, fast, single agent)
  ○ Full Ultrapilot (Complete lifecycle, approvals)
  ○ Add to Queue (Multi-task coordination)
</WorkflowSelector>
```

**Progress Visualization Component:**
```typescript
// src/components/workflows/progress-tracker.tsx
<WorkflowProgress>
  PhasePipeline:
    ✓ Initiation → ✓ Requirements → ✓ Architecture
    → ⚡ Execution (68%) → ○ Verification → ...

  CurrentActivity:
    Agent: ultra:executor-high
    Activity: "Implementing OAuth callback"
    File: src/auth/oauth/callback.ts
    Time: 1h 45min

  ControlHooks:
    [Pause] [Intervene] [Approve] [Reject]
</WorkflowProgress>
```

**Task Queue Component:**
```typescript
// src/components/workflows/task-queue.tsx
<TaskQueue>
  QueueList:
    1. ⚡ Add user profile [high] ultra:team-lead
    2. ⚡ Implement search [medium] ultra:team-lead
    3. ⚡ Refactor DB [low] ultra:team-lead

  Controls:
    [Reorder] [Reassign] [Pause] [Cancel]
</TaskQueue>
```

### 2.3 Backend Architecture

**API Endpoints:**
```typescript
// Workflow Management
POST   /api/workflows                    // Create workflow
GET    /api/workflows/:id                // Get workflow details
PUT    /api/workflows/:id/advance        // Advance phase
POST   /api/workflows/:id/pause          // Pause workflow
POST   /api/workflows/:id/approve        // Approve gate
POST   /api/workflows/:id/intervene      // User intervention

// Task Queue
POST   /api/tasks                        // Create task
GET    /api/tasks                        // List tasks
POST   /api/tasks/:id/reassign           // Reassign agent
PUT    /api/tasks/:id/priority           // Update priority

// Real-time
GET    /api/workflows/stream             // SSE stream for updates
```

**Workflow Engine:**
```typescript
// src/lib/workflow-engine.ts
class WorkflowEngine {
  async createWorkflow(data) {
    // 1. Detect intent
    const intent = await detectIntent(data)

    // 2. Create GitHub issue
    const issue = await createGitHubIssue(data, intent)

    // 3. Initialize workflow state
    const workflow = {
      id: generateId(),
      type: data.workflowType,
      intent,
      githubIssue: issue.number,
      currentPhase: 'initiation',
      status: 'pending',
      createdAt: new Date()
    }

    // 4. Save state
    await saveWorkflowState(workflow)

    // 5. Trigger agent based on type
    if (workflow.type === 'quick') {
      await this.triggerQuickWorkflow(workflow)
    } else if (workflow.type === 'full') {
      await this.triggerUltrapilotWorkflow(workflow)
    } else if (workflow.type === 'queue') {
      await this.addToQueue(workflow)
    }

    return workflow
  }
}
```

**Agent Orchestrator:**
```typescript
// src/lib/agent-orchestrator.ts
class AgentOrchestrator {
  async triggerQuickWorkflow(workflow: Workflow) {
    // Single agent execution
    const agent = workflow.intent.suggestedAgent

    // Spawn agent
    await spawnAgent(agent, {
      taskId: workflow.id,
      type: 'quick-request',
      title: workflow.title,
      description: workflow.description
    })

    // Monitor progress
    await this.monitorAgentProgress(workflow.id, agent)
  }

  async triggerUltrapilotWorkflow(workflow: Workflow) {
    // Use UltraPilot skill integration
    const skillIntegration = new UltraPilotSkillIntegration({
      workspacePath: process.cwd(),
      ultraPath: '.ultra'
    })

    // Hand off to UltraPilot
    await skillIntegration.phase1Complete('.ultra/plan.md')

    // Listen for progress
    skillIntegration.on('progress', (progress) => {
      this.updateWorkflowProgress(workflow.id, progress)
    })

    skillIntegration.on('completed', (result) => {
      this.completeWorkflow(workflow.id, result)
    })
  }
}
```

**GitHub Integration:**
```typescript
// src/lib/github-integrator.ts
class GitHubIntegrator {
  async createIssue(workflow: Workflow) {
    const template = this.getIssueTemplate(workflow.type)
    const labels = [
      `type:${workflow.intent.type}`,
      `priority:${workflow.intent.priority}`,
      `status:pending`,
      `agent:${workflow.intent.suggestedAgent}`
    ]

    const issue = await github.rest.issues.create({
      owner: 'hscheema1979',
      repo: workflow.projectId,
      title: `[${workflow.intent.type}] ${workflow.title}`,
      body: template.body,
      labels
    })

    return issue
  }

  async postStatusUpdate(workflowId: string, phase: string, status: string) {
    await github.rest.issues.createComment({
      owner: 'hscheema1979',
      repo: getRepo(workflowId),
      issue_number: getIssueNumber(workflowId),
      body: `**[${phase}]** ${status}`
    })
  }
}
```

### 2.4 Data Flow

**Quick Request Flow:**
```
User submits form
    ↓
Intent detection (ultra:analyst logic)
    ↓
GitHub issue created with labels
    ↓
ultra:architect spawned
    ↓
Agent posts progress to GitHub comments
    ↓
Dashboard shows real-time updates via WebSocket
    ↓
Agent completes, closes issue
    ↓
User notified
```

**Full Ultrapilot Flow:**
```
User submits detailed request
    ↓
Workflow created with type='full'
    ↓
UltraPilot skill triggered
    ↓
Phase 0: Requirements (ultra:analyst)
  ├─ User approval gate
  └─ Approved → spec.md created
    ↓
Phase 1: Architecture (ultra:architect)
  ├─ User approval gate
  └─ Approved → Architecture designed
    ↓
Phase 2: Planning (ultra:planner)
  ├─ User approval gate
  └─ Approved → plan.md created
    ↓
Hand off to Ultra-Lead (Phases 3-6)
  ├─ Execution (ultra:team-lead + executors)
  ├─ Verification (ultra:verifier)
  ├─ Review (reviewers)
  └─ Deployment approval
    ↓
Complete → Notification
```

**Task Queue Flow:**
```
User submits multiple tasks
    ↓
Tasks added to queue
    ↓
ultra:team-lead analyzes dependencies
    ↓
Priority order recommended
    ↓
User adjusts order
    ↓
Ultra-Lead spawns agents for parallel execution
    ↓
Progress monitored in dashboard
    ↓
User can reassign/pause/reorder
    ↓
All complete → Summary
```

### 2.5 User Control Hooks (Approval Gates)

```typescript
// src/lib/approval-gates.ts
class ApprovalGates {
  async checkApprovalGate(workflowId: string, phase: string) {
    const workflow = await getWorkflow(workflowId)

    // Check if this phase requires approval
    if (this.requiresApproval(phase)) {
      // Pause workflow
      await this.pauseWorkflow(workflowId)

      // Update GitHub issue
      await this.postApprovalRequest(workflowId, phase)

      // Wait for user action
      const approved = await this.waitForUserApproval(workflowId)

      if (!approved) {
        // Rejected - return to previous phase for revision
        await this.returnToPreviousPhase(workflowId, phase)
        return false
      }
    }

    // Approved - advance to next phase
    await this.advancePhase(workflowId, phase)
    return true
  }
}
```

### 2.6 Real-time Updates

**WebSocket Gateway:**
```typescript
// src/lib/websocket-gateway.ts
class WebSocketGateway {
  broadcastWorkflowUpdate(workflowId: string, update: any) {
    const message = JSON.stringify({
      type: 'workflow:update',
      workflowId,
      update
    })

    // Send to all connected clients
    this.clients.forEach(client => {
      client.send(message)
    })
  }

  // Agent calls this to report progress
  async reportProgress(agent: string, workflowId: string, progress: any) {
    // Update state
    await this.updateWorkflowState(workflowId, progress)

    // Broadcast to dashboard
    this.broadcastWorkflowUpdate(workflowId, {
      agent,
      progress,
      timestamp: new Date()
    })
  }
}
```

---

## 3. Data Model

### 3.1 Workflow Entity

```typescript
interface Workflow {
  id: string                          // Unique ID
  type: 'quick' | 'full' | 'queue'
  projectId: string
  githubIssue?: number

  title: string
  description: string
  intent: IntentAnalysis

  currentPhase: Phase
  phaseHistory: PhaseTransition[]
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  progress: number                    // 0-100

  primaryAgent?: string
  requiresApproval: boolean
  approvedAt?: string

  artifacts: Artifact[]
  specPath?: string
  planPath?: string

  result?: 'success' | 'partial' | 'failed'
  error?: string
  completedAt?: string
  duration?: number

  createdAt: string
  updatedAt: string
}
```

### 3.2 Task Entity

```typescript
interface Task {
  id: string
  workflowId?: string
  projectId: string
  githubIssue?: number
  createdAt: string

  type: TaskType
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'

  assignedTo: string                  // Agent
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'blocked'
  progress: number

  dependsOn: string[]
  blocks: string[]

  startedAt?: string
  completedAt?: string
  duration?: number

  result?: TaskResult
  error?: string
  filesModified: string[]
  commits: string[]

  verified: boolean
  testsPassed?: boolean
}
```

### 3.3 State Storage

**File Structure:**
```
.ultra/
├── workflows/
│   ├── active/
│   │   ├── WF-001.json
│   │   ├── WF-002.json
│   │   └── ...
│   ├── completed/
│   │   ├── WF-100.json
│   │   └── ...
│   └── state-index.json
├── queue/
│   └── tasks.json
└── artifacts/
    ├── specs/
    ├── plans/
    └── code/
```

---

## 4. Implementation Plan

### Phase 1: Foundation (Week 1-2)
1. Set up workflow state management
2. Create workflow API endpoints
3. Build GitHub integration layer
4. Implement intent detection

### Phase 2: Quick Request (Week 2-3)
1. Build submission form
2. Create workflow engine
3. Implement single-agent orchestration
4. Build progress tracking

### Phase 3: Full Ultrapilot (Week 3-4)
1. Integrate UltraPilot skill
2. Implement approval gates
3. Build multi-phase UI
4. Create artifact tracking

### Phase 4: Task Queue (Week 4-5)
1. Implement queue system
2. Integrate ultra:team-lead
3. Build queue management UI
4. Create bulk operations

### Phase 5: Polish (Week 5-6)
1. Dashboard improvements
2. Real-time updates
3. Error handling
4. Documentation

---

## 5. GitHub Integration

### 5.1 Issue Templates

**Quick Request Template:**
```markdown
# [{TYPE}] {Title}

**Type:** {feature-request | bug-report}
**Priority:** {high | medium | low}
**Project:** {project-name}
**Agent:** {ultra:architect | ultra:debugger}

## Description
{user description}

## Workflow
- **Created:** {timestamp}
- **Agent:** {agent}
- **Status:** {pending | in-progress | completed}

## Progress
- [ ] Agent assigned
- [ ] In progress
- [ ] Completed

---

**Labels:** `type:{type}`, `priority:{priority}`, `status:{status}`, `agent:{agent}`
```

**Full Ultrapilot Template:**
```markdown
# [{TYPE}] {Title}

**Workflow:** Full Ultrapilot Project
**Phase:** {current-phase}
**Progress:** {progress}%

## Requirements
<!-- Added after Phase 0 -->

### Functional Requirements
{requirements}

### Acceptance Criteria
{criteria}

## Architecture
<!-- Added after Phase 1 -->

### System Design
{architecture}

### Technical Decisions
{decisions}

## Implementation Plan
<!-- Added after Phase 2 -->

### Tasks
{tasks}

### Dependencies
{dependencies}

## Execution Log
<!-- Updated throughout execution -->

### Phase 0: Requirements
- [ ] Complete
- [ ] Approved by user
- Agent: {ultra:analyst}

### Phase 1: Architecture
- [ ] Complete
- [ ] Approved by user
- Agent: {ultra:architect}

... other phases ...

---

**Labels:** `type:full-ultrapilot`, `phase:{current-phase}`, `status:{status}`, `agent:{current-agent}`
```

### 5.2 Label System

**Workflow Type Labels:**
- `type:feature-request`
- `type:bug-report`
- `type:question`
- `type:review`

**Workflow Mode Labels:**
- `workflow:quick`
- `workflow:full-ultrapilot`
- `workflow:queue`

**Phase Labels:**
- `phase:initiation`
- `phase:requirements`
- `phase:architecture`
- `phase:planning`
- `phase:execution`
- `phase:verification`
- `phase:review`
- `phase:approval`
- `phase:deployment`
- `phase:monitoring`

**Status Labels:**
- `status:pending`
- `status:in-progress`
- `status:waiting-approval`
- `status:approved`
- `status:rejected`
- `status:completed`
- `status:failed`

**Agent Labels:**
- `agent:ultra-analyst`
- `agent:ultra-architect`
- `agent:ultra-planner`
- `agent:ultra-team-lead`
- `agent:ultra-executor`
- `agent:ultra-verifier`
- `agent:ultra-reviewer`

**Priority Labels:**
- `priority:critical`
- `priority:high`
- `priority:medium`
- `priority:low`

---

## 6. User Interface Mockups

### 6.1 Submission Form

```
┌────────────────────────────────────────────────────────┐
│              New Feature Request                       │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Title: [_____________________________]               │
│                                                        │
│  Type:   ◉ Feature  ○ Bug  ○ Review                    │
│                                                        │
│  Priority: ○ Low  ◉ Medium  ○ High  ○ Critical        │
│                                                        │
│  Description:                                           │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  Workflow:                                              │
│  ◉ Quick Request (simple, fast)                        │
│  ○ Full Ultrapilot (complete lifecycle)               │
│  ○ Add to Queue (multi-task)                          │
│                                                        │
│  Detected Intent:                                      │
│  • Type: feature-request (95%)                          │
│  • Agent: ultra:architect                               │
│  • Labels: type:feature, priority:medium               │
│                                                        │
│  [Cancel]                               [Submit]      │
└────────────────────────────────────────────────────────┘
```

### 6.2 Workflow Dashboard

```
┌────────────────────────────────────────────────────────────────────┐
│  Workflows (5 Active)    Tasks (12 in Queue)    Agents (3 Active)  │
├────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Active Workflows:                                                   │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 🏗️ Add OAuth [WF-001]                      [68%]   ultra:executor │ │
│  │ Phase: Execution │ Started: 2h ago │ ETA: 45min               │ │
│  │ [Pause] [View] [GitHub #123]                                  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Task Queue:                                                         │
│  1. ⚡ Add user profile [high]     ultra:team-lead               │
│  2. ⚡ Implement search [medium]   ultra:team-lead               │
│  3. ⚡ Refactor database [low]      ultra:team-lead               │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 7. Success Criteria

- ✅ User can submit feature request in under 2 minutes
- ✅ Intent detection accuracy > 90%
- ✅ GitHub issue created automatically with correct template
- ✅ Appropriate agent assigned automatically
- ✅ Real-time progress updates visible in dashboard
- ✅ User receives notification on completion
- ✅ Full Ultrapilot workflows pass through all 5 phases with approval gates
- ✅ Task queue supports parallel execution with dependency management
- ✅ User can pause/resume/cancel workflows at any time
- ✅ Complete audit trail in GitHub issues
- ✅ Dashboard works with existing Relay chat interface

---

**Next:** Phase 1 - Planning with Multi-Perspective Review

**Files Created:**
- `/home/ubuntu/.claude/projects/-home-ubuntu-hscheema1979/87a4b7e8-70ce-4997-aa71-b6dee3c0fc74/tool-results/call_bb062c4cc4e74c448e8c5c8b.json` - Architecture document
- Requirements merged into this spec.md
