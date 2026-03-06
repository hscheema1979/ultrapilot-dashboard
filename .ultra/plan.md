# Implementation Plan - Workflow Automation System

**Project:** GitHub Mission Control Dashboard - Workflow Automation
**Date:** 2026-03-06
**Status:** Phase 1 - Planning (Draft v1)
**Version:** 1.0

---

## Overview

This implementation plan details the construction of a comprehensive workflow automation system that enables users to submit feature requests through the GitHub Mission Control Dashboard and automatically trigger AI agents to resolve them with proper orchestration, phase management, and user control points.

### Scope

**Three Supported Workflows:**
1. **Quick Feature Request** - Simple, single-agent execution with minimal friction
2. **Full Ultrapilot Project** - Complete 5-phase development lifecycle with approval gates
3. **Ultra-Lead Task Queue** - Multi-project task management and prioritization

### Success Criteria

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

---

## Component Breakdown

### 1. Frontend Components

#### 1.1 Workflow Submission Components

**Component: WorkflowSubmitForm**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/workflows/submit-form.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** shadcn/ui components, API routes
- **Inputs:** User input (title, description, type, priority, attachments)
- **Outputs:** Workflow submission request to API

```typescript
interface WorkflowSubmitFormProps {
  onSubmit: (data: WorkflowSubmissionData) => Promise<void>
  projects: Project[]
  currentProject?: string
}

interface WorkflowSubmissionData {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId: string
  workflowType: 'quick' | 'full' | 'queue'
  attachments?: File[]
}
```

**Responsibilities:**
- Render form with title, description, type, priority selectors
- Show project selector dropdown
- Display workflow type radio buttons
- Show intent detection preview in real-time
- Handle file/screenshot attachments
- Auto-save drafts to localStorage
- Validate form before submission

**Integration Points:**
- `/api/workflows` - POST endpoint for submission
- `/api/intent-detect` - POST endpoint for real-time intent detection
- Existing project selector from `/src/components/dashboard/project-selector.tsx`

---

**Component: WorkflowSelector**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/workflows/workflow-selector.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** shadcn/ui radio group
- **Inputs:** User selection
- **Outputs:** Selected workflow type

```typescript
interface WorkflowSelectorProps {
  value: 'quick' | 'full' | 'queue'
  onChange: (value: 'quick' | 'full' | 'queue') => void
  description?: boolean
}

interface WorkflowOption {
  id: 'quick' | 'full' | 'queue'
  title: string
  description: string
  estimatedTime: string
  features: string[]
}
```

**Responsibilities:**
- Display three workflow options with radio buttons
- Show descriptions, estimated time, and features for each
- Update parent component on selection change
- Provide tooltips explaining each workflow type

**Workflow Options:**
1. **Quick Request** - "Simple, fast, single agent. < 30 min"
2. **Full Ultrapilot** - "Complete lifecycle, approvals. Hours to days"
3. **Add to Queue** - "Multi-task coordination. Parallel execution"

---

**Component: IntentDetectionPreview**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/workflows/intent-preview.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** API integration
- **Inputs:** User description text
- **Outputs:** Real-time intent analysis display

```typescript
interface IntentDetectionPreviewProps {
  description: string
  type: string
  onIntentDetected: (intent: IntentAnalysis) => void
}

interface IntentAnalysis {
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  confidence: number
  suggestedAgent: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  labels: string[]
  estimatedComplexity: 'simple' | 'medium' | 'complex'
}
```

**Responsibilities:**
- Debounce user input (500ms)
- Call intent detection API
- Display confidence score, suggested agent, labels
- Show visual confidence indicator (progress bar)
- Allow user to override detected intent

---

#### 1.2 Progress Visualization Components

**Component: WorkflowProgressTracker**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/workflows/progress-tracker.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** shadcn/ui progress, tabs, badge components
- **Inputs:** Workflow ID or workflow object
- **Outputs:** Visual progress display

```typescript
interface WorkflowProgressTrackerProps {
  workflowId?: string
  workflow?: Workflow
  refreshInterval?: number // default: 5000ms
  onApprove?: (phase: string) => Promise<void>
  onReject?: (phase: string, feedback: string) => Promise<void>
  onPause?: () => Promise<void>
  onIntervene?: () => void
}

interface PhaseProgress {
  phase: string
  status: 'pending' | 'in-progress' | 'waiting-approval' | 'approved' | 'rejected' | 'completed'
  agent?: string
  startedAt?: string
  completedAt?: string
  progress: number // 0-100
}
```

**Responsibilities:**
- Display phase pipeline with status icons
- Show current agent activity
- Display progress percentage for each phase
- Render approval gate UI when waiting for user approval
- Provide pause/resume/intervene controls
- Show artifact links (spec.md, plan.md, code)
- Auto-refresh via WebSocket or polling

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Phase Pipeline:                                             │
│ ✓ Initiation → ✓ Requirements → ✓ Architecture             │
│ → ⚡ Execution (68%) → ○ Verification → ○ Review           │
├─────────────────────────────────────────────────────────────┤
│ Current Activity:                                           │
│ Agent: ultra:executor-high                                  │
│ Activity: "Implementing OAuth callback"                    │
│ File: src/auth/oauth/callback.ts                           │
│ Time: 1h 45min                                              │
├─────────────────────────────────────────────────────────────┤
│ Control Hooks:                                              │
│ [Pause] [Intervene] [Approve] [Reject]                     │
└─────────────────────────────────────────────────────────────┘
```

---

**Component: TaskQueueList**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/components/workflows/task-queue.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** shadcn/ui card, badge, button components
- **Inputs:** Queue ID or project filter
- **Outputs:** Interactive task list

```typescript
interface TaskQueueListProps {
  projectId?: string
  workflowId?: string
  onReorder?: (taskId: string, newPosition: number) => Promise<void>
  onReassign?: (taskId: string, agent: string) => Promise<void>
  onPause?: (taskId: string) => Promise<void>
  onResume?: (taskId: string) => Promise<void>
  onCancel?: (taskId: string) => Promise<void>
}

interface TaskQueueItem {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  dependsOn: string[]
  blocks: string[]
  estimatedTime?: string
  progress: number
}
```

**Responsibilities:**
- Display prioritized task list
- Support drag-and-drop reordering
- Show task dependencies visually
- Provide reassignment dropdown
- Show progress indicators
- Allow bulk operations (pause all, cancel all)

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ Task Queue (12 tasks)                         [+ Add Task]  │
├─────────────────────────────────────────────────────────────┤
│ 1. ⚡ Add user profile [high]     ultra:team-lead   [▶▏]   │
│    └─ Blocks: Task 3, Task 5                                   │
│ 2. ⚡ Implement search [medium]   ultra:team-lead   [▶▏]   │
│ 3. ⚡ Refactor database [low]      ultra:team-lead   [⏸]   │
│    └─ Waiting for: Task 1                                    │
└─────────────────────────────────────────────────────────────┘
```

---

#### 1.3 Dashboard Pages

**Page: Workflow Dashboard**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/workflows/page.tsx`
- **Owner:** Agent: Frontend Team
- **Dependencies:** DashboardLayout, workflow components
- **Route:** `/workflows`

```typescript
// Page structure
export default function WorkflowDashboardPage() {
  return (
    <DashboardLayout>
      <WorkflowDashboard>
        <WorkflowStats />
        <ActiveWorkflowsList />
        <TaskQueuePreview />
      </WorkflowDashboard>
    </DashboardLayout>
  )
}
```

**Responsibilities:**
- Display workflow statistics (active, completed, failed)
- Show list of active workflows with quick actions
- Provide task queue preview
- Quick submit button for new workflow

---

### 2. Backend Services

#### 2.1 Core Services

**Service: WorkflowEngine**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/workflows/engine.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** GitHub integration, agent orchestrator, state management
- **Inputs:** Workflow submission data
- **Outputs:** Workflow instance, agent triggers

```typescript
class WorkflowEngine {
  async createWorkflow(data: WorkflowSubmissionData): Promise<Workflow>
  async getWorkflow(workflowId: string): Promise<Workflow>
  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<Workflow>
  async advancePhase(workflowId: string, phase: string): Promise<void>
  async pauseWorkflow(workflowId: string): Promise<void>
  async resumeWorkflow(workflowId: string): Promise<void>
  async cancelWorkflow(workflowId: string, cleanup: boolean): Promise<void>
  async approveGate(workflowId: string, phase: string): Promise<void>
  async rejectGate(workflowId: string, phase: string, feedback: string): Promise<void>
  private async triggerQuickWorkflow(workflow: Workflow): Promise<void>
  private async triggerFullWorkflow(workflow: Workflow): Promise<void>
  private async addToQueue(workflow: Workflow): Promise<void>
}
```

**Responsibilities:**
- Detect intent from submission data
- Create GitHub issue with appropriate template
- Initialize workflow state
- Trigger appropriate workflow type (quick/full/queue)
- Manage phase transitions
- Handle approval gates
- Coordinate agent spawning

**I/O Contract:**
```typescript
// Input
interface CreateWorkflowInput {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId: string
  workflowType: 'quick' | 'full' | 'queue'
  submittedBy: string
  attachments?: AttachmentMetadata[]
}

// Output
interface Workflow {
  id: string // format: WF-YYYYMMDD-XXXX
  type: 'quick' | 'full' | 'queue'
  projectId: string
  githubIssue: {
    number: number
    url: string
    owner: string
    repo: string
  }
  title: string
  description: string
  intent: IntentAnalysis
  currentPhase: WorkflowPhase
  phaseHistory: PhaseTransition[]
  status: WorkflowStatus
  progress: number // 0-100
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

---

**Service: IntentDetectionService**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/workflows/intent-detection.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** Claude API integration
- **Inputs:** Title, description, context
- **Outputs:** Intent analysis

```typescript
class IntentDetectionService {
  async detectIntent(data: {
    title: string
    description: string
    projectContext?: ProjectContext
  }): Promise<IntentAnalysis>

  async suggestAgent(intent: IntentAnalysis): Promise<string>
  async estimateComplexity(intent: IntentAnalysis): Promise<'simple' | 'medium' | 'complex'>
  async generateLabels(intent: IntentAnalysis): Promise<string[]>
  private analyzeKeywords(text: string): Promise<KeywordAnalysis>
  private analyzeComplexity(description: string): Promise<number>
}
```

**Responsibilities:**
- Analyze title and description for intent
- Classify request type (feature/bug/question/review)
- Suggest appropriate agent
- Estimate complexity and priority
- Generate GitHub labels
- Calculate confidence scores

**Detection Logic:**
```typescript
// Intent classification rules
const INTENT_PATTERNS = {
  'feature-request': {
    keywords: ['add', 'implement', 'create', 'build', 'feature', 'support'],
    agent: 'ultra:architect',
    weight: 1.0
  },
  'bug-report': {
    keywords: ['bug', 'fix', 'error', 'broken', 'issue', 'crash'],
    agent: 'ultra:debugger',
    weight: 1.2
  },
  'question': {
    keywords: ['how', 'what', 'why', 'explain', 'help'],
    agent: 'ultra:analyst',
    weight: 0.8
  },
  'review': {
    keywords: ['review', 'audit', 'check', 'validate'],
    agent: 'ultra:code-reviewer',
    weight: 0.9
  }
}
```

---

**Service: AgentOrchestrator**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/agents/orchestrator.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** UltraPilot plugin integration, Claude Code CLI
- **Inputs:** Agent type, task context
- **Outputs:** Agent execution results

```typescript
class AgentOrchestrator {
  async spawnAgent(agentType: string, context: AgentContext): Promise<AgentSession>
  async monitorAgent(sessionId: string): Promise<AgentProgress>
  async terminateAgent(sessionId: string): Promise<void>
  async pauseAgent(sessionId: string): Promise<void>
  async resumeAgent(sessionId: string): Promise<void>
  async getAgentOutput(sessionId: string): Promise<AgentOutput>
  private async triggerQuickWorkflow(workflow: Workflow): Promise<void>
  private async triggerFullWorkflow(workflow: Workflow): Promise<void>
  private async triggerQueueWorkflow(workflow: Workflow): Promise<void>
}

interface AgentContext {
  taskId: string
  workflowId?: string
  type: 'quick-request' | 'phase-execution' | 'queue-task'
  title: string
  description: string
  files?: FileOwnership[]
  dependencies?: Dependency[]
  checkpoints?: Checkpoint[]
}

interface AgentSession {
  sessionId: string
  agentType: string
  status: 'starting' | 'running' | 'paused' | 'completed' | 'failed'
  startedAt: string
  completedAt?: string
  output?: AgentOutput
  error?: string
}
```

**Responsibilities:**
- Spawn UltraPilot agents via CLI
- Monitor agent progress
- Handle agent lifecycle (start, pause, resume, terminate)
- Manage file ownership boundaries
- Coordinate parallel agent execution
- Collect agent output and artifacts

**Agent Spawning Mechanism:**
```typescript
// Spawn agent via Claude Code CLI
async spawnAgent(agentType: string, context: AgentContext): Promise<AgentSession> {
  const sessionId = generateSessionId()

  // Create agent input file
  const inputFile = `/tmp/agent-${sessionId}.json`
  await writeFile(inputFile, JSON.stringify({
    agent: agentType,
    context,
    statePath: `.ultra/workflows/active/${context.taskId}.json`
  }))

  // Spawn Claude Code with agent
  const agentProcess = spawn('claude', [
    'agent',
    agentType,
    '--input', inputFile,
    '--output', `.ultra/agents/sessions/${sessionId}.json`
  ])

  // Monitor process
  this.monitorProcess(agentProcess, sessionId)

  return {
    sessionId,
    agentType,
    status: 'starting',
    startedAt: new Date().toISOString()
  }
}
```

---

**Service: GitHubIntegrator**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/github/integrator.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** Existing github-auth.ts
- **Inputs:** Workflow data, updates
- **Outputs:** GitHub issues, comments, labels

```typescript
class GitHubIntegrator {
  async createIssue(workflow: Workflow): Promise<GitHubIssue>
  async updateIssue(workflowId: string, updates: any): Promise<void>
  async postComment(workflowId: string, comment: string): Promise<void>
  async updateLabels(workflowId: string, labels: string[]): Promise<void>
  async closeIssue(workflowId: string): Promise<void>
  async createPullRequest(workflowId: string, changes: any): Promise<GitHubPR>
  private getIssueTemplate(workflow: Workflow): IssueTemplate
  private generateLabels(workflow: Workflow): string[]
}

interface GitHubIssue {
  number: number
  url: string
  owner: string
  repo: string
  state: 'open' | 'closed'
  labels: string[]
}
```

**Responsibilities:**
- Create GitHub issues with templates
- Post status updates as comments
- Update issue labels
- Create pull requests for completed work
- Handle webhook events from GitHub
- Sync GitHub state with workflow state

**Issue Templates:**
- Quick Request Template
- Full Ultrapilot Template (with phase sections)
- Queue Task Template

---

**Service: ApprovalGateService**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/workflows/approval-gates.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** WorkflowEngine, GitHubIntegrator
- **Inputs:** Workflow ID, phase
- **Outputs:** Approval status, phase transitions

```typescript
class ApprovalGateService {
  async checkApprovalGate(workflowId: string, phase: string): Promise<ApprovalStatus>
  async requestApproval(workflowId: string, phase: string, artifacts: Artifact[]): Promise<void>
  async approve(workflowId: string, phase: string): Promise<void>
  async reject(workflowId: string, phase: string, feedback: string): Promise<void>
  private requiresApproval(phase: string): boolean
  private async pauseWorkflow(workflowId: string): Promise<void>
  private async advancePhase(workflowId: string, phase: string): Promise<void>
  private async returnToPreviousPhase(workflowId: string, phase: string): Promise<void>
}

interface ApprovalStatus {
  required: boolean
  status: 'pending' | 'approved' | 'rejected'
  requestedAt?: string
  approvedAt?: string
  rejectedAt?: string
  feedback?: string
}
```

**Approval Gates:**
- Post-Requirements (Phase 0 → Phase 1)
- Post-Architecture (Phase 1 → Phase 2)
- Post-Planning (Phase 2 → Phase 3)
- Pre-Deployment (Phase 5 → Phase 6)

---

**Service: WebSocketGateway**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/realtime/websocket-gateway.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** Next.js API routes, WebSocket server
- **Inputs:** Workflow updates, agent progress
- **Outputs:** Real-time broadcasts to clients

```typescript
class WebSocketGateway {
  broadcastWorkflowUpdate(workflowId: string, update: WorkflowUpdate): void
  broadcastAgentProgress(agent: string, workflowId: string, progress: AgentProgress): void
  broadcastQueueUpdate(queueId: string, update: QueueUpdate): void
  subscribeToWorkflow(workflowId: string, client: WebSocketClient): void
  unsubscribeFromWorkflow(workflowId: string, client: WebSocketClient): void
  private updateWorkflowState(workflowId: string, progress: any): Promise<void>
}

interface WorkflowUpdate {
  type: 'phase-change' | 'progress-update' | 'status-change' | 'artifact-created'
  workflowId: string
  timestamp: string
  data: any
}
```

**Responsibilities:**
- Manage WebSocket connections
- Broadcast workflow updates
- Stream agent progress
- Handle client subscriptions
- Provide fallback to Server-Sent Events (SSE)

---

#### 2.2 State Management

**Service: StateStore**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/state/store.ts`
- **Owner:** Agent: Backend Team
- **Dependencies:** File system operations
- **Inputs:** State objects
- **Outputs:** Persisted state files

```typescript
class StateStore {
  async saveWorkflow(workflow: Workflow): Promise<void>
  async getWorkflow(workflowId: string): Promise<Workflow | null>
  async listWorkflows(filters?: WorkflowFilters): Promise<Workflow[]>
  async deleteWorkflow(workflowId: string): Promise<void>
  async createCheckpoint(workflowId: string, label: string): Promise<Checkpoint>
  async restoreCheckpoint(workflowId: string, checkpointId: string): Promise<void>
  async compressOldStates(): Promise<void>
  private getWorkflowPath(workflowId: string): string
  private atomicWrite(path: string, data: any): Promise<void>
}

interface Checkpoint {
  id: string
  workflowId: string
  label: string
  state: Workflow
  createdAt: string
}
```

**State File Structure:**
```
.ultra/
├── workflows/
│   ├── active/
│   │   ├── WF-20260306-0001.json
│   │   ├── WF-20260306-0002.json
│   │   └── ...
│   ├── completed/
│   │   ├── WF-20260305-0999.json
│   │   └── ...
│   ├── checkpoints/
│   │   ├── WF-20260306-0001-checkpoint-001.json
│   │   └── ...
│   └── state-index.json
├── queue/
│   ├── tasks.json
│   └── dependencies.json
├── artifacts/
│   ├── specs/
│   ├── plans/
│   └── code/
└── agents/
    ├── sessions/
    │   ├── session-001.json
    │   └── ...
    └── outputs/
        ├── session-001-output.md
        └── ...
```

---

### 3. API Endpoints

#### 3.1 Workflow Management APIs

**Endpoint: POST /api/workflows**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes
- **Rate Limit:** 10 requests per minute

```typescript
// Request
interface CreateWorkflowRequest {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId: string
  workflowType: 'quick' | 'full' | 'queue'
  attachments?: File[]
}

// Response (201 Created)
interface CreateWorkflowResponse {
  workflow: Workflow
  githubIssue: {
    number: number
    url: string
  }
}

// Error Response (400 Bad Request)
interface ErrorResponse {
  error: string
  message: string
  details?: any
}
```

---

**Endpoint: GET /api/workflows/:id**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/[id]/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Response (200 OK)
interface GetWorkflowResponse {
  workflow: Workflow
  phases: PhaseProgress[]
  artifacts: Artifact[]
  activityLog: ActivityLogEntry[]
}

// Error Response (404 Not Found)
interface ErrorResponse {
  error: 'Workflow not found'
  workflowId: string
}
```

---

**Endpoint: PUT /api/workflows/:id/advance**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/[id]/advance/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface AdvancePhaseRequest {
  phase: string
  force?: boolean // Skip approval gates if true
}

// Response (200 OK)
interface AdvancePhaseResponse {
  workflow: Workflow
  previousPhase: string
  newPhase: string
}

// Error Response (400 Bad Request)
interface ErrorResponse {
  error: 'Approval required' | 'Invalid phase' | 'Workflow not ready'
  message: string
}
```

---

**Endpoint: POST /api/workflows/:id/pause**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/[id]/pause/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Response (200 OK)
interface PauseWorkflowResponse {
  workflow: Workflow
  pausedAt: string
}
```

---

**Endpoint: POST /api/workflows/:id/approve**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/[id]/approve/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface ApproveGateRequest {
  phase: string
  feedback?: string
}

// Response (200 OK)
interface ApproveGateResponse {
  workflow: Workflow
  approvedAt: string
  nextPhase: string
}
```

---

**Endpoint: POST /api/workflows/:id/intervene**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/[id]/intervene/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface InterveneRequest {
  action: 'pause' | 'redirect' | 'modify' | 'cancel'
  message?: string
  newAgent?: string
  newContext?: any
}

// Response (200 OK)
interface InterveneResponse {
  workflow: Workflow
  intervention: Intervention
}

interface Intervention {
  action: string
  triggeredBy: string
  triggeredAt: string
  result: string
}
```

---

#### 3.2 Task Queue APIs

**Endpoint: POST /api/tasks**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/tasks/route.ts` (extend existing)
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface CreateTaskRequest {
  title: string
  description: string
  type: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId: string
  dependsOn?: string[]
  workflowId?: string
}

// Response (201 Created)
interface CreateTaskResponse {
  task: Task
  position: number
}
```

---

**Endpoint: GET /api/tasks**
- **Location:** Same as above
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Query Parameters
interface GetTasksQuery {
  projectId?: string
  workflowId?: string
  status?: string
  assignedTo?: string
  sortBy?: 'priority' | 'created' | 'estimated'
}

// Response (200 OK)
interface GetTasksResponse {
  tasks: Task[]
  total: number
  queueStats: QueueStats
}

interface QueueStats {
  pending: number
  inProgress: number
  completed: number
  blocked: number
}
```

---

**Endpoint: POST /api/tasks/:id/reassign**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/tasks/[id]/reassign/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface ReassignTaskRequest {
  agent: string
  reason?: string
}

// Response (200 OK)
interface ReassignTaskResponse {
  task: Task
  previousAgent: string
  newAgent: string
}
```

---

**Endpoint: PUT /api/tasks/:id/priority**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/tasks/[id]/priority/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes

```typescript
// Request
interface UpdatePriorityRequest {
  priority: 'low' | 'medium' | 'high' | 'critical'
  reason?: string
}

// Response (200 OK)
interface UpdatePriorityResponse {
  task: Task
  previousPriority: string
  newPriority: string
  queueReordered: boolean
}
```

---

#### 3.3 Real-time APIs

**Endpoint: GET /api/workflows/stream**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/stream/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes
- **Protocol:** Server-Sent Events (SSE)

```typescript
// SSE Event Types
interface WorkflowStreamEvent {
  type: 'workflow:update' | 'phase:change' | 'agent:progress' | 'artifact:created'
  workflowId: string
  timestamp: string
  data: any
}

// Client Implementation
const eventSource = new EventSource('/api/workflows/stream')
eventSource.addEventListener('workflow:update', (event) => {
  const update = JSON.parse(event.data)
  // Update UI
})
```

---

**Endpoint: WebSocket /api/workflows/ws**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/workflows/ws/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes
- **Protocol:** WebSocket

```typescript
// WebSocket Messages
interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'update'
  workflowId?: string
  data?: any
}

// Client Implementation
const ws = new WebSocket('/api/workflows/ws')
ws.send(JSON.stringify({
  type: 'subscribe',
  workflowId: 'WF-20260306-0001'
}))
ws.onmessage = (event) => {
  const message = JSON.parse(event.data)
  // Handle update
}
```

---

#### 3.4 Intent Detection APIs

**Endpoint: POST /api/intent-detect**
- **Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/app/api/intent-detect/route.ts`
- **Owner:** Agent: Backend Team
- **Auth Required:** Yes
- **Rate Limit:** 20 requests per minute

```typescript
// Request
interface DetectIntentRequest {
  title: string
  description: string
  projectContext?: ProjectContext
}

// Response (200 OK)
interface DetectIntentResponse {
  intent: IntentAnalysis
  confidence: number
  alternatives?: IntentAnalysis[]
}
```

---

### 4. Data Models

#### 4.1 Core Types

**Location:** `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/workflows/types.ts`

```typescript
// Workflow Entity
interface Workflow {
  id: string // format: WF-YYYYMMDD-XXXX
  type: 'quick' | 'full' | 'queue'
  projectId: string
  githubIssue: {
    number: number
    url: string
    owner: string
    repo: string
  }

  // Submission data
  title: string
  description: string
  intent: IntentAnalysis

  // Phase management
  currentPhase: WorkflowPhase
  phaseHistory: PhaseTransition[]
  status: WorkflowStatus
  progress: number // 0-100

  // Agent management
  primaryAgent?: string
  agentSessions: AgentSession[]

  // Approval gates
  requiresApproval: boolean
  approvalStatus: ApprovalStatus

  // Artifacts
  artifacts: Artifact[]
  specPath?: string
  planPath?: string

  // Result
  result?: 'success' | 'partial' | 'failed'
  error?: string
  completedAt?: string
  duration?: number

  // Metadata
  submittedBy: string
  createdAt: string
  updatedAt: string
}

// Intent Analysis
interface IntentAnalysis {
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  confidence: number // 0-100
  suggestedAgent: string
  suggestedWorkflow: 'quick' | 'full' | 'queue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  labels: string[]
  estimatedComplexity: 'simple' | 'medium' | 'complex'
  estimatedTime?: string
  reasoning?: string
}

// Workflow Phases
type WorkflowPhase =
  | 'initiation'
  | 'requirements'
  | 'architecture'
  | 'planning'
  | 'execution'
  | 'verification'
  | 'review'
  | 'approval'
  | 'deployment'
  | 'monitoring'

// Workflow Status
type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'waiting-approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed'
  | 'cancelled'

// Phase Transition
interface PhaseTransition {
  from: WorkflowPhase
  to: WorkflowPhase
  triggeredBy: 'agent' | 'user' | 'system'
  triggeredAt: string
  reason?: string
}

// Approval Status
interface ApprovalStatus {
  currentGate: WorkflowPhase | null
  status: 'not-required' | 'pending' | 'approved' | 'rejected'
  requestedAt?: string
  approvedAt?: string
  rejectedAt?: string
  feedback?: string
}

// Artifact
interface Artifact {
  id: string
  type: 'spec' | 'plan' | 'code' | 'test' | 'document' | 'comment'
  path: string
  url?: string
  phase: WorkflowPhase
  createdBy: string
  createdAt: string
  metadata?: any
}

// Task Entity
interface Task {
  id: string // format: TASK-YYYYMMDD-XXXX
  workflowId?: string
  projectId: string
  githubIssue?: {
    number: number
    url: string
  }
  createdAt: string

  // Task details
  type: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Assignment
  assignedTo: string // Agent
  status: TaskStatus
  progress: number // 0-100

  // Dependencies
  dependsOn: string[]
  blocks: string[]

  // Execution
  startedAt?: string
  completedAt?: string
  duration?: number

  // Result
  result?: TaskResult
  error?: string
  filesModified: string[]
  commits: string[]

  // Verification
  verified: boolean
  testsPassed?: boolean
}

// Task Status
type TaskStatus =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'failed'
  | 'blocked'
  | 'cancelled'

// Task Result
interface TaskResult {
  success: boolean
  summary: string
  artifacts: Artifact[]
  metrics: {
    filesCreated: number
    filesModified: number
    linesAdded: number
    linesDeleted: number
    testsPassed: number
    testsFailed: number
  }
}

// Agent Session
interface AgentSession {
  sessionId: string
  agentType: string
  workflowId?: string
  taskId?: string
  status: AgentSessionStatus
  startedAt: string
  completedAt?: string
  output?: AgentOutput
  error?: string
  fileOwnership?: FileOwnership[]
}

// Agent Session Status
type AgentSessionStatus =
  | 'starting'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'terminated'

// Agent Output
interface AgentOutput {
  summary: string
  artifacts: Artifact[]
  filesModified: string[]
  commits: string[]
  logs: string[]
  metrics: AgentMetrics
}

// Agent Metrics
interface AgentMetrics {
  duration: number
  tokensUsed: number
  filesCreated: number
  filesModified: number
  linesAdded: number
  linesDeleted: number
}

// File Ownership
interface FileOwnership {
  path: string
  ownedBy: string // Agent session ID
  ownedAt: string
  expiresAt: string
  lockType: 'read' | 'write' | 'exclusive'
}

// Checkpoint
interface Checkpoint {
  id: string
  workflowId: string
  label: string
  state: Workflow
  createdAt: string
  createdBy: string
}

// Queue Statistics
interface QueueStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  blocked: number
  failed: number
  avgWaitTime: number
  avgExecutionTime: number
}

// Activity Log Entry
interface ActivityLogEntry {
  id: string
  workflowId: string
  type: 'phase-change' | 'agent-start' | 'agent-complete' | 'approval' | 'error'
  timestamp: string
  message: string
  metadata?: any
}
```

---

### 5. File Assignments and Ownership Boundaries

#### 5.1 Frontend Files

| File Path | Owner | Purpose | Dependencies |
|-----------|-------|---------|--------------|
| `/src/app/workflows/page.tsx` | Frontend Team | Workflow dashboard page | DashboardLayout, workflow components |
| `/src/components/workflows/submit-form.tsx` | Frontend Team | Workflow submission form | shadcn/ui, API routes |
| `/src/components/workflows/workflow-selector.tsx` | Frontend Team | Workflow type selector | shadcn/ui radio group |
| `/src/components/workflows/intent-preview.tsx` | Frontend Team | Intent detection preview | API routes |
| `/src/components/workflows/progress-tracker.tsx` | Frontend Team | Progress visualization | shadcn/ui, WebSocket |
| `/src/components/workflows/task-queue.tsx` | Frontend Team | Task queue management | shadcn/ui, drag-and-drop |
| `/src/components/workflows/approval-gate.tsx` | Frontend Team | Approval gate UI | shadcn/ui dialog |

**Ownership Rules:**
- Only one agent can edit a component file at a time
- Component files must define clear interfaces (props)
- Components must handle loading/error states
- All components must use TypeScript strict mode

#### 5.2 Backend Service Files

| File Path | Owner | Purpose | Dependencies |
|-----------|-------|---------|--------------|
| `/src/lib/workflows/engine.ts` | Backend Team | Core workflow engine | State store, GitHub integrator |
| `/src/lib/workflows/intent-detection.ts` | Backend Team | Intent detection service | Claude API |
| `/src/lib/agents/orchestrator.ts` | Backend Team | Agent orchestration | UltraPilot plugin |
| `/src/lib/github/integrator.ts` | Backend Team | GitHub integration | Existing github-auth.ts |
| `/src/lib/workflows/approval-gates.ts` | Backend Team | Approval gate management | Workflow engine |
| `/src/lib/realtime/websocket-gateway.ts` | Backend Team | Real-time updates | Next.js API routes |
| `/src/lib/state/store.ts` | Backend Team | State management | File system |
| `/src/lib/workflows/types.ts` | Backend Team | Type definitions | None |

**Ownership Rules:**
- Service files must be async/await
- All methods must have error handling
- Services must log important operations
- Services must validate inputs

#### 5.3 API Route Files

| File Path | Owner | Purpose | Method |
|-----------|-------|---------|--------|
| `/src/app/api/workflows/route.ts` | Backend Team | Create/get workflows | GET, POST |
| `/src/app/api/workflows/[id]/route.ts` | Backend Team | Get/update workflow | GET, PUT, DELETE |
| `/src/app/api/workflows/[id]/advance/route.ts` | Backend Team | Advance phase | PUT |
| `/src/app/api/workflows/[id]/pause/route.ts` | Backend Team | Pause workflow | POST |
| `/src/app/api/workflows/[id]/approve/route.ts` | Backend Team | Approve gate | POST |
| `/src/app/api/workflows/[id]/intervene/route.ts` | Backend Team | User intervention | POST |
| `/src/app/api/tasks/route.ts` | Backend Team | Task CRUD | GET, POST |
| `/src/app/api/tasks/[id]/reassign/route.ts` | Backend Team | Reassign task | POST |
| `/src/app/api/tasks/[id]/priority/route.ts` | Backend Team | Update priority | PUT |
| `/src/app/api/intent-detect/route.ts` | Backend Team | Detect intent | POST |
| `/src/app/api/workflows/stream/route.ts` | Backend Team | SSE stream | GET |
| `/src/app/api/workflows/ws/route.ts` | Backend Team | WebSocket | WebSocket |

**Ownership Rules:**
- API routes must validate authentication
- API routes must implement rate limiting
- API routes must return proper HTTP status codes
- API routes must handle errors gracefully

#### 5.4 Shared Files

| File Path | Owner | Purpose | Access |
|-----------|-------|---------|--------|
| `/src/lib/workflows/types.ts` | Backend Team | Type definitions | Read-only for frontend |
| `/src/lib/workflows/constants.ts` | Backend Team | Constants, enums | Read-only for all |
| `/src/lib/workflows/utils.ts` | Backend Team | Utility functions | Read-only for all |

**Ownership Rules:**
- Shared files must be read-only for non-owners
- Changes to shared files require coordination
- Shared files must have clear documentation

---

### 6. Dependencies and Integration Points

#### 6.1 External Dependencies

**Frontend Dependencies:**
```json
{
  "dependencies": {
    // Existing
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@radix-ui/react-dialog": "^1.4.3",
    "lucide-react": "^0.577.0",

    // New - Add to package.json
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "date-fns": "^3.0.0",
    "use-debounce": "^10.0.0",
    "zustand": "^4.5.0"
  }
}
```

**Backend Dependencies:**
```json
{
  "dependencies": {
    // Existing
    "@octokit/auth-app": "^8.2.0",
    "@octokit/rest": "^22.0.1",

    // New - Add to package.json
    "uuid": "^9.0.0",
    "ws": "^8.16.0",
    "chokidar": "^3.5.3"
  }
}
```

**Installation:**
```bash
cd /home/ubuntu/hscheema1979/ultrapilot-dashboard
npm install react-markdown remark-gfm @dnd-kit/core @dnd-kit/sortable date-fns use-debounce zustand uuid ws chokidar
```

#### 6.2 Integration with Existing Code

**Existing Components to Reuse:**
1. `DashboardLayout` - Use for all workflow pages
2. `ProjectSelector` - Use for project selection in submit form
3. `github-auth.ts` - Use for GitHub authentication
4. Existing shadcn/ui components

**Existing API Routes to Extend:**
1. `/api/tasks` - Extend with workflow-specific features
2. `/api/projects` - Use for project lookup

**Existing Pages:**
1. `/projects` - Add workflow tab
2. `/github` - Add workflow integration section

#### 6.3 UltraPilot Plugin Integration

**Integration Points:**
1. **Agent Spawning** - Use UltraPilot agent catalog
2. **State Management** - Use `.ultra/` directory structure
3. **Skill Integration** - Integrate with UltraPilot skills
4. **HUD Integration** - Optional: Show workflow status in HUD

**Agent Invocation:**
```typescript
// Spawn UltraPilot agent
import { spawnAgent } from '@/lib/agents/orchestrator'

const session = await spawnAgent('ultra:architect', {
  taskId: workflow.id,
  type: 'quick-request',
  title: workflow.title,
  description: workflow.description
})
```

---

### 7. Implementation Phases

#### Phase 1: Foundation (Week 1-2)

**Goal:** Set up core infrastructure and data models

**Tasks:**
1. **Data Models** (Backend Team)
   - Create `/src/lib/workflows/types.ts`
   - Define all interfaces and types
   - Create constants and enums

2. **State Management** (Backend Team)
   - Create `/src/lib/state/store.ts`
   - Implement workflow CRUD operations
   - Set up file structure in `.ultra/`
   - Implement atomic writes and checkpoints

3. **GitHub Integration** (Backend Team)
   - Create `/src/lib/github/integrator.ts`
   - Implement issue creation with templates
   - Implement label management
   - Implement comment posting

4. **Intent Detection** (Backend Team)
   - Create `/src/lib/workflows/intent-detection.ts`
   - Implement keyword analysis
   - Integrate Claude API for classification
   - Implement agent suggestion logic

5. **API Routes** (Backend Team)
   - Create `/api/workflows` (GET, POST)
   - Create `/api/workflows/[id]` (GET, PUT, DELETE)
   - Create `/api/intent-detect` (POST)

**Success Criteria:**
- ✅ Can create workflow via API
- ✅ GitHub issue created automatically
- ✅ Intent detection returns sensible results
- ✅ State persisted to `.ultra/workflows/`

**Testing:**
- Unit tests for state management
- Integration tests for GitHub API
- Manual testing of intent detection

---

#### Phase 2: Quick Request Workflow (Week 2-3)

**Goal:** Implement single-agent workflow

**Tasks:**
1. **Workflow Engine** (Backend Team)
   - Create `/src/lib/workflows/engine.ts`
   - Implement `createWorkflow()` method
   - Implement `triggerQuickWorkflow()` method
   - Implement phase tracking

2. **Agent Orchestrator** (Backend Team)
   - Create `/src/lib/agents/orchestrator.ts`
   - Implement `spawnAgent()` method
   - Implement `monitorAgent()` method
   - Handle agent lifecycle

3. **Submit Form** (Frontend Team)
   - Create `/src/components/workflows/submit-form.tsx`
   - Create `/src/components/workflows/workflow-selector.tsx`
   - Create `/src/components/workflows/intent-preview.tsx`
   - Implement form validation

4. **Progress Tracker** (Frontend Team)
   - Create `/src/components/workflows/progress-tracker.tsx`
   - Implement phase pipeline visualization
   - Implement agent activity display

5. **Workflow Dashboard** (Frontend Team)
   - Create `/src/app/workflows/page.tsx`
   - Implement workflow list
   - Implement quick submit button

**Success Criteria:**
- ✅ User can submit quick request in < 2 minutes
- ✅ Agent spawns and executes
- ✅ Progress visible in dashboard
- ✅ GitHub issue updated with progress
- ✅ User notified on completion

**Testing:**
- End-to-end test of quick request
- Agent spawning test
- Progress tracking test

---

#### Phase 3: Full Ultrapilot Workflow (Week 3-4)

**Goal:** Implement multi-phase workflow with approval gates

**Tasks:**
1. **Approval Gates** (Backend Team)
   - Create `/src/lib/workflows/approval-gates.ts`
   - Implement gate detection logic
   - Implement approval/rejection handling
   - Update GitHub with approval requests

2. **Multi-Phase Execution** (Backend Team)
   - Extend `WorkflowEngine` with phase management
   - Implement `advancePhase()` method
   - Implement phase transitions
   - Handle phase failures

3. **UltraPilot Integration** (Backend Team)
   - Implement `triggerFullWorkflow()` method
   - Integrate with UltraPilot skills
   - Hand off to UltraPilot at phase 3
   - Monitor UltraPilot progress

4. **Approval Gate UI** (Frontend Team)
   - Create `/src/components/workflows/approval-gate.tsx`
   - Implement approve/reject buttons
   - Show phase artifacts (spec, plan)
   - Implement feedback form

5. **Phase Progress UI** (Frontend Team)
   - Extend `progress-tracker.tsx` for multi-phase
   - Show all phases with status
   - Implement phase artifact links
   - Show approval history

**Success Criteria:**
- ✅ Full workflow passes through all phases
- ✅ Approval gates trigger correctly
- ✅ User can approve/reject at gates
- ✅ Artifacts accessible from UI
- ✅ UltraPilot handoff works

**Testing:**
- Multi-phase workflow test
- Approval gate test
- UltraPilot integration test

---

#### Phase 4: Task Queue System (Week 4-5)

**Goal:** Implement multi-project task queue

**Tasks:**
1. **Queue Management** (Backend Team)
   - Extend state store for queue
   - Implement priority ordering
   - Implement dependency tracking
   - Implement bulk operations

2. **Queue Orchestrator** (Backend Team)
   - Implement `triggerQueueWorkflow()` method
   - Integrate with ultra:team-lead
   - Handle parallel execution
   - Manage task dependencies

3. **Task Queue API** (Backend Team)
   - Extend `/api/tasks` with queue features
   - Create `/api/tasks/[id]/reassign`
   - Create `/api/tasks/[id]/priority`
   - Implement bulk operations

4. **Task Queue UI** (Frontend Team)
   - Create `/src/components/workflows/task-queue.tsx`
   - Implement drag-and-drop reordering
   - Show task dependencies
   - Implement bulk actions

5. **Queue Dashboard** (Frontend Team)
   - Add queue section to workflow dashboard
   - Show queue statistics
   - Implement queue filters

**Success Criteria:**
- ✅ Tasks can be added to queue
- ✅ Queue processes tasks in priority order
- ✅ Dependencies are respected
- ✅ Parallel execution works
- ✅ User can reorder/reassign tasks

**Testing:**
- Queue submission test
- Priority ordering test
- Dependency resolution test
- Parallel execution test

---

#### Phase 5: Real-time Updates (Week 5)

**Goal:** Implement real-time progress updates

**Tasks:**
1. **WebSocket Gateway** (Backend Team)
   - Create `/src/lib/realtime/websocket-gateway.ts`
   - Implement connection management
   - Implement broadcast logic
   - Handle client subscriptions

2. **SSE Endpoint** (Backend Team)
   - Create `/api/workflows/stream`
   - Implement SSE streaming
   - Handle client disconnections
   - Implement retry logic

3. **WebSocket Endpoint** (Backend Team)
   - Create `/api/workflows/ws`
   - Implement WebSocket server
   - Handle message routing
   - Implement authentication

4. **Real-time UI** (Frontend Team)
   - Implement WebSocket client
   - Implement SSE fallback
   - Update UI in real-time
   - Handle connection errors

**Success Criteria:**
- ✅ Workflow updates appear in real-time
- ✅ Agent progress streams correctly
- ✅ Fallback to SSE works
- ✅ Connection errors handled gracefully

**Testing:**
- WebSocket connection test
- SSE streaming test
- Real-time update test
- Connection failure test

---

#### Phase 6: Polish and Documentation (Week 6)

**Goal:** Finalize features and document system

**Tasks:**
1. **Error Handling** (Backend Team)
   - Implement comprehensive error handling
   - Add error logging
   - Implement retry logic
   - Add user-friendly error messages

2. **Performance** (Backend Team)
   - Optimize database queries
   - Implement caching
   - Compress old states
   - Add rate limiting

3. **UI Polish** (Frontend Team)
   - Add loading states
   - Add error states
   - Improve accessibility
   - Add animations

4. **Testing** (Both Teams)
   - Write unit tests
   - Write integration tests
   - Write E2E tests
   - Performance testing

5. **Documentation** (Both Teams)
   - Write API documentation
   - Write component documentation
   - Write user guide
   - Write deployment guide

**Success Criteria:**
- ✅ All tests passing
- ✅ Error handling comprehensive
- ✅ Performance acceptable
- ✅ Documentation complete

**Testing:**
- Full test suite
- Load testing
- User acceptance testing

---

### 8. Error Handling Across Boundaries

#### 8.1 API Error Responses

**Standard Error Format:**
```typescript
interface APIError {
  error: string
  message: string
  code: string
  details?: any
  timestamp: string
  requestId: string
}
```

**HTTP Status Codes:**
- 400 Bad Request - Invalid input
- 401 Unauthorized - Not authenticated
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 409 Conflict - Resource conflict
- 422 Unprocessable Entity - Validation error
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error
- 503 Service Unavailable - Service down

**Example:**
```typescript
// API route error handling
export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate input
    const validation = validateWorkflowInput(data)
    if (!validation.valid) {
      return NextResponse.json({
        error: 'Validation failed',
        message: validation.error,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
      }, { status: 400 })
    }

    // Process request
    const workflow = await createWorkflow(data)
    return NextResponse.json({ workflow }, { status: 201 })

  } catch (error) {
    console.error('Error creating workflow:', error)

    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    }, { status: 500 })
  }
}
```

#### 8.2 Agent Failure Handling

**Agent Failure Scenarios:**
1. **Agent Spawn Failure** - Agent fails to start
2. **Agent Execution Failure** - Agent crashes during execution
3. **Agent Timeout** - Agent takes too long
4. **Agent Output Parsing Failure** - Agent output is invalid

**Handling Strategy:**
```typescript
class AgentOrchestrator {
  async spawnAgent(agentType: string, context: AgentContext): Promise<AgentSession> {
    try {
      // Attempt to spawn agent
      const session = await this.doSpawnAgent(agentType, context)

      // Set timeout
      const timeout = setTimeout(() => {
        this.handleAgentTimeout(session.sessionId)
      }, AGENT_TIMEOUT)

      // Monitor agent
      this.monitorAgent(session.sessionId)

      return session

    } catch (error) {
      // Log error
      console.error(`Failed to spawn agent ${agentType}:`, error)

      // Update workflow state
      await this.updateWorkflowState(context.taskId, {
        status: 'failed',
        error: `Agent spawn failed: ${error.message}`
      })

      // Notify user
      await this.notifyUser(context.taskId, {
        type: 'agent-failed',
        agent: agentType,
        error: error.message
      })

      throw error
    }
  }

  async handleAgentTimeout(sessionId: string): Promise<void> {
    const session = await this.getAgentSession(sessionId)

    // Terminate agent
    await this.terminateAgent(sessionId)

    // Update workflow
    await this.updateWorkflowState(session.workflowId, {
      status: 'failed',
      error: `Agent ${session.agentType} timed out`
    })

    // Notify user
    await this.notifyUser(session.workflowId, {
      type: 'agent-timeout',
      agent: session.agentType
    })
  }
}
```

#### 8.3 State Rollback on Errors

**Checkpoint Strategy:**
```typescript
class WorkflowEngine {
  async advancePhase(workflowId: string, phase: string): Promise<void> {
    const workflow = await this.getWorkflow(workflowId)

    // Create checkpoint before phase transition
    const checkpoint = await this.createCheckpoint(workflowId, `pre-${phase}`)

    try {
      // Attempt phase transition
      await this.doAdvancePhase(workflow, phase)

    } catch (error) {
      console.error(`Failed to advance to phase ${phase}:`, error)

      // Rollback to checkpoint
      await this.restoreCheckpoint(workflowId, checkpoint.id)

      // Update workflow status
      await this.updateWorkflow(workflowId, {
        status: 'failed',
        error: `Phase transition failed: ${error.message}`,
        currentPhase: workflow.currentPhase // Revert
      })

      // Notify user
      await this.notifyUser(workflowId, {
        type: 'phase-failed',
        phase,
        error: error.message,
        rolledBack: true
      })

      throw error
    }
  }

  async createCheckpoint(workflowId: string, label: string): Promise<Checkpoint> {
    const workflow = await this.getWorkflow(workflowId)

    const checkpoint: Checkpoint = {
      id: generateId(),
      workflowId,
      label,
      state: JSON.parse(JSON.stringify(workflow)), // Deep copy
      createdAt: new Date().toISOString(),
      createdBy: 'system'
    }

    // Save checkpoint
    const checkpointPath = `.ultra/workflows/checkpoints/${checkpoint.id}.json`
    await atomicWrite(checkpointPath, checkpoint)

    return checkpoint
  }
}
```

#### 8.4 User Notification on Failures

**Notification Channels:**
1. **In-App Notification** - Real-time via WebSocket
2. **GitHub Comment** - Posted to issue
3. **Email** - Optional (future)

**Notification Format:**
```typescript
interface UserNotification {
  type: 'agent-failed' | 'phase-failed' | 'approval-required' | 'completed'
  workflowId: string
  title: string
  message: string
  actions?: NotificationAction[]
  timestamp: string
}

interface NotificationAction {
  label: string
  action: string
  href?: string
}

// Example notification
const notification: UserNotification = {
  type: 'agent-failed',
  workflowId: 'WF-20260306-0001',
  title: 'Agent Execution Failed',
  message: 'ultra:architect failed to complete the architecture phase due to an error.',
  actions: [
    { label: 'View Error', action: 'view-error' },
    { label: 'Retry', action: 'retry' },
    { label: 'Cancel', action: 'cancel' }
  ],
  timestamp: new Date().toISOString()
}
```

**Send Notification:**
```typescript
async function notifyUser(workflowId: string, notification: UserNotification): Promise<void> {
  // Send via WebSocket
  websocketGateway.broadcastToWorkflow(workflowId, {
    type: 'notification',
    data: notification
  })

  // Post to GitHub
  if (notification.type === 'agent-failed' || notification.type === 'phase-failed') {
    await githubIntegrator.postComment(workflowId, `
**⚠️ ${notification.title}**

${notification.message}

${notification.actions?.map(a => `- [${a.label}](${a.href})`).join('\n')}

---
*Timestamp: ${notification.timestamp}*
    `)
  }
}
```

---

### 9. Risk Assessment

#### 9.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent spawn failure | Medium | High | Implement retry logic, fallback to manual trigger |
| GitHub API rate limits | Medium | Medium | Implement rate limiting, use caching |
| State corruption | Low | Critical | Use atomic writes, implement checksums |
| WebSocket connection drops | High | Low | Implement reconnection logic, SSE fallback |
| Intent detection inaccuracy | Medium | Medium | Allow user override, train on feedback |
| Parallel agent conflicts | Medium | High | Implement file ownership locks |
| Performance degradation | Low | Medium | Implement caching, compress old states |

#### 9.2 Integration Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| UltraPilot plugin changes | Medium | High | Use stable plugin API, version locking |
| Claude Code CLI changes | Medium | Medium | Abstract agent spawning, version pinning |
| GitHub API changes | Low | Medium | Use stable endpoints, monitor deprecations |
| Next.js breaking changes | Low | Low | Pin Next.js version, test upgrades |

#### 9.3 Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Long-running workflows | High | Medium | Implement pause/resume, timeout handling |
| Zombie agent processes | Medium | Medium | Implement process monitoring, cleanup |
| Disk space exhaustion | Low | High | Implement state compression, cleanup old states |
| Concurrent workflow limits | Medium | Low | Implement queue system, throttling |

---

### 10. Success Criteria and Testing Strategy

#### 10.1 Component Success Criteria

**Frontend Components:**
- ✅ Form submits in < 2 seconds
- ✅ Intent detection updates in < 1 second
- ✅ Progress updates appear in < 2 seconds
- ✅ UI renders without console errors
- ✅ All components are accessible (WCAG AA)
- ✅ Components work on mobile (responsive)

**Backend Services:**
- ✅ Workflow creation succeeds in < 3 seconds
- ✅ Agent spawn succeeds in < 5 seconds
- ✅ GitHub issue created in < 2 seconds
- ✅ State persists correctly
- ✅ Checkpoints restore correctly
- ✅ Error handling covers all scenarios

**API Endpoints:**
- ✅ All endpoints return < 500ms (p95)
- ✅ Rate limiting enforced
- ✅ Authentication required
- ✅ Error responses follow standard format
- ✅ OpenAPI documentation complete

#### 10.2 Integration Testing Strategy

**Unit Tests:**
- State management operations
- Intent detection logic
- Agent orchestration
- GitHub integration
- Approval gate logic

**Integration Tests:**
- Quick request workflow
- Full Ultrapilot workflow
- Task queue processing
- Real-time updates
- Error scenarios

**End-to-End Tests:**
- Submit quick request → Agent executes → Complete
- Submit full workflow → All phases → Approval gates → Complete
- Submit tasks to queue → Parallel execution → Complete
- Pause/resume workflow
- Cancel workflow with cleanup

**Performance Tests:**
- 100 concurrent workflows
- 1000 tasks in queue
- 10 parallel agents
- State size after 1000 workflows

**User Acceptance Tests:**
- Submit feature request in < 2 minutes
- Approve/reject at gates
- Reorder queue
- View progress in real-time
- Access artifacts

#### 10.3 Acceptance Tests

**Quick Request Workflow:**
```typescript
describe('Quick Request Workflow', () => {
  it('should submit and complete in < 30 minutes', async () => {
    // Submit workflow
    const response = await submitQuickRequest({
      title: 'Add user profile',
      description: 'Implement user profile page',
      type: 'feature-request',
      priority: 'medium'
    })

    expect(response.workflow).toBeDefined()
    expect(response.githubIssue.number).toBeDefined()

    // Wait for completion (max 30 minutes)
    const workflow = await waitForWorkflowCompletion(response.workflow.id, 30 * 60 * 1000)

    expect(workflow.status).toBe('completed')
    expect(workflow.result).toBe('success')
  })
})
```

**Full Ultrapilot Workflow:**
```typescript
describe('Full Ultrapilot Workflow', () => {
  it('should pass through all phases with approval gates', async () => {
    const workflow = await submitFullWorkflow({
      title: 'Implement OAuth authentication',
      description: 'Add OAuth login with Google and GitHub',
      type: 'feature-request',
      priority: 'high'
    })

    // Phase 0: Requirements
    await waitForPhase(workflow.id, 'requirements')
    await approveGate(workflow.id, 'requirements')

    // Phase 1: Architecture
    await waitForPhase(workflow.id, 'architecture')
    await approveGate(workflow.id, 'architecture')

    // Phase 2: Planning
    await waitForPhase(workflow.id, 'planning')
    await approveGate(workflow.id, 'planning')

    // Phase 3-6: Execution to Deployment
    await waitForWorkflowCompletion(workflow.id, 24 * 60 * 60 * 1000) // 24 hours

    const finalWorkflow = await getWorkflow(workflow.id)
    expect(finalWorkflow.status).toBe('completed')
    expect(finalWorkflow.artifacts.length).toBeGreaterThan(0)
  })
})
```

**Task Queue:**
```typescript
describe('Task Queue', () => {
  it('should process tasks in priority order', async () => {
    // Submit tasks with different priorities
    await submitTask({ title: 'Low priority', priority: 'low' })
    await submitTask({ title: 'High priority', priority: 'high' })
    await submitTask({ title: 'Medium priority', priority: 'medium' })

    // Wait for processing
    await waitForQueueProcessing()

    // Verify execution order
    const executions = await getTaskExecutions()
    expect(executions[0].priority).toBe('high')
    expect(executions[1].priority).toBe('medium')
    expect(executions[2].priority).toBe('low')
  })

  it('should handle dependencies correctly', async () => {
    // Task A -> Task B -> Task C
    const taskA = await submitTask({ title: 'A', dependsOn: [] })
    const taskB = await submitTask({ title: 'B', dependsOn: [taskA.id] })
    const taskC = await submitTask({ title: 'C', dependsOn: [taskB.id] })

    await waitForQueueProcessing()

    // Verify execution order
    const executions = await getTaskExecutions()
    expect(executions.map(t => t.title)).toEqual(['A', 'B', 'C'])
  })
})
```

---

### 11. Deployment Strategy

#### 11.1 Environment Setup

**Development:**
```bash
# .env.local
NODE_ENV=development
GITHUB_APP_ID=123456
GITHUB_APP_INSTALLATION_ID=789012
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/key.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=ultra-workspace
```

**Production:**
```bash
# .env.production
NODE_ENV=production
GITHUB_APP_ID=${PROD_APP_ID}
GITHUB_APP_INSTALLATION_ID=${PROD_INSTALLATION_ID}
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/prod-key.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=production-repo
```

#### 11.2 Deployment Steps

1. **Pre-deployment:**
   - Run all tests
   - Build production bundle
   - Backup current state
   - Create migration checkpoint

2. **Deployment:**
   - Deploy new code
   - Run database migrations (if any)
   - Restart services
   - Verify health checks

3. **Post-deployment:**
   - Monitor error logs
   - Verify API endpoints
   - Test workflow submission
   - Monitor agent spawning

#### 11.3 Rollback Strategy

**If deployment fails:**
1. Restore previous code
2. Restore state from checkpoint
3. Restart services
4. Verify health checks
5. Monitor for issues

---

### 12. Monitoring and Observability

#### 12.1 Metrics to Track

**Workflow Metrics:**
- Total workflows created
- Active workflows
- Completed workflows
- Failed workflows
- Average workflow duration
- Workflow duration by type

**Agent Metrics:**
- Agents spawned
- Active agents
- Agent success rate
- Agent average duration
- Agent failure reasons

**Queue Metrics:**
- Queue depth
- Average wait time
- Average execution time
- Throughput (tasks/hour)

**API Metrics:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Rate limit violations

#### 12.2 Logging Strategy

**Log Levels:**
- DEBUG - Detailed diagnostic info
- INFO - General informational messages
- WARN - Warning messages
- ERROR - Error messages
- CRITICAL - Critical failures

**Log Format:**
```json
{
  "timestamp": "2026-03-06T12:00:00Z",
  "level": "INFO",
  "service": "workflow-engine",
  "workflowId": "WF-20260306-0001",
  "message": "Workflow created",
  "metadata": {
    "type": "quick",
    "priority": "medium"
  }
}
```

#### 12.3 Alerts

**Alert Conditions:**
- Workflow failure rate > 10%
- Agent spawn failure rate > 5%
- API error rate > 5%
- Queue depth > 100
- Agent duration > 1 hour
- Disk space < 10%

---

### 13. File Structure Summary

```
/home/ubuntu/hscheema1979/ultrapilot-dashboard/
├── src/
│   ├── app/
│   │   ├── workflows/
│   │   │   └── page.tsx                          # Workflow dashboard
│   │   └── api/
│   │       ├── workflows/
│   │       │   ├── route.ts                      # GET, POST /api/workflows
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts                  # GET, PUT, DELETE /api/workflows/:id
│   │       │   │   ├── advance/route.ts          # PUT /api/workflows/:id/advance
│   │       │   │   ├── pause/route.ts            # POST /api/workflows/:id/pause
│   │       │   │   ├── approve/route.ts          # POST /api/workflows/:id/approve
│   │       │   │   └── intervene/route.ts        # POST /api/workflows/:id/intervene
│   │       │   ├── stream/route.ts               # GET /api/workflows/stream (SSE)
│   │       │   └── ws/route.ts                   # WebSocket /api/workflows/ws
│   │       ├── tasks/
│   │       │   ├── route.ts                      # GET, POST /api/tasks (extend existing)
│   │       │   └── [id]/
│   │       │       ├── reassign/route.ts         # POST /api/tasks/:id/reassign
│   │       │       └── priority/route.ts         # PUT /api/tasks/:id/priority
│   │       └── intent-detect/
│   │           └── route.ts                      # POST /api/intent-detect
│   ├── components/
│   │   └── workflows/
│   │       ├── submit-form.tsx                   # Workflow submission form
│   │       ├── workflow-selector.tsx             # Workflow type selector
│   │       ├── intent-preview.tsx                # Intent detection preview
│   │       ├── progress-tracker.tsx              # Progress visualization
│   │       ├── task-queue.tsx                    # Task queue management
│   │       └── approval-gate.tsx                 # Approval gate UI
│   └── lib/
│       ├── workflows/
│       │   ├── types.ts                          # Type definitions
│       │   ├── constants.ts                      # Constants and enums
│       │   ├── engine.ts                         # Workflow engine
│       │   ├── intent-detection.ts               # Intent detection service
│       │   └── approval-gates.ts                 # Approval gate management
│       ├── agents/
│       │   └── orchestrator.ts                   # Agent orchestration
│       ├── github/
│       │   └── integrator.ts                     # GitHub integration
│       ├── realtime/
│       │   └── websocket-gateway.ts              # Real-time updates
│       └── state/
│           └── store.ts                          # State management
└── .ultra/
    ├── workflows/
    │   ├── active/
    │   ├── completed/
    │   └── checkpoints/
    ├── queue/
    ├── artifacts/
    │   ├── specs/
    │   ├── plans/
    │   └── code/
    └── agents/
        ├── sessions/
        └── outputs/
```

---

## Summary

This implementation plan provides a comprehensive roadmap for building the Workflow Automation System. The plan is structured in phases, starting with foundation infrastructure and progressively adding features.

**Key Highlights:**
- Clear file ownership boundaries to prevent conflicts
- Detailed I/O contracts for all components
- Comprehensive error handling strategy
- Real-time updates via WebSocket/SSE
- Three workflow types: Quick, Full Ultrapilot, and Queue
- Approval gates for user control
- Integration with existing GitHub App
- UltraPilot plugin integration for agent spawning

**Next Steps:**
1. Review and approve this plan
2. Set up development environment
3. Begin Phase 1: Foundation
4. Establish regular progress reviews
5. Adjust plan as needed based on learnings

---

**Document Status:** Draft v1
**Next Review:** After Phase 1 completion
**Created By:** ultra:planner
**Date:** 2026-03-06
