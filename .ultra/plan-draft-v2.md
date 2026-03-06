# Implementation Plan - Workflow Automation System

**Project:** GitHub Mission Control Dashboard - Workflow Automation
**Date:** 2026-03-06
**Status:** Phase 1 - Planning (Draft v2)
**Version:** 2.0
**Cycle:** 2 of 3

**Changes from v1:**
- ✅ Added Phase 0: Codebase Audit (8h)
- ✅ Added Phase 0.5: Coordination & Coherency Layer (28h)
- ✅ Added security framework (auth, input validation, command validation)
- ✅ Added agent execution layer foundation
- ✅ Added integration fixes (state consistency, file I/O, rate limiting, idempotency)
- ✅ Added UX improvements (WebSocket, loading states, form validation)
- ✅ Added comprehensive testing phase (40h)
- ✅ Added deployment & operations phase (32h)
- ✅ Updated timeline: 90 tasks, 10-12 weeks (was 56 tasks, 6-8 weeks)
- ✅ Addressed all 10 critical issues from review
- ✅ Addressed all 9 high-priority issues from review

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
- ✅ All security vulnerabilities addressed
- ✅ Distributed coordination prevents race conditions
- ✅ State consistency guaranteed
- ✅ Comprehensive test coverage (>80%)
- ✅ Production-ready deployment with monitoring

---

## Phase 0: Codebase Audit (8 hours)

**Goal:** Understand existing implementation and align plan with reality

### Task 0.0: Codebase Audit & Integration Planning (8 hours)

**Owner:** Backend Team
**Inputs:** Existing codebase (/plc, /agents, /github pages), current architecture
**Outputs:** Audit report, integration plan, reusable components inventory, conflicts list
**Dependencies:** None
**Risk:** Low

**Description:**
Review all existing pages and components to understand what's already built:
- `/src/app/plc/page.tsx` - PLC Manager (already exists)
- `/src/app/agents/page.tsx` - Agents Monitor (already exists)
- `/src/app/github/page.tsx` - GitHub Integration (already exists)
- `/src/app/api/github/status/route.ts` - GitHub status API (already exists)

Identify:
- Reusable components (navigation, layout, UI components)
- Existing state management patterns
- API endpoints that can be extended
- Potential conflicts with new features
- Integration points with GitHub App

**Steps:**
1. Read all existing page files
2. Read all existing API routes
3. Identify component library usage (shadcn/ui components already installed)
4. Identify existing state management (JSON files in `.ultra/state/`)
5. Identify existing GitHub API integration patterns
6. Document reusable components
7. Document integration points
8. Identify conflicts and mitigation strategies

**I/O Contract:**
```typescript
// Input
interface CodebaseAuditInput {
  existingPages: string[]
  existingApis: string[]
  componentLibrary: string
}

// Output
interface CodebaseAuditReport {
  reusableComponents: ComponentInventory[]
  integrationPoints: IntegrationPoint[]
  conflicts: Conflict[]
  recommendations: Recommendation[]
}

interface ComponentInventory {
  name: string
  location: string
  usage: string
  canReuse: boolean
}

interface IntegrationPoint {
  type: 'api' | 'component' | 'state'
  location: string
  description: string
}

interface Conflict {
  type: 'naming' | 'routing' | 'state'
  severity: 'low' | 'medium' | 'high'
  description: string
  mitigation: string
}
```

**Success Criteria:**
- ✅ Audit report created
- ✅ Reusable components identified
- ✅ Integration points documented
- ✅ Conflicts identified with mitigation strategies
- ✅ Integration plan created

**Error Handling:**
- If existing code is incompatible → Plan refactoring tasks
- If conflicts cannot be resolved → Escalate to architect

---

## Phase 0.5: Coordination & Coherency Layer (28 hours)

**Goal:** Implement distributed coordination to prevent race conditions and ensure state consistency

### Task 0.1: Distributed Coordination Layer (8 hours)

**Owner:** Backend Team
**Inputs:** Phase 0 audit report
**Outputs:** DistributedLockManager, TaskClaimProtocol, AgentRegistry, HeartbeatManager
**Dependencies:** Task 0.0 (Codebase Audit)
**Risk:** High (distributed systems complexity)

**Description:**
Implement coordination primitives for multiple agents working concurrently:
- **DistributedLockManager** - File-based locks for critical sections
- **TaskClaimProtocol** - Agents claim tasks to prevent duplicate work
- **AgentRegistry** - Track active agents and their assignments
- **HeartbeatManager** - Monitor agent health and detect failures

**Steps:**
1. Design lock file format (JSON with PID, timestamp, agent ID)
2. Implement `DistributedLockManager.acquire(lockKey, timeout)`
3. Implement `DistributedLockManager.release(lockKey)`
4. Implement `TaskClaimProtocol.claimTask(taskId, agentId)`
5. Implement `TaskClaimProtocol.releaseTask(taskId, agentId)`
6. Implement `AgentRegistry.register(agentId, capabilities)`
7. Implement `AgentRegistry.unregister(agentId)`
8. Implement `AgentRegistry.getActiveAgents()`
9. Implement `HeartbeatManager.register(agentId, interval)`
10. Implement `HeartbeatManager.check(agentId)` → alive/stale/failed

**I/O Contract:**
```typescript
// DistributedLockManager
class DistributedLockManager {
  async acquire(lockKey: string, timeout: number): Promise<Lock | null>
  async release(lockKey: string): Promise<void>
  async isLocked(lockKey: string): Promise<boolean>
}

interface Lock {
  key: string
  holder: string
  acquiredAt: Date
  expiresAt: Date
}

// TaskClaimProtocol
class TaskClaimProtocol {
  async claimTask(taskId: string, agentId: string): Promise<boolean>
  async releaseTask(taskId: string, agentId: string): Promise<void>
  async getClaimant(taskId: string): Promise<string | null>
}

// AgentRegistry
class AgentRegistry {
  async register(agentId: string, capabilities: string[]): Promise<void>
  async unregister(agentId: string): Promise<void>
  async getActiveAgents(): Promise<AgentInfo[]>
  async getAgent(agentId: string): Promise<AgentInfo | null>
}

interface AgentInfo {
  id: string
  capabilities: string[]
  status: 'active' | 'idle' | 'failed'
  currentTask?: string
  lastHeartbeat: Date
}

// HeartbeatManager
class HeartbeatManager {
  async register(agentId: string, interval: number): Promise<void>
  async heartbeat(agentId: string): Promise<void>
  async check(agentId: string): Promise<'alive' | 'stale' | 'failed'>
}
```

**Files:**
- `/src/lib/coordination/distributed-lock-manager.ts`
- `/src/lib/coordination/task-claim-protocol.ts`
- `/src/lib/coordination/agent-registry.ts`
- `/src/lib/coordination/heartbeat-manager.ts`

**Success Criteria:**
- ✅ Locks prevent concurrent access to shared resources
- ✅ Task claims prevent duplicate work
- ✅ Agent registry tracks all active agents
- ✅ Heartbeat manager detects failed agents

**Error Handling:**
- Lock acquisition timeout → Return null, caller retries
- Task already claimed → Return false, caller finds another task
- Agent heartbeat stale → Mark as failed, release tasks

---

### Task 0.2: Event Sequencer (6 hours)

**Owner:** Backend Team
**Inputs:** Phase 0 audit report, GitHub webhook events
**Outputs:** EventSequencer, ordered event queue
**Dependencies:** Task 0.0 (Codebase Audit)
**Risk:** Medium (event ordering complexity)

**Description:**
Implement event ordering for GitHub webhooks that can arrive out of order:
- **Sequence number generation** - Monotonically increasing sequence numbers
- **Out-of-order detection** - Detect events arriving out of order
- **Event replay buffer** - Buffer events for replay after missing events
- **Ordered delivery** - Deliver events to handlers in sequence order

**Steps:**
1. Design sequence number storage (SQLite table)
2. Implement `EventSequencer.nextSequenceNumber()` → increments counter
3. Implement `EventSequencer.recordEvent(eventId, sequenceNumber)`
4. Implement `EventSequencer.processEvent(event)` → buffers if out of order
5. Implement `EventSequencer.getMissingSequences()` → detect gaps
6. Implement `EventSequencer.waitForSequence(sequenceNumber)` → block until ready
7. Implement event replay buffer (in-memory, 1000 events max)

**I/O Contract:**
```typescript
class EventSequencer {
  async nextSequenceNumber(): Promise<number>
  async recordEvent(eventId: string, sequenceNumber: number): Promise<void>
  async processEvent(event: GitHubEvent): Promise<void>
  async getMissingSequences(): Promise<number[]>
  async waitForSequence(sequenceNumber: number): Promise<void>
  async getBufferedEvents(): Promise<GitHubEvent[]>
}

interface GitHubEvent {
  id: string
  type: string
  sequenceNumber?: number
  payload: any
  receivedAt: Date
}
```

**Files:**
- `/src/lib/coordination/event-sequencer.ts`
- `/src/lib/db/event-sequence.ts` (SQLite table schema)

**Success Criteria:**
- ✅ Events are processed in sequence order
- ✅ Out-of-order events are buffered until predecessors arrive
- ✅ Missing sequences are detected
- ✅ Buffer prevents memory overflow

**Error Handling:**
- Event too old ( > 1 hour ) → Log warning, process anyway
- Buffer full → Log error, drop oldest event
- Sequence gap timeout (5 min) → Process next event, log warning

---

### Task 0.3: Cache Coherency Manager (8 hours)

**Owner:** Backend Team
**Inputs:** Phase 0 audit report, cache requirements
**Outputs:** CacheCoherencyManager, cache invalidation protocol
**Dependencies:** Task 0.0 (Codebase Audit)
**Risk:** Medium (cache consistency complexity)

**Description:**
Implement cache coherency protocol to prevent stale data:
- **Cache invalidation strategy** - Invalidate cache on state changes
- **TTL policy** - Define TTL for different cache types
- **Write-through vs write-back** - Choose strategy for each cache
- **Cache coherence protocol** - Ensure all cache nodes are consistent

**Steps:**
1. Define cache key schema (e.g., `workflow:{id}`, `task:{id}`)
2. Define TTL policies:
   - Workflow state: 60s
   - Agent status: 30s
   - GitHub issue data: 300s
3. Implement `CacheCoherencyManager.invalidate(key)`
4. Implement `CacheCoherencyManager.invalidatePattern(pattern)` (wildcard)
5. Implement `CacheCoherencyManager.get(key, options)` → handle miss
6. Implement `CacheCoherencyManager.set(key, value, options)` → write-through
7. Implement cache coherence protocol:
   - On state change → invalidate cache
   - On GitHub webhook → invalidate relevant cache
   - On agent heartbeat → update agent status cache

**I/O Contract:**
```typescript
class CacheCoherencyManager {
  async get<T>(key: string, options?: CacheOptions): Promise<T | null>
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void>
  async invalidate(key: string): Promise<void>
  async invalidatePattern(pattern: string): Promise<void>
  async clear(): Promise<void>
}

interface CacheOptions {
  ttl?: number  // seconds
  writeThrough?: boolean  // write to backing store
}

// Cache key patterns
const CacheKeys = {
  workflow: (id: string) => `workflow:${id}`,
  task: (id: string) => `task:${id}`,
  agentStatus: (id: string) => `agent:${id}:status`,
  githubIssue: (number: number) => `github:issue:${number}`,
  projectWorkflows: (projectId: string) => `project:${projectId}:workflows`,
}
```

**Files:**
- `/src/lib/cache/cache-coherency-manager.ts`
- `/src/lib/cache/cache-keys.ts`
- `/src/lib/cache/ttl-policies.ts`

**Success Criteria:**
- ✅ Cache invalidation prevents stale data
- ✅ TTL policies optimize cache hit rates
- ✅ Write-through ensures backing store updated
- ✅ Pattern invalidation supports bulk operations

**Error Handling:**
- Cache miss → Fetch from backing store, populate cache
- Cache write failure → Log error, continue (backing store is source of truth)
- Invalid TTL → Default to 60s

---

### Task 0.4: State Reconciler (6 hours)

**Owner:** Backend Team
**Inputs:** Multiple state sources (GitHub issues, in-memory state, cache)
**Outputs:** StateReconciler, conflict resolution strategy
**Dependencies:** Tasks 0.1-0.3 (Coordination layer)
**Risk:** High (state consistency is critical)

**Description:**
Implement state reconciliation to handle conflicts and ensure consistency:
- **State consistency checks** - Detect inconsistencies between state sources
- **Conflict resolution** - Resolve conflicts when multiple agents update state
- **Automatic recovery** - Recover from inconsistent state
- **Manual intervention interface** - UI for manual conflict resolution

**Steps:**
1. Define state sources (GitHub issue = source of truth, in-memory = cache, cache = derived)
2. Implement `StateReconciler.checkConsistency(workflowId)` → detect inconsistencies
3. Implement `StateReconciler.reconcile(workflowId)` → resolve conflicts
4. Implement conflict resolution strategies:
   - Last-write-wins (timestamp based)
   - GitHub issue wins (source of truth)
   - Manual resolution (create conflict ticket)
5. Implement automatic recovery:
   - Fetch from GitHub issue
   - Update in-memory state
   - Invalidate cache
6. Implement manual intervention interface:
   - Detect unresolvable conflicts
   - Create GitHub issue with conflict details
   - Provide UI for manual resolution

**I/O Contract:**
```typescript
class StateReconciler {
  async checkConsistency(workflowId: string): Promise<ConsistencyCheck>
  async reconcile(workflowId: string): Promise<ReconciliationResult>
  async autoRecover(workflowId: string): Promise<void>
  async createConflictTicket(workflowId: string, conflict: Conflict): Promise<void>
}

interface ConsistencyCheck {
  consistent: boolean
  conflicts: Conflict[]
}

interface Conflict {
  type: 'phase' | 'status' | 'agent' | 'data'
  sources: {
    github: any
    memory: any
    cache: any
  }
  severity: 'low' | 'medium' | 'high'
  resolvable: boolean
}

interface ReconciliationResult {
  resolved: boolean
  strategy: 'last-write-wins' | 'github-wins' | 'manual'
  actions: string[]
}
```

**Files:**
- `/src/lib/state/state-reconciler.ts`
- `/src/lib/state/conflict-resolution.ts`

**Success Criteria:**
- ✅ Consistency checks detect all conflicts
- ✅ Reconciliation resolves most conflicts automatically
- ✅ Unresolvable conflicts create tickets for manual resolution
- ✅ Automatic recovery restores consistent state

**Error Handling:**
- GitHub API error → Retry with exponential backoff
- Conflict unresolvable → Create ticket, notify user
- Recovery failed → Escalate to human operator

---

## Phase 1: Frontend Components (174 hours)

### Task 1.0: Frontend Component Architecture Setup (12 hours)

**Owner:** Frontend Team
**Inputs:** Phase 0 audit report
**Outputs:** Component structure, routing, layout
**Dependencies:** Task 0.0 (Codebase Audit)
**Risk:** Low

**Description:**
Set up the frontend component architecture for workflow submission and progress visualization.

**Steps:**
1. Create `/src/app/workflows/` directory structure
2. Create `/src/components/workflows/` directory
3. Add routes:
   - `/workflows/submit` - Submit new workflow
   - `/workflows/[id]` - Workflow details
   - `/workflows/[id]/progress` - Progress visualization
4. Update navigation to include workflows
5. Set up layout with sidebar navigation

**Files:**
- `/src/app/workflows/layout.tsx`
- `/src/app/workflows/submit/page.tsx`
- `/src/app/workflows/[id]/page.tsx`
- `/src/app/workflows/[id]/progress/page.tsx`
- `/src/components/layout/workflow-navigation.tsx`

**Success Criteria:**
- ✅ Routes created and accessible
- ✅ Navigation includes workflows
- ✅ Layout consistent with existing pages

---

### Task 1.1: Workflow Submit Form (20 hours)

**Owner:** Frontend Team
**Inputs:** User workflow requirements
**Outputs:** WorkflowSubmitForm component
**Dependencies:** Task 1.0 (Component Architecture)
**Risk:** Medium (form validation, UX)

**Description:**
Create a form for submitting workflows with:
- Title input (required)
- Description textarea (rich text, required)
- Type selector (Feature/Bug/Review, required)
- Priority selector (Low/Medium/High/Critical, required)
- Project selector (autocomplete from GitHub projects)
- Workflow type toggle: Quick | Full Ultrapilot | Queue
- Attachments support (drag & drop)
- Intent detection preview (shows detected intent)
- Client-side validation (using Zod schemas)
- Submit button with loading state
- Error display

**Steps:**
1. Create Zod validation schema:
   ```typescript
   const WorkflowSubmitSchema = z.object({
     title: z.string().min(10).max(200),
     description: z.string().min(50),
     type: z.enum(['feature-request', 'bug-report', 'code-review']),
     priority: z.enum(['low', 'medium', 'high', 'critical']),
     projectId: z.string().optional(),
     workflowType: z.enum(['quick', 'full', 'queue']),
     attachments: z.array(z.string()).optional(),
   })
   ```
2. Create form component with react-hook-form
3. Add client-side validation with error display
4. Add loading state during submission
5. Add success/error toast notifications
6. Add intent detection preview (calls `/api/workflows/detect-intent`)
7. Add attachment upload (drag & drop, file input)
8. Test all validation paths
9. Test submission success/error cases

**I/O Contract:**
```typescript
// Component Props
interface WorkflowSubmitFormProps {
  onSubmit: (data: WorkflowSubmitData) => Promise<void>
  initialData?: Partial<WorkflowSubmitData>
}

// Form Data
interface WorkflowSubmitData {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'code-review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  projectId?: string
  workflowType: 'quick' | 'full' | 'queue'
  attachments?: string[]
}

// API Response
interface IntentDetectionResponse {
  intent: 'feature-request' | 'bug-report' | 'code-review' | 'question'
  confidence: number
  suggestedWorkflowType: 'quick' | 'full' | 'queue'
  reasoning: string
}
```

**Files:**
- `/src/components/workflows/submit-form.tsx`
- `/src/lib/validation/workflow-submit.ts` (Zod schema)
- `/src/app/api/workflows/detect-intent/route.ts`

**Success Criteria:**
- ✅ Form validates all fields
- ✅ Client-side validation prevents invalid submission
- ✅ Intent detection shows suggested workflow type
- ✅ Loading states display during submission
- ✅ Errors display clearly
- ✅ Attachment upload works

**Error Handling:**
- Validation error → Display field-level error messages
- Submission error → Display toast with error message
- Intent detection error → Hide preview, show warning

---

### Task 1.2: Workflow Progress Visualization (24 hours)

**Owner:** Frontend Team
**Inputs:** Workflow state, phase history
**Outputs:** WorkflowProgress component
**Dependencies:** Task 1.0 (Component Architecture)
**Risk:** Medium (complex visualization, real-time updates)

**Description:**
Create a progress visualization showing:
- Phase pipeline (10 phases with icons)
- Current phase highlighted
- Completed phases (✓)
- Pending phases (○)
- Current activity (agent, phase, progress %)
- Phase duration
- ETA to completion
- Control hooks (buttons for user interaction)

**Steps:**
1. Create phase pipeline component:
   ```tsx
   <PhasePipeline>
     <Phase icon={Zap} name="Initiation" status="completed" />
     <Phase icon={Search} name="Requirements" status="completed" />
     <Phase icon={Architecture} name="Architecture" status="current" />
     <Phase icon={Calendar} name="Planning" status="pending" />
     ...
   </PhasePipeline>
   ```
2. Create current activity component:
   - Agent name and avatar
   - Current phase name
   - Progress bar (%)
   - Tasks completed (N/M)
   - Time active
   - ETA
3. Create control hooks component:
   - Pause button (if running)
   - Resume button (if paused)
   - Intervene button (opens dialog)
   - Approve button (if approval required)
   - Reject button (if approval required)
4. Add real-time updates via WebSocket
5. Add skeleton loading state
6. Add error state

**I/O Contract:**
```typescript
// Component Props
interface WorkflowProgressProps {
  workflowId: string
  onControlAction: (action: ControlAction) => Promise<void>
}

// Workflow State
interface WorkflowState {
  id: string
  currentPhase: Phase
  phaseHistory: PhaseTransition[]
  progress: number
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  primaryAgent?: AgentInfo
  requiresApproval: boolean
  eta?: number
}

interface Phase {
  name: string
  icon: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  startedAt?: string
  completedAt?: string
  duration?: number
}

interface AgentInfo {
  id: string
  name: string
  avatar?: string
  status: 'active' | 'idle' | 'failed'
}

type ControlAction =
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'intervene'; message: string }
  | { type: 'approve' }
  | { type: 'reject'; reason: string }
```

**Files:**
- `/src/components/workflows/workflow-progress.tsx`
- `/src/components/workflows/phase-pipeline.tsx`
- `/src/components/workflows/current-activity.tsx`
- `/src/components/workflows/control-hooks.tsx`

**Success Criteria:**
- ✅ Phase pipeline shows all phases with correct status
- ✅ Current phase is highlighted
- ✅ Current activity shows agent, phase, progress
- ✅ ETA updates in real-time
- ✅ Control hooks work correctly
- ✅ Real-time updates via WebSocket
- ✅ Loading states display

**Error Handling:**
- WebSocket disconnected → Show warning, retry connection
- State update failed → Show toast, retry fetch
- Control action failed → Show toast with error

---

### Task 1.3: Task Queue Manager (20 hours)

**Owner:** Frontend Team
**Inputs:** Task queue state
**Outputs:** TaskQueue component
**Dependencies:** Task 1.0 (Component Architecture)
**Risk:** Medium (drag & drop, real-time updates)

**Description:**
Create a task queue manager showing:
- Queue list with priority indicators
- Task details (title, assignee, status, progress)
- Controls: Reorder, Reassign, Pause, Cancel
- Bulk operations (select multiple, change priority)
- Filter by status, assignee, priority

**Steps:**
1. Create task queue list component:
   ```tsx
   <TaskQueue>
     <TaskItem priority="high" status="pending">
       <TaskTitle>Implement REST API</TaskTitle>
       <TaskAssignee>ultra:architect</TaskAssignee>
       <TaskProgress>0%</TaskProgress>
     </TaskItem>
     ...
   </TaskQueue>
   ```
2. Add drag & drop reordering (using @dnd-kit)
3. Add task detail modal (shows full task info)
4. Add control buttons:
   - Reassign (opens agent selector)
   - Pause (sets status to paused)
   - Cancel (sets status to cancelled)
5. Add bulk operations:
   - Select multiple tasks (checkboxes)
   - Bulk reassign
   - Bulk change priority
   - Bulk cancel
6. Add filters:
   - Filter by status (pending/in-progress/completed/failed)
   - Filter by assignee
   - Filter by priority
7. Add real-time updates via WebSocket

**I/O Contract:**
```typescript
// Component Props
interface TaskQueueProps {
  queue: Task[]
  onReorder: (taskId: string, newPosition: number) => Promise<void>
  onReassign: (taskId: string, agentId: string) => Promise<void>
  onPause: (taskId: string) => Promise<void>
  onCancel: (taskId: string) => Promise<void>
  onBulkAction: (taskIds: string[], action: BulkAction) => Promise<void>
}

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused' | 'cancelled'
  progress: number
  dependsOn: string[]
  estimatedDuration?: number
}

type BulkAction =
  | { type: 'reassign'; agentId: string }
  | { type: 'setPriority'; priority: string }
  | { type: 'cancel' }
```

**Files:**
- `/src/components/workflows/task-queue.tsx`
- `/src/components/workflows/task-item.tsx`
- `/src/components/workflows/task-detail-modal.tsx`
- `/src/components/workflows/bulk-actions.tsx`

**Success Criteria:**
- ✅ Queue displays all tasks with correct priority
- ✅ Drag & drop reordering works
- ✅ Task detail modal shows full info
- ✅ Control buttons work correctly
- ✅ Bulk operations work
- ✅ Filters work
- ✅ Real-time updates via WebSocket

**Error Handling:**
- Reorder failed → Revert to original order, show toast
- Reassign failed → Show toast with error
- Bulk action partial failure → Show results (X succeeded, Y failed)

---

### Task 1.4: Agent Status Dashboard (16 hours)

**Owner:** Frontend Team
**Inputs:** Agent registry data
**Outputs:** AgentStatusDashboard component
**Dependencies:** Task 1.0 (Component Architecture)
**Risk:** Low

**Description:**
Create a dashboard showing:
- Active agents list
- Agent status (active/idle/failed)
- Current assignment
- Performance metrics (tasks completed, avg duration)
- Quick actions (message, view work, pause)

**Steps:**
1. Create agent status list component:
   ```tsx
   <AgentStatusList>
     <AgentCard status="active">
       <AgentName>ultra:architect</AgentName>
       <AgentStatus>● Active</AgentStatus>
       <AgentAssignment>Working on REST API</AgentAssignment>
       <AgentMetrics>
         <Metric>Tasks: 12</Metric>
         <Metric>Avg: 45m</Metric>
       </AgentMetrics>
     </AgentCard>
     ...
   </AgentStatusList>
   ```
2. Add agent detail modal:
   - Current activity
   - All projects
   - Recent activity log
   - Performance metrics (tasks completed, avg duration, success rate)
3. Add quick action buttons:
   - Message (opens chat)
   - View Work (navigates to workflow)
   - Pause (pauses current task)
4. Add filters:
   - Filter by status
   - Filter by capability
5. Add real-time updates via WebSocket

**I/O Contract:**
```typescript
// Component Props
interface AgentStatusDashboardProps {
  agents: AgentInfo[]
  onMessage: (agentId: string) => void
  onViewWork: (agentId: string) => void
  onPause: (agentId: string) => Promise<void>
}

interface AgentInfo {
  id: string
  name: string
  avatar?: string
  status: 'active' | 'idle' | 'failed'
  currentTask?: {
    workflowId: string
    phase: string
    progress: number
  }
  capabilities: string[]
  metrics: {
    tasksCompleted: number
    avgDuration: number
    successRate: number
  }
}
```

**Files:**
- `/src/components/agents/agent-status-dashboard.tsx`
- `/src/components/agents/agent-card.tsx`
- `/src/components/agents/agent-detail-modal.tsx`

**Success Criteria:**
- ✅ Dashboard shows all active agents
- ✅ Agent cards show correct status
- ✅ Detail modal shows full info
- ✅ Quick actions work
- ✅ Real-time updates via WebSocket

**Error Handling:**
- Agent not found → Show 404 state
- Pause failed → Show toast with error

---

### Task 1.5: Authentication & Authorization UI (12 hours)

**Owner:** Frontend Team
**Inputs:** Auth requirements
**Outputs:** Login page, permission checks
**Dependencies:** Task 1.0 (Component Architecture)
**Risk:** Low (using NextAuth.js)

**Description:**
Implement authentication and authorization UI:
- Login page with GitHub OAuth
- Session management
- Permission checks on protected routes
- Role-based UI (admin vs user)

**Steps:**
1. Install NextAuth.js:
   ```bash
   npm install next-auth @auth/core
   ```
2. Configure GitHub OAuth provider:
   ```typescript
   // auth.ts
   export const { handlers, auth } = NextAuth({
     providers: [
       GitHub({
         clientId: process.env.GITHUB_CLIENT_ID,
         clientSecret: process.env.GITHUB_CLIENT_SECRET,
       }),
     ],
   })
   ```
3. Create login page:
   - GitHub login button
   - Error display
4. Add middleware for protected routes:
   ```typescript
   // middleware.ts
   export const middleware = async (req: NextRequest) => {
     const session = await auth()
     if (!session && req.nextUrl.pathname.startsWith('/workflows')) {
       return NextResponse.redirect(new URL('/login', req.url))
     }
   }
   ```
5. Add permission checks:
   - Admin-only routes (/admin/*)
   - User-scoped workflows (can only see own workflows)
6. Add role-based UI:
   - Admin sees all workflows
   - User sees only their workflows

**I/O Contract:**
```typescript
// Session
interface Session {
  user: {
    id: string
    name: string
    email: string
    image?: string
    role: 'admin' | 'user'
  }
}

// Permission Check
async function checkPermission(
  session: Session | null,
  action: string,
  resource: string
): Promise<boolean>
```

**Files:**
- `/src/app/login/page.tsx`
- `/src/auth.ts`
- `/src/middleware.ts`
- `/src/lib/auth/permissions.ts`

**Success Criteria:**
- ✅ Login page works with GitHub OAuth
- ✅ Protected routes redirect to login
- ✅ Permission checks work
- ✅ Role-based UI displays correctly

**Error Handling:**
- OAuth error → Display error message
- Session expired → Redirect to login
- Permission denied → Show 403 page

---

### Task 1.6: WebSocket Integration (12 hours)

**Owner:** Frontend Team
**Inputs:** Real-time update requirements
**Outputs:** WebSocket client, event handlers
**Dependencies:** Tasks 1.1-1.5 (Components)
**Risk:** Medium (WebSocket reliability)

**Description:**
Implement WebSocket client for real-time updates:
- Connection management (connect, disconnect, reconnect)
- Event handlers for workflow updates
- Event handlers for task updates
- Event handlers for agent updates
- Automatic reconnection with exponential backoff
- Connection status indicator

**Steps:**
1. Install WebSocket client:
   ```bash
   npm install ws @types/ws
   ```
2. Create WebSocket hook:
   ```typescript
   // hooks/use-websocket.ts
   export function useWebSocket(url: string) {
     const [socket, setSocket] = useState<WebSocket | null>(null)
     const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')

     useEffect(() => {
       const ws = new WebSocket(url)
       setSocket(ws)

       ws.onopen = () => setStatus('connected')
       ws.onclose = () => {
         setStatus('disconnected')
         // Reconnect after 5s
         setTimeout(() => connect(), 5000)
       }
       ws.onerror = () => setStatus('disconnected')

       return () => ws.close()
     }, [url])

     return { socket, status }
   }
   ```
3. Create event handlers:
   - `workflow.updated` → Update workflow state
   - `phase.advanced` → Update phase pipeline
   - `task.assigned` → Update task queue
   - `task.completed` → Update task status
   - `agent.heartbeat` → Update agent status
4. Add connection status indicator to UI
5. Add reconnection logic with exponential backoff

**I/O Contract:**
```typescript
// WebSocket Events
interface WebSocketEvent {
  type: string
  data: any
  timestamp: string
}

interface WorkflowUpdatedEvent extends WebSocketEvent {
  type: 'workflow.updated'
  data: {
    workflowId: string
    updates: Partial<WorkflowState>
  }
}

interface PhaseAdvancedEvent extends WebSocketEvent {
  type: 'phase.advanced'
  data: {
    workflowId: string
    fromPhase: string
    toPhase: string
    timestamp: string
  }
}
```

**Files:**
- `/src/hooks/use-websocket.ts`
- `/src/lib/websocket/event-handlers.ts`
- `/src/components/ui/connection-status.tsx`

**Success Criteria:**
- ✅ WebSocket connects successfully
- ✅ Events trigger UI updates
- ✅ Reconnection works automatically
- ✅ Connection status displays

**Error Handling:**
- Connection failed → Show warning, retry
- Event parse error → Log warning, skip event
- Reconnection failed → Show error, stop retrying after 5 attempts

---

### Task 1.7: Loading States & Skeleton Screens (8 hours)

**Owner:** Frontend Team
**Inputs:** Component list from Phase 1
**Outputs:** Skeleton components, loading indicators
**Dependencies:** Tasks 1.1-1.6 (Components)
**Risk:** Low

**Description:**
Add loading states and skeleton screens to all async components:
- Skeleton screens for lists (workflows, tasks, agents)
- Loading indicators for buttons
- Optimistic updates for actions
- Error states with retry

**Steps:**
1. Create skeleton components:
   ```tsx
   // Workflow list skeleton
   <Skeleton className="h-24 w-full" />
   <Skeleton className="h-24 w-full" />
   <Skeleton className="h-24 w-full" />

   // Task card skeleton
   <Skeleton className="h-16 w-full" />
   ```
2. Add loading indicators to buttons:
   ```tsx
   <Button disabled={loading}>
     {loading ? <Spinner /> : 'Submit'}
   </Button>
   ```
3. Add optimistic updates:
   ```typescript
   async function handleSubmit() {
     // Optimistic update
     setWorkflows(prev => [{ ...newWorkflow, status: 'pending' }, ...prev])

     try {
       await createWorkflow(newWorkflow)
     } catch {
       // Rollback on error
       setWorkflows(prev => prev.slice(1))
     }
   }
   ```
4. Add error states with retry:
   ```tsx
   {error && (
     <ErrorMessage>
       {error}
       <Button onClick={retry}>Retry</Button>
     </ErrorMessage>
   )}
   ```

**Files:**
- `/src/components/ui/skeleton.tsx`
- `/src/components/ui/loading-button.tsx`
- `/src/components/ui/error-message.tsx`

**Success Criteria:**
- ✅ Skeleton screens display during loading
- ✅ Loading indicators show on buttons
- ✅ Optimistic updates provide instant feedback
- ✅ Error states display with retry

**Error Handling:**
- Optimistic update failed → Rollback UI, show error
- Retry failed → Show final error, disable retry button

---

### Task 1.8: Form Validation Enhancement (6 hours)

**Owner:** Frontend Team
**Inputs:** Workflow submit form
**Outputs:** Enhanced form validation
**Dependencies:** Task 1.1 (Submit Form)
**Risk:** Low

**Description:**
Add comprehensive form validation:
- Field-level validation (on blur)
- Real-time validation (on change)
- Cross-field validation
- Custom validation messages
- Accessibility (ARIA attributes)

**Steps:**
1. Add field-level validation:
   ```typescript
   <input
     onBlur={() => validateField('title')}
     onChange={(e) => handleChange('title', e.target.value)}
     aria-invalid={errors.title ? 'true' : 'false'}
     aria-describedby={errors.title ? 'title-error' : undefined}
   />
   {errors.title && <span id="title-error">{errors.title}</span>}
   ```
2. Add real-time validation (debounced):
   ```typescript
   const debouncedValidate = useMemo(
     () => debounce(validateField, 300),
     []
   )
   ```
3. Add cross-field validation:
   ```typescript
   if (workflowType === 'full' && !description) {
     errors.description = 'Description required for full workflow'
   }
   ```
4. Add custom validation messages (clear, actionable)
5. Add ARIA attributes for accessibility

**I/O Contract:**
```typescript
interface ValidationErrors {
  [field: string]: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationErrors
}

function validateForm(data: WorkflowSubmitData): ValidationResult
function validateField(field: string, value: any): string | null
```

**Files:**
- `/src/lib/validation/form-validation.ts`
- `/src/components/workflows/submit-form.tsx` (updated)

**Success Criteria:**
- ✅ Field-level validation works
- ✅ Real-time validation works
- ✅ Cross-field validation works
- ✅ Error messages are clear
- ✅ Accessibility requirements met

**Error Handling:**
- Validation error → Display error message below field
- Validation exception → Log error, display generic error

---

### Task 1.9: Accessibility & Responsive Design (8 hours)

**Owner:** Frontend Team
**Inputs:** All Phase 1 components
**Outputs:** Accessible, responsive components
**Dependencies:** All Phase 1 tasks
**Risk:** Low

**Description:**
Add accessibility and responsive design:
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Responsive layouts (mobile, tablet, desktop)

**Steps:**
1. Add ARIA labels:
   ```tsx
   <button aria-label="Pause workflow" aria-pressed={paused}>
     <PauseIcon />
   </button>
   ```
2. Add keyboard navigation:
   ```tsx
   <div
     role="listbox"
     tabIndex={0}
     onKeyDown={handleKeyDown}
   >
     {items.map(item => (
       <div
         role="option"
         tabIndex={-1}
         onKeyDown={e => handleItemKeyDown(e, item)}
       >
         {item.label}
       </div>
     ))}
   </div>
   ```
3. Add focus management:
   ```tsx
   useEffect(() => {
     if (modalOpen) {
       ref.current?.focus()
     }
   }, [modalOpen])
   ```
4. Add responsive layouts:
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {cards}
   </div>
   ```
5. Test with screen reader (NVDA, JAWS)
6. Test keyboard navigation
7. Test on mobile devices

**Success Criteria:**
- ✅ All interactive elements have ARIA labels
- ✅ Keyboard navigation works
- ✅ Focus management works
- ✅ Screen reader announces correctly
- ✅ Responsive layouts work on all devices

**Error Handling:**
- Focus trap fails → Log warning, fallback to default
- Screen reader issue → Fix ARIA attributes

---

## Phase 2: Backend Services (116 hours)

### Task 2.0: Backend Service Architecture Setup (8 hours)

**Owner:** Backend Team
**Inputs:** Phase 0 audit report
**Outputs:** Service structure, shared utilities
**Dependencies:** Task 0.0 (Codebase Audit)
**Risk:** Low

**Description:**
Set up the backend service architecture.

**Steps:**
1. Create `/src/lib/services/` directory
2. Create shared utilities:
   - Logger (structured logging)
   - Error handler (consistent error responses)
   - Response formatter (standard API responses)
3. Set up service base class:
   ```typescript
   export abstract class Service {
     protected logger: Logger
     constructor() {
       this.logger = new Logger(this.constructor.name)
     }
   }
   ```

**Files:**
- `/src/lib/utils/logger.ts`
- `/src/lib/utils/error-handler.ts`
- `/src/lib/utils/response-formatter.ts`
- `/src/lib/services/base.ts`

**Success Criteria:**
- ✅ Service structure created
- ✅ Shared utilities working

---

### Task 2.1: Intent Detection Service (16 hours)

**Owner:** Backend Team
**Inputs:** User workflow submission
**Outputs:** Detected intent, suggested workflow type
**Dependencies:** Task 2.0 (Backend Architecture)
**Risk:** Medium (ML model accuracy)

**Description:**
Implement intent detection to classify user requests:
- Detect intent (feature-request, bug-report, code-review, question)
- Suggest workflow type (quick, full, queue)
- Provide confidence score and reasoning

**Steps:**
1. Implement keyword-based classification:
   ```typescript
   const keywords = {
     'feature-request': ['add', 'implement', 'create', 'build', 'feature'],
     'bug-report': ['bug', 'fix', 'broken', 'error', 'issue'],
     'code-review': ['review', 'refactor', 'optimize', 'improve'],
   }
   ```
2. Implement length heuristic:
   - Short (< 100 chars) → Quick
   - Medium (100-500 chars) → Full
   - Long (> 500 chars) → Queue
3. Implement complexity detection:
   - Single file mentioned → Quick
   - Multiple files mentioned → Full
   - Multiple projects mentioned → Queue
4. Combine signals for final classification
5. Return confidence score and reasoning

**I/O Contract:**
```typescript
interface IntentDetectionInput {
  title: string
  description: string
  attachments?: string[]
}

interface IntentDetectionOutput {
  intent: 'feature-request' | 'bug-report' | 'code-review' | 'question'
  confidence: number
  suggestedWorkflowType: 'quick' | 'full' | 'queue'
  reasoning: string
}

class IntentDetectionService {
  async detect(input: IntentDetectionInput): Promise<IntentDetectionOutput>
}
```

**Files:**
- `/src/lib/services/intent-detection.ts`
- `/src/app/api/workflows/detect-intent/route.ts`

**Success Criteria:**
- ✅ Intent detection accuracy > 90%
- ✅ Suggested workflow type matches complexity
- ✅ Reasoning is clear and helpful

**Error Handling:**
- Detection failed → Default to 'feature-request', 'full'
- Low confidence → Suggest 'full' (safe default)

---

### Task 2.2: Workflow Engine (24 hours)

**Owner:** Backend Team
**Inputs:** Workflow submission data, intent detection
**Outputs:** Created workflow, GitHub issue
**Dependencies:** Tasks 2.0-2.1, 0.1 (Coordination)
**Risk:** High (core orchestration logic)

**Description:**
Implement workflow engine to create and manage workflows:
- Create workflow from submission
- Detect intent
- Create GitHub issue with template
- Initialize workflow state
- Trigger appropriate agent
- Advance phases
- Handle approval gates

**Steps:**
1. Implement workflow creation:
   ```typescript
   async function createWorkflow(data: WorkflowSubmitData, userId: string): Promise<Workflow>
   ```
2. Call intent detection service
3. Create GitHub issue:
   - Select template based on workflow type
   - Fill template with data
   - Add labels (type, priority, workflow-type, phase)
   - Add to project board
4. Initialize workflow state:
   - Generate unique ID
   - Set initial phase (initiation)
   - Set status (pending)
   - Save to `.ultra/state/workflows/{id}.json`
5. Trigger agent:
   - Quick → Trigger ultra:architect directly
   - Full → Trigger ultra:team-lead for 5-phase process
   - Queue → Add to task queue
6. Implement phase advance:
   - Check if current phase complete
   - Check if approval required
   - If approval required → Pause, notify user
   - If approval not required → Advance to next phase
   - Update GitHub issue labels
7. Implement approval gate handler:
   - User approves → Resume workflow
   - User rejects → Cancel workflow, create issue

**I/O Contract:**
```typescript
interface WorkflowCreateInput {
  title: string
  description: string
  type: WorkflowType
  priority: Priority
  projectId?: string
  workflowType: 'quick' | 'full' | 'queue'
  userId: string
}

interface Workflow {
  id: string
  type: WorkflowType
  priority: Priority
  projectId: string
  githubIssue?: number
  title: string
  description: string
  intent: IntentDetection
  currentPhase: Phase
  phaseHistory: PhaseTransition[]
  status: WorkflowStatus
  progress: number
  primaryAgent?: string
  requiresApproval: boolean
  artifacts: Artifact[]
  specPath?: string
  planPath?: string
  result?: 'success' | 'partial' | 'failed'
  createdBy: string
  createdAt: string
  updatedAt: string
}

class WorkflowEngine {
  async create(input: WorkflowCreateInput): Promise<Workflow>
  async advancePhase(workflowId: string): Promise<void>
  async approve(workflowId: string): Promise<void>
  async reject(workflowId: string, reason: string): Promise<void>
  async pause(workflowId: string): Promise<void>
  async resume(workflowId: string): Promise<void>
  async cancel(workflowId: string): Promise<void>
}
```

**Files:**
- `/src/lib/services/workflow-engine.ts`
- `/src/app/api/workflows/route.ts`
- `/src/app/api/workflows/[id]/advance/route.ts`
- `/src/app/api/workflows/[id]/approve/route.ts`
- `/src/app/api/workflows/[id]/reject/route.ts`
- `/src/app/api/workflows/[id]/pause/route.ts`
- `/src/app/api/workflows/[id]/resume/route.ts`
- `/src/app/api/workflows/[id]/cancel/route.ts`

**Success Criteria:**
- ✅ Workflow creates successfully
- ✅ GitHub issue created with correct template
- ✅ Workflow state saved correctly
- ✅ Appropriate agent triggered
- ✅ Phase advances correctly
- ✅ Approval gates work

**Error Handling:**
- Intent detection failed → Use default, continue
- GitHub API error → Retry with backoff, then fail workflow
- State save failed → Log critical error, fail workflow
- Agent trigger failed → Retry 3 times, then fail workflow

---

### Task 2.3: Agent Orchestrator (20 hours)

**Owner:** Backend Team
**Inputs:** Workflow, agent registry
**Outputs:** Triggered agents, handoffs
**Dependencies:** Tasks 2.0-2.2, 0.1 (Coordination), 3.0 (Agent Layer)
**Risk:** High (agent coordination)

**Description:**
Implement agent orchestrator to trigger and coordinate agents:
- Trigger ultra:architect for quick workflows
- Trigger ultra:team-lead for full workflows
- Add to task queue for queue workflows
- Handle agent handoffs
- Monitor agent health

**Steps:**
1. Implement agent trigger:
   ```typescript
   async function triggerAgent(workflowId: string, agentType: string): Promise<void>
   ```
2. Get agent from registry
3. Claim task in TaskClaimProtocol
4. Invoke agent with workflow context
5. Monitor agent heartbeat
6. Handle agent failure (retry, reassign, fail workflow)
7. Implement agent handoff:
   - Checkpoint current state
   - Pass artifacts to next agent
   - Release current task
   - Trigger next agent
8. Implement agent monitoring:
   - Check heartbeat
   - Detect stale agents
   - Reassign tasks if agent failed

**I/O Contract:**
```typescript
interface AgentTriggerInput {
  workflowId: string
  agentType: string
  phase: string
  context: AgentContext
}

interface AgentContext {
  workflow: Workflow
  phase: Phase
  artifacts: Artifact[]
  checkpoint?: string
}

interface AgentHandoff {
  fromAgent: string
  toAgent: string
  artifacts: Artifact[]
  checkpoint: string
}

class AgentOrchestrator {
  async triggerAgent(input: AgentTriggerInput): Promise<void>
  async handoff(handoff: AgentHandoff): Promise<void>
  async monitorAgent(agentId: string): Promise<void>
  async handleAgentFailure(agentId: string): Promise<void>
}
```

**Files:**
- `/src/lib/services/agent-orchestrator.ts`
- `/src/lib/services/agent-handoff.ts`
- `/src/lib/services/agent-monitor.ts`

**Success Criteria:**
- ✅ Agents trigger successfully
- ✅ Agent handoffs work
- ✅ Agent failures detected and handled
- ✅ Tasks reassigned on failure

**Error Handling:**
- Agent not found → Log error, fail workflow
- Agent trigger failed → Retry 3 times, then fail workflow
- Handoff failed → Rollback to checkpoint, retry
- Agent stale → Reassign tasks, mark agent failed

---

### Task 2.4: GitHub Integrator (16 hours)

**Owner:** Backend Team
**Inputs:** Workflow data
**Outputs:** GitHub issues, comments, labels
**Dependencies:** Tasks 2.0-2.1
**Risk:** Medium (GitHub API reliability)

**Description:**
Implement GitHub integration for issues and comments:
- Create issues with templates
- Add labels to issues
- Post comments to issues
- Update issue status
- Handle webhooks (idempotent, ordered)

**Steps:**
1. Implement issue creation:
   ```typescript
   async function createIssue(workflow: Workflow): Promise<number>
   ```
2. Select template based on workflow type
3. Fill template with workflow data
4. Add labels:
   - `type:{feature-request,bug-report,code-review}`
   - `priority:{low,medium,high,critical}`
   - `workflow-type:{quick,full,queue}`
   - `phase:{initiation,requirements,architecture,...}`
   - `status:{pending,in-progress,completed,failed}`
5. Add to project board
6. Implement comment posting:
   ```typescript
   async function postComment(workflowId: string, message: string): Promise<void>
   ```
7. Implement label updates (on phase changes)
8. Implement webhook handler:
   - Verify signature (HMAC-SHA256)
   - Check idempotency (event ID tracking)
   - Order events (sequence number)
   - Parse event type
   - Route to appropriate handler

**I/O Contract:**
```typescript
class GitHubIntegrator {
  async createIssue(workflow: Workflow): Promise<number>
  async postComment(issueNumber: number, message: string): Promise<void>
  async updateLabels(issueNumber: number, labels: string[]): Promise<void>
  async updateStatus(issueNumber: number, status: string): Promise<void>
  async handleWebhook(event: GitHubEvent): Promise<void>
}

interface GitHubEvent {
  id: string
  'X-Hub-Signature-256': string
  payload: any
}
```

**Files:**
- `/src/lib/services/github-integrator.ts`
- `/src/app/api/github/webhook/route.ts`

**Success Criteria:**
- ✅ Issues created with correct templates
- ✅ Labels added correctly
- ✅ Comments posted successfully
- ✅ Webhook signatures verified
- ✅ Webhook idempotency works
- ✅ Events processed in order

**Error Handling:**
- GitHub API error → Retry with backoff (3x)
- Signature verification failed → Return 401, log warning
- Duplicate event → Skip (idempotency)
- Out-of-order event → Buffer until predecessors arrive

---

### Task 2.5: Webhook Security Hardening (8 hours)

**Owner:** Backend Team
**Inputs:** GitHub webhooks
**Outputs:** Secure webhook handler
**Dependencies:** Task 2.4 (GitHub Integrator)
**Risk:** High (security vulnerability)

**Description:**
Implement comprehensive webhook security:
- HMAC-SHA256 signature verification
- Timestamp validation (replay attack prevention)
- IP whitelist
- Signature debug logging

**Steps:**
1. Implement signature verification:
   ```typescript
   import crypto from 'crypto'

   function verifySignature(payload: string, signature: string, secret: string): boolean {
     const hmac = crypto.createHmac('sha256', secret)
     hmac.update(payload)
     const digest = hmac.digest('hex')
     return crypto.timingSafeEqual(
       Buffer.from(`sha256=${digest}`),
       Buffer.from(signature)
     )
   }
   ```
2. Implement timestamp validation:
   ```typescript
   function validateTimestamp(timestamp: string): boolean {
     const eventTime = new Date(timestamp)
     const now = new Date()
     const diff = Math.abs(now.getTime() - eventTime.getTime())
     return diff < 5 * 60 * 1000  // 5 minutes
   }
   ```
3. Implement IP whitelist:
   ```typescript
   const GITHUB_WEBHOOK_IPS = [
     '192.30.252.0/22',
     '185.199.108.0/22',
     // ... see GitHub docs for full list
   ]

   function isAllowedIP(ip: string): boolean {
     return GITHUB_WEBHOOK_IPS.some(range => ipInRange(ip, range))
   }
   ```
4. Add signature debug logging (for troubleshooting):
   ```typescript
   if (process.env.DEBUG_WEBHOOK) {
     logger.debug('Webhook signature', {
       received: signature,
       calculated: `sha256=${digest}`,
       match: verified,
     })
   }
   ```

**I/O Contract:**
```typescript
interface WebhookSecurityConfig {
  secret: string
  allowedIPs: string[]
  timestampTolerance: number  // milliseconds
  debugMode: boolean
}

class WebhookSecurity {
  async verifyRequest(
    payload: string,
    signature: string,
    timestamp: string,
    ip: string
  ): Promise<boolean>
}
```

**Files:**
- `/src/lib/security/webhook-security.ts`
- `/src/app/api/github/webhook/route.ts` (updated)

**Success Criteria:**
- ✅ Signature verification works
- ✅ Timestamp validation prevents replay attacks
- ✅ IP whitelist blocks unauthorized requests
- ✅ Debug logging helps troubleshoot

**Error Handling:**
- Signature invalid → Return 401, log warning
- Timestamp invalid → Return 401, log warning
- IP not allowed → Return 403, log warning

---

### Task 2.6: Input Validation & Sanitization Service (16 hours)

**Owner:** Backend Team
**Inputs:** User input from forms, APIs
**Outputs:** Validated, sanitized data
**Dependencies:** Task 2.0 (Backend Architecture)
**Risk:** High (security vulnerability)

**Description:**
Implement comprehensive input validation and sanitization:
- Validate all input using Zod schemas
- Sanitize HTML to prevent XSS
- Validate agent commands
- Rate limit per user
- Prevent prompt injection

**Steps:**
1. Create Zod schemas for all inputs:
   ```typescript
   const WorkflowSubmitSchema = z.object({
     title: z.string().min(10).max(200).transform(sanitize),
     description: z.string().min(50).transform(sanitizeHTML),
     type: z.enum(['feature-request', 'bug-report', 'code-review']),
     priority: z.enum(['low', 'medium', 'high', 'critical']),
     projectId: z.string().regex(/^[a-zA-Z0-9-]+$/).optional(),
     workflowType: z.enum(['quick', 'full', 'queue']),
   })
   ```
2. Implement HTML sanitization:
   ```typescript
   import DOMPurify from 'isomorphic-dompurify'

   function sanitizeHTML(html: string): string {
     return DOMPurify.sanitize(html, {
       ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'code', 'pre'],
       ALLOWED_ATTR: ['href'],
     })
   }
   ```
3. Implement agent command validation:
   ```typescript
   const ALLOWED_AGENT_COMMANDS = [
     'read',
     'write',
     'execute',
     'spawn',
   ]

   function validateAgentCommand(command: string): boolean {
     return ALLOWED_AGENT_COMMANDS.includes(command)
   }
   ```
4. Implement rate limiting:
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit'
   import { Redis } from '@upstash/redis'

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, '1 m'),  // 10 requests per minute
   })

   async function checkRateLimit(userId: string): Promise<boolean> {
     const { success } = await ratelimit.limit(userId)
     return success
   }
   ```
5. Implement prompt injection prevention:
   ```typescript
   function detectPromptInjection(text: string): boolean {
     const injectionPatterns = [
       /ignore (previous|all) instructions/i,
       /disregard (above|earlier)/i,
       /system:\s*/i,
     ]
     return injectionPatterns.some(pattern => pattern.test(text))
   }
   ```

**I/O Contract:**
```typescript
class InputValidationService {
  async validateWorkflowSubmit(data: unknown): Promise<WorkflowSubmitData>
  sanitizeHTML(html: string): string
  validateAgentCommand(command: string): boolean
  async checkRateLimit(userId: string): Promise<boolean>
  detectPromptInjection(text: string): boolean
}
```

**Files:**
- `/src/lib/security/input-validation.ts`
- `/src/lib/validation/schemas.ts`

**Success Criteria:**
- ✅ All input validated with Zod schemas
- ✅ HTML sanitized to prevent XSS
- ✅ Agent commands validated
- ✅ Rate limiting prevents abuse
- ✅ Prompt injection detected

**Error Handling:**
- Validation failed → Return 400 with error details
- Sanitization failed → Log error, return safe default
- Rate limit exceeded → Return 429, retry-after header
- Prompt injection detected → Return 400, log warning

---

## Phase 3: Agent Layer (132 hours)

### Task 3.0: Agent Execution Layer Foundation (24 hours)

**Owner:** Backend Team
**Inputs:** Agent orchestration requirements
**Outputs:** Base Agent class, Agent factory, Queue manager
**Dependencies:** Tasks 0.1 (Coordination), 2.0 (Backend Architecture)
**Risk:** High (core agent infrastructure)

**Description:**
Implement the foundation for agent execution:
- Base Agent class with lifecycle hooks
- Agent factory for spawning agents
- Agent queue manager for task assignment
- Execution context for agent operations
- State management for agent memory

**Steps:**
1. Create Base Agent class:
   ```typescript
   export abstract class BaseAgent {
     id: string
     name: string
     type: AgentType
     status: 'idle' | 'active' | 'failed'

     abstract async execute(context: ExecutionContext): Promise<AgentResult>
     async onStart(): Promise<void>
     async onComplete(result: AgentResult): Promise<void>
     async onError(error: Error): Promise<void>
   }
   ```
2. Create Agent factory:
   ```typescript
   class AgentFactory {
     async spawn(type: AgentType, config: AgentConfig): Promise<BaseAgent>
     async destroy(agentId: string): Promise<void>
   }
   ```
3. Create Agent queue manager:
   ```typescript
   class AgentQueueManager {
     async enqueue(task: AgentTask): Promise<void>
     async claim(agentId: string): Promise<AgentTask | null>
     async complete(taskId: string, result: AgentResult): Promise<void>
     async fail(taskId: string, error: Error): Promise<void>
   }
   ```
4. Create Execution context:
   ```typescript
   interface ExecutionContext {
     workflow: Workflow
     phase: Phase
     artifacts: Artifact[]
     checkpoint?: string
     state: AgentState
     tools: AgentTools
   }

   interface AgentTools {
     readFile(path: string): Promise<string>
     writeFile(path: string, content: string): Promise<void>
     spawnAgent(type: AgentType, task: string): Promise<string>
     postComment(message: string): Promise<void>
   }
   ```
5. Create Agent state manager:
   ```typescript
   class AgentStateManager {
     async load(agentId: string): Promise<AgentState>
     async save(agentId: string, state: AgentState): Promise<void>
     async checkpoint(agentId: string): Promise<string>
     async restore(agentId: string, checkpoint: string): Promise<void>
   }
   ```

**I/O Contract:**
```typescript
interface AgentConfig {
  type: AgentType
  model?: 'haiku' | 'sonnet' | 'opus'
  timeout?: number
  retries?: number
}

interface AgentTask {
  id: string
  workflowId: string
  phase: string
  description: string
  assignedTo?: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  dependsOn: string[]
}

interface AgentResult {
  success: boolean
  artifacts: Artifact[]
  checkpoint?: string
  nextPhase?: string
  error?: Error
}

interface AgentState {
  memory: Map<string, any>
  history: AgentMessage[]
  currentTask?: AgentTask
}
```

**Files:**
- `/src/lib/agents/base-agent.ts`
- `/src/lib/agents/agent-factory.ts`
- `/src/lib/agents/agent-queue-manager.ts`
- `/src/lib/agents/execution-context.ts`
- `/src/lib/agents/agent-state-manager.ts`

**Success Criteria:**
- ✅ Base agent class works
- ✅ Agent factory spawns agents
- ✅ Queue manager assigns tasks
- ✅ Execution context provides tools
- ✅ State manager persists state

**Error Handling:**
- Agent spawn failed → Log error, retry 3 times
- Queue claim failed → Return null, caller retries
- State save failed → Log error, use in-memory fallback
- Tool execution failed → Throw error, agent handles

---

### Task 3.1: Agent Handoff Protocol (12 hours)

**Owner:** Backend Team
**Inputs:** Agent result, next agent
**Outputs:** Handoff complete with artifacts
**Dependencies:** Tasks 3.0 (Agent Layer), 0.1 (Coordination)
**Risk:** Medium (handoff reliability)

**Description:**
Implement agent handoff protocol:
- Define handoff schema
- Validate handoff data
- Pass artifacts between agents
- Checkpoint state for recovery
- Handle handoff failures

**Steps:**
1. Define handoff schema:
   ```typescript
   interface AgentHandoff {
     id: string
     fromAgent: string
     toAgent: string
     workflowId: string
     fromPhase: string
     toPhase: string
     artifacts: Artifact[]
     checkpoint: string
     timestamp: string
     status: 'pending' | 'in-progress' | 'completed' | 'failed'
   }
   ```
2. Implement handoff validation:
   ```typescript
   function validateHandoff(handoff: AgentHandoff): ValidationResult {
     // Validate fromAgent and toAgent exist
     // Validate artifacts are not corrupted
     // Validate checkpoint exists
     // Validate phase transition is valid
   }
   ```
3. Implement artifact passing:
   ```typescript
   async function passArtifacts(handoff: AgentHandoff): Promise<void> {
     // Save artifacts to shared location
     // Grant permissions to toAgent
     // Notify toAgent of new artifacts
   }
   ```
4. Implement checkpoint creation:
   ```typescript
   async function createCheckpoint(agentId: string): Promise<string> {
     // Save current agent state
     // Save in-memory data
     // Return checkpoint ID
   }
   ```
5. Implement handoff recovery:
   ```typescript
   async function recoverHandoff(handoffId: string): Promise<void> {
     // Load checkpoint
     // Restore agent state
     // Retry handoff
   }
   ```

**I/O Contract:**
```typescript
class AgentHandoffProtocol {
  async initiateHandoff(
     fromAgent: string,
     toAgent: string,
     artifacts: Artifact[]
  ): Promise<string>  // Returns handoff ID

  async completeHandoff(handoffId: string): Promise<void>
  async validateHandoff(handoff: AgentHandoff): Promise<ValidationResult>
  async recoverHandoff(handoffId: string): Promise<void>
}
```

**Files:**
- `/src/lib/agents/handoff-protocol.ts`
- `/src/lib/agents/checkpoint-manager.ts`

**Success Criteria:**
- ✅ Handoff schema validates correctly
- ✅ Artifacts pass between agents
- ✅ Checkpoints create and restore
- ✅ Handoff failures recover

**Error Handling:**
- Validation failed → Reject handoff, log error
- Artifact save failed → Retry 3 times, then fail
- Checkpoint failed → Fail handoff, log error
- Recovery failed → Escalate to human operator

---

### Task 3.2: Ultra-Architect Agent Implementation (20 hours)

**Owner:** Backend Team
**Inputs:** Workflow, phase context
**Outputs:** Architecture design, implementation
**Dependencies:** Tasks 3.0-3.1 (Agent Layer)
**Risk:** Medium (agent complexity)

**Description:**
Implement ultra:architect agent:
- Execute architecture phase
- Execute implementation phase
- Spawn parallel executors
- Report progress

**Steps:**
1. Create ultra:architect class:
   ```typescript
   class UltraArchitect extends BaseAgent {
     type = 'ultra:architect'
     name = 'ultra:architect'

     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read workflow requirements
       // Design architecture
       // Create spec.md
       // Spawn executors for implementation
       // Monitor progress
       // Verify completion
     }
   }
   ```
2. Implement architecture phase:
   - Analyze requirements
   - Design components
   - Define interfaces
   - Create data model
   - Write spec.md
3. Implement execution phase:
   - Create implementation tasks
   - Spawn parallel executors
   - Assign file ownership
   - Monitor progress
   - Handle conflicts
4. Implement progress reporting:
   - Post comments to GitHub issue
   - Update phase status
   - Report percentage complete

**I/O Contract:**
```typescript
interface UltraArchitectContext extends ExecutionContext {
  requirements: RequirementsDocument
  constraints: Constraints
}

interface UltraArchitectResult extends AgentResult {
  spec: SpecDocument
  implementation: ImplementationPlan
}
```

**Files:**
- `/src/lib/agents/ultra-architect.ts`

**Success Criteria:**
- ✅ Architecture phase completes
- ✅ Spec document created
- ✅ Implementation phase spawns executors
- ✅ Progress reports post to GitHub

**Error Handling:**
- Requirements unclear → Post comment asking for clarification
- Architecture design failed → Retry with different approach
- Executor spawn failed → Retry 3 times, then fail
- Implementation conflict → Resolve with conflict resolver

---

### Task 3.3: Ultra-Team-Lead Agent Implementation (16 hours)

**Owner:** Backend Team
**Inputs:** Workflow, full project context
**Outputs:** Project management, task assignment
**Dependencies:** Tasks 3.0-3.1 (Agent Layer)
**Risk:** Medium (agent complexity)

**Description:**
Implement ultra:team-lead agent:
- Coordinate full Ultrapilot projects
- Assign tasks to agents
- Monitor progress
- Handle escalations

**Steps:**
1. Create ultra:team-lead class:
   ```typescript
   class UltraTeamLead extends BaseAgent {
     type = 'ultra:team-lead'
     name = 'ultra:team-lead'

     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Create project plan
       // Break down into phases
       // Assign phase leads
       // Monitor progress
       // Handle approval gates
       // Coordinate handoffs
     }
   }
   ```
2. Implement project planning:
   - Analyze requirements
   - Create phase plan
   - Assign agents to phases
   - Create task dependencies
3. Implement task assignment:
   - Claim tasks from queue
   - Assign to appropriate agents
   - Monitor agent health
   - Reassign if agent fails
4. Implement approval gate handling:
   - Detect approval required
   - Pause workflow
   - Notify user
   - Wait for approval/rejection
   - Resume or cancel based on response

**I/O Contract:**
```typescript
interface UltraTeamLeadContext extends ExecutionContext {
  project: FullProject
  agents: AgentInfo[]
}

interface UltraTeamLeadResult extends AgentResult {
  projectPlan: ProjectPlan
  phases: Phase[]
}
```

**Files:**
- `/src/lib/agents/ultra-team-lead.ts`

**Success Criteria:**
- ✅ Project plan created
- ✅ Phases assigned to agents
- ✅ Approval gates handled
- ✅ Progress monitored

**Error Handling:**
- Agent unavailable → Reassign to another agent
- Approval timeout (24h) → Escalate to admin
- Task failed → Retry, then escalate
- Handoff failed → Recover from checkpoint

---

### Task 3.4: Agent Command Validation & Sandboxing (16 hours)

**Owner:** Backend Team
**Inputs:** Agent commands
**Outputs:** Validated, sandboxed execution
**Dependencies:** Tasks 3.0 (Agent Layer)
**Risk:** High (security vulnerability)

**Description:**
Implement agent command validation and sandboxing:
- Whitelist allowed commands
- Validate command parameters
- Sandbox file operations
- Limit resource usage
- Audit all commands

**Steps:**
1. Define command whitelist:
   ```typescript
   const AGENT_COMMAND_WHITELIST = {
     'file': ['read', 'write', 'delete'],
     'git': ['add', 'commit', 'push', 'pull'],
     'agent': ['spawn', 'signal', 'query'],
     'github': ['createIssue', 'postComment', 'updateLabels'],
   }
   ```
2. Implement command validation:
   ```typescript
   function validateCommand(command: AgentCommand): boolean {
     const { category, action } = command
     const allowed = AGENT_COMMAND_WHITELIST[category]
     return allowed?.includes(action) ?? false
   }
   ```
3. Implement file operation sandbox:
   ```typescript
   class FileSandbox {
     private allowedPaths: Set<string>

     constructor(allowedPaths: string[]) {
       this.allowedPaths = new Set(allowedPaths)
     }

     async readFile(path: string): Promise<string> {
       if (!this.isAllowed(path)) {
         throw new Error('Path not allowed')
       }
       return fs.readFile(path, 'utf-8')
     }

     private isAllowed(path: string): boolean {
       const resolved = path.resolve(path)
       return Array.from(this.allowedPaths).some(allowed =>
         resolved.startsWith(allowed)
       )
     }
   }
   ```
4. Implement resource limits:
   ```typescript
   class ResourceLimiter {
     private maxMemory: number
     private maxExecutionTime: number

     async execute<T>(fn: () => Promise<T>): Promise<T> {
       const start = Date.now()
       const startMemory = process.memoryUsage().heapUsed

       const result = await fn()

       const duration = Date.now() - start
       const memory = process.memoryUsage().heapUsed - startMemory

       if (duration > this.maxExecutionTime) {
         throw new Error('Execution time exceeded')
       }
       if (memory > this.maxMemory) {
         throw new Error('Memory limit exceeded')
       }

       return result
     }
   }
   ```
5. Implement command audit logging:
   ```typescript
   class CommandAuditor {
     async log(agentId: string, command: AgentCommand, result: any): Promise<void> {
       await AuditLog.create({
         agentId,
         command: command.category + ':' + command.action,
         params: sanitizeParams(command.params),
         result: sanitizeResult(result),
         timestamp: new Date(),
       })
     }
   }
   ```

**I/O Contract:**
```typescript
interface AgentCommand {
  category: string
  action: string
  params: Record<string, any>
}

class AgentCommandValidator {
  validate(command: AgentCommand): boolean
  sanitize(command: AgentCommand): AgentCommand
}

class AgentSandbox {
  execute(command: AgentCommand): Promise<any>
}
```

**Files:**
- `/src/lib/security/agent-command-validator.ts`
- `/src/lib/security/file-sandbox.ts`
- `/src/lib/security/resource-limiter.ts`
- `/src/lib/audit/command-auditor.ts`

**Success Criteria:**
- ✅ Only whitelisted commands execute
- ✅ File operations sandboxed
- ✅ Resource limits enforced
- ✅ All commands audited

**Error Handling:**
- Command not allowed → Throw error, log to audit
- Path not allowed → Throw error, log to audit
- Resource limit exceeded → Kill command, log to audit
- Audit log failed → Log to stderr as fallback

---

### Task 3.5: Additional Agent Implementations (20 hours)

**Owner:** Backend Team
**Inputs:** Agent requirements
**Outputs:** Implemented agents
**Dependencies:** Tasks 3.0-3.4 (Agent Layer)
**Risk:** Medium

**Description:**
Implement additional agents:
- ultra:analyst - Requirements extraction
- ultra:planner - Implementation planning
- ultra:critic - Plan validation
- ultra:executor - Parallel execution
- ultra:verifier - Evidence verification
- ultra:reviewer - Multi-perspective review

**Steps:**
1. Create ultra:analyst agent:
   ```typescript
   class UltraAnalyst extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Extract requirements from user request
       // Create requirements document
       // Identify constraints
       // Define acceptance criteria
     }
   }
   ```
2. Create ultra:planner agent:
   ```typescript
   class UltraPlanner extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read spec.md
       // Create implementation plan
       // Break down into tasks
       // Define I/O contracts
     }
   }
   ```
3. Create ultra:critic agent:
   ```typescript
   class UltraCritic extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read plan.md
       // Review for completeness
       // Check for feasibility
       // Identify risks
       // Approve or request changes
     }
   }
   ```
4. Create ultra:executor agent:
   ```typescript
   class UltraExecutor extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read assigned task
       // Implement code changes
       // Follow file ownership boundaries
       // Report progress
     }
   }
   ```
5. Create ultra:verifier agent:
   ```typescript
   class UltraVerifier extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read plan.md
       // Run build command
       // Run test command
       // Collect evidence
       // Verify acceptance criteria
     }
   }
   ```
6. Create ultra:reviewer agent:
   ```typescript
   class UltraReviewer extends BaseAgent {
     async execute(context: ExecutionContext): Promise<AgentResult> {
       // Read code changes
       // Review for security, quality, correctness
       // Approve or request changes
     }
   }
   ```

**Files:**
- `/src/lib/agents/ultra-analyst.ts`
- `/src/lib/agents/ultra-planner.ts`
- `/src/lib/agents/ultra-critic.ts`
- `/src/lib/agents/ultra-executor.ts`
- `/src/lib/agents/ultra-verifier.ts`
- `/src/lib/agents/ultra-reviewer.ts`

**Success Criteria:**
- ✅ All agents implement BaseAgent interface
- ✅ Agents execute correctly
- ✅ Agents report progress

**Error Handling:**
- Agent execution failed → Log error, retry 3 times
- Agent timeout → Kill agent, log error
- Agent crash → Restart agent, restore from checkpoint

---

## Phase 4: Integrations (116 hours)

### Task 4.0: Integration Architecture Setup (8 hours)

**Owner:** Backend Team
**Inputs:** Service requirements
**Outputs:** Integration architecture
**Dependencies:** Tasks 0.1-0.4 (Coordination)
**Risk:** Low

**Description:**
Set up integration architecture for state consistency, cache, rate limiting, and idempotency.

**Steps:**
1. Define integration architecture:
   - Source of truth: GitHub issues
   - In-memory state: Cache for performance
   - Persistent cache: Redis for durability
2. Define state consistency model:
   - Read-after-write consistency
   - GitHub as single source of truth
   - Cache invalidation on state changes
3. Define error handling strategy:
   - Retry with exponential backoff
   - Dead letter queue for failed operations
   - Circuit breaker for failing services

**Files:**
- `/src/lib/integration/architecture.md`
- `/src/lib/integration/state-consistency.ts`

**Success Criteria:**
- ✅ Architecture documented
- ✅ Consistency model defined
- ✅ Error handling strategy defined

---

### Task 4.1: State Consistency Manager (12 hours)

**Owner:** Backend Team
**Inputs:** Multiple state sources
**Outputs:** Consistent state
**Dependencies:** Tasks 0.4 (State Reconciler), 4.0 (Integration Architecture)
**Risk:** High (state consistency is critical)

**Description:**
Implement state consistency manager:
- Define source of truth
- Implement read-after-write consistency
- Implement cache invalidation
- Implement state synchronization

**Steps:**
1. Define source of truth:
   ```typescript
   enum StateSource {
     GITHUB_ISSUE = 'source-of-truth',
     IN_MEMORY = 'cache',
     REDIS = 'persistent-cache',
   }
   ```
2. Implement read-after-write consistency:
   ```typescript
   class StateConsistencyManager {
     async read(workflowId: string): Promise<Workflow> {
       // Try cache first
       // If cache miss, fetch from GitHub
       // Update cache
       // Return state
     }

     async write(workflowId: string, updates: Partial<Workflow>): Promise<void> {
       // Write to GitHub issue (source of truth)
       // Wait for confirmation
       // Invalidate cache
       // Update in-memory state
     }
   }
   ```
3. Implement cache invalidation:
   ```typescript
   async invalidate(workflowId: string): Promise<void> {
     await this.cache.delete(`workflow:${workflowId}`)
     await this.redis.del(`workflow:${workflowId}`)
   }
   ```
4. Implement state synchronization:
   ```typescript
   async sync(workflowId: string): Promise<void> {
     // Fetch from GitHub issue
     // Update in-memory state
     // Update cache
     // Check for conflicts
     // Reconcile if needed
   }
   ```

**I/O Contract:**
```typescript
class StateConsistencyManager {
  async read(workflowId: string): Promise<Workflow>
  async write(workflowId: string, updates: Partial<Workflow>): Promise<void>
  async invalidate(workflowId: string): Promise<void>
  async sync(workflowId: string): Promise<void>
}
```

**Files:**
- `/src/lib/state/state-consistency-manager.ts`

**Success Criteria:**
- ✅ Reads return consistent state
- ✅ Writes update all sources
- ✅ Cache invalidation works
- ✅ State sync prevents conflicts

**Error Handling:**
- GitHub write failed → Retry 3 times, then fail
- Cache invalidation failed → Log warning, continue
- Sync conflict detected → Trigger reconciliation

---

### Task 4.2: File I/O Atomicity Layer (8 hours)

**Owner:** Backend Team
**Inputs:** State file operations
**Outputs:** Atomic file operations
**Dependencies:** Tasks 0.1 (Coordination)
**Risk:** Medium (file corruption risk)

**Description:**
Implement atomic file I/O:
- File locks for concurrent access
- Atomic writes (write to temp, then rename)
- Append-only logs for audit trail
- Crash recovery

**Steps:**
1. Implement file locks:
   ```typescript
   class FileLockManager {
     async acquire(path: string): Promise<Lock> {
       const lockFile = `${path}.lock`
       // Write PID and timestamp to lock file
       // Check if lock already held
       // Return lock object
     }

     async release(lock: Lock): Promise<void> {
       // Delete lock file
     }
   }
   ```
2. Implement atomic writes:
   ```typescript
   async function atomicWrite(path: string, content: string): Promise<void> {
     const tempPath = `${path}.tmp.${Date.now()}`
     await fs.writeFile(tempPath, content, 'utf-8')
     await fs.rename(tempPath, path)
   }
   ```
3. Implement append-only log:
   ```typescript
   class AppendOnlyLog {
     async append(entry: LogEntry): Promise<void> {
       const logLine = JSON.stringify(entry) + '\n'
       await fs.appendFile(this.logPath, logLine, 'utf-8')
     }

     async read(since: number): Promise<LogEntry[]> {
       const lines = await fs.readFile(this.logPath, 'utf-8')
       return lines.split('\n')
         .filter(line => line.trim())
         .map(line => JSON.parse(line))
         .filter(entry => entry.timestamp >= since)
     }
   }
   ```
4. Implement crash recovery:
   ```typescript
   async function recoverFromCrash(): Promise<void> {
     // Find all .tmp files (incomplete writes)
     // Delete them
     // Find all stale lock files ( > 1 hour old)
     // Delete them
     // Rebuild state from append-only log
   }
   ```

**I/O Contract:**
```typescript
class FileIOLayer {
  async readFile(path: string): Promise<string>
  async writeFile(path: string, content: string): Promise<void>
  async appendFile(path: string, content: string): Promise<void>
  async acquireLock(path: string): Promise<Lock>
  async releaseLock(lock: Lock): Promise<void>
}
```

**Files:**
- `/src/lib/io/file-lock-manager.ts`
- `/src/lib/io/atomic-writes.ts`
- `/src/lib/io/append-only-log.ts`
- `/src/lib/io/crash-recovery.ts`

**Success Criteria:**
- ✅ File locks prevent concurrent writes
- ✅ Atomic writes prevent corruption
- ✅ Append-only log provides audit trail
- ✅ Crash recovery restores state

**Error Handling:**
- Lock acquisition timeout → Return error, caller retries
- Atomic write failed → Clean up temp file, return error
- Append failed → Log to stderr, return error
- Recovery failed → Log critical error, require manual intervention

---

### Task 4.3: GitHub API Rate Limit Coordinator (8 hours)

**Owner:** Backend Team
**Inputs:** Multiple agents calling GitHub API
**Outputs:** Coordinated rate limit handling
**Dependencies:** Tasks 0.1 (Coordination)
**Risk:** Medium (rate limit coordination)

**Description:**
Implement centralized rate limit coordinator:
- Track rate limit across all agents
- Use token bucket algorithm
- Distribute tokens fairly
- Handle rate limit errors

**Steps:**
1. Implement rate limit tracker:
   ```typescript
   class RateLimitTracker {
     private remaining: number
     private resetAt: Date

     async waitForToken(): Promise<void> {
       while (this.remaining <= 0) {
         const waitTime = this.resetAt.getTime() - Date.now()
         if (waitTime > 0) {
           await sleep(waitTime)
           // Refresh rate limit status
         }
       }
       this.remaining--
     }

     updateFromResponse(headers: Headers): void {
       this.remaining = parseInt(headers.get('X-RateLimit-Remaining') ?? '0')
       this.resetAt = new Date(headers.get('X-RateLimit-Reset') ?? '')
     }
   }
   ```
2. Implement token bucket:
   ```typescript
   class TokenBucket {
     private tokens: number
     private capacity: number
     private refillRate: number  // tokens per second

     async consume(tokens: number = 1): Promise<void> {
       while (this.tokens < tokens) {
         const waitTime = (tokens - this.tokens) / this.refillRate * 1000
         await sleep(waitTime)
         this.refill()
       }
       this.tokens -= tokens
     }

     private refill(): void {
       const now = Date.now()
       const elapsed = (now - this.lastRefill) / 1000
       this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRate)
       this.lastRefill = now
     }
   }
   ```
3. Implement distributed coordination:
   ```typescript
   class RateLimitCoordinator {
     private bucket: TokenBucket

     async acquire(agentId: string): Promise<void> {
       // Acquire distributed lock
       await this.lock.acquire('rate-limit')
       try {
         // Consume from token bucket
         await this.bucket.consume(1)
       } finally {
         // Release lock
         await this.lock.release('rate-limit')
       }
     }
   }
   ```

**I/O Contract:**
```typescript
class RateLimitCoordinator {
  async acquire(agentId: string): Promise<void>
  async release(agentId: string): Promise<void>
  updateLimit(remaining: number, resetAt: Date): void
}
```

**Files:**
- `/src/lib/github/rate-limit-coordinator.ts`
- `/src/lib/github/token-bucket.ts`

**Success Criteria:**
- ✅ Rate limit tracked across all agents
- ✅ Token bucket distributes fairly
- ✅ Rate limit errors handled gracefully
- ✅ Distributed coordination prevents races

**Error Handling:**
- Rate limit exceeded → Wait until reset, retry
- Coordination failed → Log warning, use local fallback
- Tracker desync → Refresh from GitHub API

---

### Task 4.4: Webhook Idempotency Manager (8 hours)

**Owner:** Backend Team
**Inputs:** GitHub webhooks
**Outputs:** Idempotent event processing
**Dependencies:** Tasks 2.4 (GitHub Integrator)
**Risk:** Medium (idempotency correctness)

**Description:**
Implement webhook idempotency:
- Track event IDs
- Detect duplicate events
- Implement deduplication window
- Replay detected events

**Steps:**
1. Implement event ID tracking:
   ```typescript
   class EventIdTracker {
     async seen(eventId: string): Promise<boolean> {
       const key = `webhook:event:${eventId}`
       const exists = await this.redis.get(key)
       if (exists) return true

       await this.redis.set(key, '1', { EX: 24 * 3600 })  // 24h TTL
       return false
     }
   }
   ```
2. Implement deduplication:
   ```typescript
   class WebhookIdempotencyManager {
     async process(event: GitHubEvent): Promise<void> {
       // Check if already processed
       if (await this.tracker.seen(event.id)) {
         this.logger.debug('Duplicate event', { eventId: event.id })
         return
       }

       // Process event
       await this.handler.handle(event)
     }
   }
   ```
3. Implement replay detection:
   ```typescript
   class ReplayDetector {
     async checkReplay(event: GitHubEvent): Promise<boolean> {
       // Check event timestamp
       const eventTime = new Date(event.payload.timestamp ?? event.headers['X-GitHub-Delivery'])
       const age = Date.now() - eventTime.getTime()

       // Events older than 24h are suspicious
       if (age > 24 * 3600 * 1000) {
         this.logger.warn('Very old event', { eventId: event.id, age })
         return true
       }

       return false
     }
   }
   ```

**I/O Contract:**
```typescript
class WebhookIdempotencyManager {
  async process(event: GitHubEvent): Promise<void>
  async isDuplicate(eventId: string): Promise<boolean>
  async markProcessed(eventId: string): Promise<void>
}
```

**Files:**
- `/src/lib/github/webhook-idempotency.ts`
- `/src/lib/github/replay-detector.ts`

**Success Criteria:**
- ✅ Duplicate events detected and skipped
- ✅ Idempotency window (24h) works
- ✅ Replay attacks detected
- ✅ Event tracking persists

**Error Handling:**
- Tracker check failed → Assume not seen, process event
- Mark processed failed → Log error, continue (risk of duplicate)
- Replay detected → Log warning, skip event

---

### Task 4.5: Cache Implementation (16 hours)

**Owner:** Backend Team
**Inputs:** State consistency requirements
**Outputs:** Working cache layer
**Dependencies:** Tasks 0.3 (Cache Coherency), 4.1 (State Consistency)
**Risk:** Medium (cache consistency)

**Description:**
Implement cache layer:
- In-memory cache (for development)
- Redis cache (for production)
- Cache invalidation
- Cache warming strategies

**Steps:**
1. Implement in-memory cache:
   ```typescript
   class InMemoryCache {
     private cache = new Map<string, { value: any; expiresAt: number }>()

     async get<T>(key: string): Promise<T | null> {
       const entry = this.cache.get(key)
       if (!entry) return null

       if (Date.now() > entry.expiresAt) {
         this.cache.delete(key)
         return null
       }

       return entry.value as T
     }

     async set<T>(key: string, value: T, ttl: number): Promise<void> {
       this.cache.set(key, {
         value,
         expiresAt: Date.now() + ttl * 1000,
       })
     }

     async delete(key: string): Promise<void> {
       this.cache.delete(key)
     }
   }
   ```
2. Implement Redis cache:
   ```typescript
   import { Redis } from '@upstash/redis'

   class RedisCache {
     private redis: Redis

     constructor() {
       this.redis = Redis.fromEnv()
     }

     async get<T>(key: string): Promise<T | null> {
       return await this.redis.get(key)
     }

     async set<T>(key: string, value: T, ttl: number): Promise<void> {
       await this.redis.set(key, value, { ex: ttl })
     }

     async delete(key: string): Promise<void> {
       await this.redis.del(key)
     }
   }
   ```
3. Implement cache invalidation:
   ```typescript
   class CacheInvalidator {
     async invalidateWorkflow(workflowId: string): Promise<void> {
       const keys = [
         `workflow:${workflowId}`,
         `workflow:${workflowId}:phases`,
         `workflow:${workflowId}:tasks`,
       ]
       await Promise.all(keys.map(key => this.cache.delete(key)))
     }

     async invalidatePattern(pattern: string): Promise<void> {
       // Use Redis SCAN for pattern matching
       // Delete all matching keys
     }
   }
   ```
4. Implement cache warming:
   ```typescript
   class CacheWarmer {
     async warmWorkflow(workflowId: string): Promise<void> {
       // Fetch workflow from GitHub
       const workflow = await this.github.getWorkflow(workflowId)
       // Populate cache
       await this.cache.set(`workflow:${workflowId}`, workflow, 60)
     }
   }
   ```

**I/O Contract:**
```typescript
interface Cache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}
```

**Files:**
- `/src/lib/cache/in-memory-cache.ts`
- `/src/lib/cache/redis-cache.ts`
- `/src/lib/cache/cache-invalidator.ts`
- `/src/lib/cache/cache-warmer.ts`

**Success Criteria:**
- ✅ Cache get/set/delete works
- ✅ Invalidation works
- ✅ Pattern invalidation works
- ✅ Cache warming improves performance

**Error Handling:**
- Cache get failed → Return null, fetch from backing store
- Cache set failed → Log warning, continue (backing store is source of truth)
- Invalidation failed → Log error, continue (stale cache better than no cache)

---

### Task 4.6: WebSocket Server Implementation (12 hours)

**Owner:** Backend Team
**Inputs:** Real-time update requirements
**Outputs:** WebSocket server
**Dependencies:** Tasks 1.6 (WebSocket Client)
**Risk:** Medium (WebSocket reliability)

**Description:**
Implement WebSocket server for real-time updates:
- Accept connections
- Broadcast events
- Handle reconnections
- Authentication

**Steps:**
1. Install WebSocket dependencies:
   ```bash
   npm install ws @types/ws
   ```
2. Create WebSocket server:
   ```typescript
   import { WebSocketServer } from 'ws'

   const wss = new WebSocketServer({ port: 8080 })

   wss.on('connection', (ws, req) => {
     // Authenticate connection
     const session = authenticate(req)

     // Subscribe to events
     subscribeToEvents(session, (event) => {
       ws.send(JSON.stringify(event))
     })

     ws.on('close', () => {
       // Unsubscribe from events
       unsubscribeFromEvents(session)
     })
   })
   ```
3. Implement event broadcasting:
   ```typescript
   class EventBroadcaster {
     private clients = new Map<string, WebSocket[]>()

     subscribe(clientId: string, ws: WebSocket): void {
       if (!this.clients.has(clientId)) {
         this.clients.set(clientId, [])
       }
       this.clients.get(clientId)!.push(ws)
     }

     broadcast(clientId: string, event: WebSocketEvent): void {
       const clients = this.clients.get(clientId) ?? []
       clients.forEach(ws => {
         if (ws.readyState === WebSocket.OPEN) {
           ws.send(JSON.stringify(event))
         }
       })
     }
   }
   ```
4. Implement authentication:
   ```typescript
   function authenticate(req: IncomingMessage): Session | null {
     const token = req.headers['authorization']
     if (!token) return null

     // Verify JWT token
     const session = verifyToken(token)
     return session
   }
   ```
5. Handle reconnections:
   ```typescript
   ws.on('close', () => {
     // Client will reconnect automatically
     // Server just waits for new connection
   })
   ```

**Files:**
- `/src/lib/websocket/server.ts`
- `/src/lib/websocket/event-broadcaster.ts`
- `/src/lib/websocket/auth.ts`

**Success Criteria:**
- ✅ WebSocket server accepts connections
- ✅ Events broadcast to clients
- ✅ Authentication works
- ✅ Reconnections work

**Error Handling:**
- Authentication failed → Close connection, log warning
- Broadcast failed → Log error, continue
- Connection lost → Client reconnects automatically

---

### Task 4.7: Error Handling & Dead Letter Queue (8 hours)

**Owner:** Backend Team
**Inputs:** Failed operations
**Outputs:** Dead letter queue, retry logic
**Dependencies:** All integration tasks
**Risk:** Low

**Description:**
Implement error handling and dead letter queue:
- Catch all errors
- Log errors with context
- Retry with exponential backoff
- Dead letter queue for failed operations

**Steps:**
1. Implement error handler:
   ```typescript
   class ErrorHandler {
     handle(error: Error, context: any): void {
       // Log error with context
       this.logger.error('Operation failed', { error, context })

       // Determine if retryable
       if (this.isRetryable(error)) {
         // Retry with backoff
         this.retry(context)
       } else {
         // Send to dead letter queue
         this.deadLetterQueue.add({ error, context })
       }
     }

     private isRetryable(error: Error): boolean {
       // Retry on network errors, rate limits, etc.
       // Don't retry on validation errors, auth errors
       return error instanceof RetryableError
     }
   }
   ```
2. Implement retry logic:
   ```typescript
   class RetryHandler {
     async retry<T>(
       fn: () => Promise<T>,
       maxRetries: number = 3
     ): Promise<T> {
       for (let attempt = 0; attempt < maxRetries; attempt++) {
         try {
           return await fn()
         } catch (error) {
           if (attempt === maxRetries - 1) throw error

           const backoff = Math.pow(2, attempt) * 1000  // 1s, 2s, 4s
           await sleep(backoff)
         }
       }
       throw new Error('Max retries exceeded')
     }
   }
   ```
3. Implement dead letter queue:
   ```typescript
   class DeadLetterQueue {
     async add(item: DeadLetterItem): Promise<void> {
       await this.redis.rpush('dlq', JSON.stringify(item))
     }

     async get(): Promise<DeadLetterItem | null> {
       const item = await this.redis.lpop('dlq')
       return item ? JSON.parse(item) : null
     }

     async process(): Promise<void> {
       while (true) {
         const item = await this.get()
         if (!item) break

         // Retry or alert human
         if (item.retries < 3) {
           await this.retry(item)
         } else {
           await this.alertHuman(item)
         }
       }
     }
   }
   ```

**Files:**
- `/src/lib/errors/error-handler.ts`
- `/src/lib/errors/retry-handler.ts`
- `/src/lib/errors/dead-letter-queue.ts`

**Success Criteria:**
- ✅ All errors caught and logged
- ✅ Retryable errors retry with backoff
- ✅ Non-retryable errors go to DLQ
- ✅ DLQ items processed or alerted

**Error Handling:**
- Retry failed → Send to DLQ
- DLQ full → Log critical error, alert human
- Alert failed → Log to stderr, send email

---

## Phase 5: Testing (40 hours)

### Task 5.1: Unit Testing (8 hours)

**Owner:** Backend Team
**Inputs:** All services and components
**Outputs:** Unit tests with >80% coverage
**Dependencies:** All implementation tasks
**Risk:** Low

**Description:**
Implement unit tests for all services and components:
- Test service logic
- Test component behavior
- Mock external dependencies
- Achieve >80% code coverage

**Steps:**
1. Set up Vitest:
   ```bash
   npm install -D vitest @vitest/ui
   ```
2. Create test files:
   ```typescript
   // workflow-engine.test.ts
   describe('WorkflowEngine', () => {
     it('should create workflow', async () => {
       const engine = new WorkflowEngine()
       const workflow = await engine.create({
         title: 'Test workflow',
         description: 'Test description',
         type: 'feature-request',
         priority: 'medium',
         workflowType: 'quick',
         userId: 'test-user',
       })
       expect(workflow.id).toBeDefined()
       expect(workflow.status).toBe('pending')
     })
   })
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Check coverage:
   ```bash
   npm test -- --coverage
   ```

**Files:**
- `/src/lib/services/**/*.test.ts`
- `/src/components/**/*.test.tsx`

**Success Criteria:**
- ✅ All services have unit tests
- ✅ All components have unit tests
- ✅ Code coverage > 80%

**Error Handling:**
- Test failed → Fix code or update test
- Coverage low → Add more tests

---

### Task 5.2: Integration Testing (8 hours)

**Owner:** Backend Team
**Inputs:** Multiple services
**Outputs:** Integration tests
**Dependencies:** All implementation tasks
**Risk:** Medium

**Description:**
Implement integration tests for service interactions:
- Test service A calling service B
- Test API endpoints
- Test database operations
- Test GitHub API integration (mocked)

**Steps:**
1. Set up test database:
   ```bash
   npm install -D @prisma/client
   ```
2. Create integration tests:
   ```typescript
   // workflow-integration.test.ts
   describe('Workflow Integration', () => {
     it('should create workflow and trigger agent', async () => {
       const workflow = await workflowEngine.create(input)
       expect(workflow.githubIssue).toBeDefined()
       // Verify agent was triggered
     })
   })
   ```

**Files:**
- `/src/integration/**/*.test.ts`

**Success Criteria:**
- ✅ All service integrations tested
- ✅ All API endpoints tested
- ✅ Database operations tested

**Error Handling:**
- Test failed → Fix integration issue
- Database error → Clean up test data

---

### Task 5.3: Performance Testing (6 hours)

**Owner:** Backend Team
**Inputs:** Application
**Outputs:** Performance test results
**Dependencies:** All implementation tasks
**Risk:** Low

**Description:**
Implement performance tests:
- Load test API endpoints
- Test concurrent requests
- Measure response times
- Identify bottlenecks

**Steps:**
1. Install load testing tool:
   ```bash
   npm install -D autocannon
   ```
2. Create load tests:
   ```typescript
   // load-test.js
   import autocannon from 'autocannon'

   autocannon({
     url: 'http://localhost:3000/api/workflows',
     connections: 100,
     duration: 30,
   }, (err, result) => {
     console.log(result)
   })
   ```
3. Run tests and analyze results

**Files:**
- `/tests/load/**/*.js`

**Success Criteria:**
- ✅ API handles 100 concurrent requests
- ✅ Response time < 500ms (p95)
- ✅ No memory leaks

**Error Handling:**
- Performance issue → Optimize code
- Memory leak → Fix leak

---

### Task 5.4: Security Testing (6 hours)

**Owner:** Backend Team
**Inputs:** Application
**Outputs:** Security test results
**Dependencies:** All implementation tasks
**Risk:** Low

**Description:**
Implement security tests:
- Test authentication
- Test authorization
- Test input validation
- Test for XSS, SQL injection, etc.

**Steps:**
1. Install security testing tools:
   ```bash
   npm install -D zapromise
   ```
2. Create security tests:
   ```typescript
   // security.test.ts
   describe('Security', () => {
     it('should reject unauthenticated requests', async () => {
       const response = await fetch('/api/workflows', {
         method: 'POST',
         body: '{}',
       })
       expect(response.status).toBe(401)
     })

     it('should sanitize HTML input', async () => {
       const response = await workflowEngine.create({
         description: '<script>alert("xss")</script>',
       })
       expect(response.description).not.toContain('<script>')
     })
   })
   ```

**Files:**
- `/src/security/**/*.test.ts`

**Success Criteria:**
- ✅ All authentication tests pass
- ✅ All authorization tests pass
- ✅ All input validation tests pass
- ✅ No XSS vulnerabilities
- ✅ No SQL injection vulnerabilities

**Error Handling:**
- Security test failed → Fix vulnerability
- Authorization bypass → Fix permission check

---

### Task 5.5: End-to-End Testing (8 hours)

**Owner:** Backend Team
**Inputs:** Application
**Outputs:** E2E tests
**Dependencies:** All implementation tasks
**Risk:** Medium

**Description:**
Implement end-to-end tests:
- Test user workflows
- Test agent execution
- Test GitHub integration
- Use Playwright

**Steps:**
1. Install Playwright:
   ```bash
   npm install -D @playwright/test
   ```
2. Create E2E tests:
   ```typescript
   // e2e/workflow.spec.ts
   import { test, expect } from '@playwright/test'

   test('submit workflow and monitor progress', async ({ page }) => {
     await page.goto('/workflows/submit')
     await page.fill('[name="title"]', 'Test workflow')
     await page.fill('[name="description"]', 'Test description')
     await page.click('button[type="submit"]')

     await expect(page).toHaveURL(/\/workflows\/[^/]+$/)
     await expect(page.locator('[data-testid="workflow-status"]')).toHaveText('running')
   })
   ```
3. Run tests:
   ```bash
   npx playwright test
   ```

**Files:**
- `/e2e/**/*.spec.ts`

**Success Criteria:**
- ✅ All user workflows tested
- ✅ All agent flows tested
- ✅ GitHub integration tested

**Error Handling:**
- Test flaky → Add explicit waits
- Test failed → Debug and fix

---

### Task 5.6: Agent Simulation Testing (4 hours)

**Owner:** Backend Team
**Inputs:** Agent layer
**Outputs:** Agent simulation tests
**Dependencies:** Tasks 3.0-3.5 (Agent Layer)
**Risk:** Low

**Description:**
Implement agent simulation tests:
- Simulate agent execution
- Test agent handoffs
- Test agent failures
- Test checkpoint recovery

**Steps:**
1. Create agent simulator:
   ```typescript
   class AgentSimulator {
     async simulate(agentType: string, task: string): Promise<AgentResult> {
       // Simulate agent execution without actually calling Claude API
       return {
         success: true,
         artifacts: [],
         duration: 1000,
       }
     }
   }
   ```
2. Create simulation tests:
   ```typescript
   describe('Agent Simulation', () => {
     it('should simulate agent execution', async () => {
       const simulator = new AgentSimulator()
       const result = await simulator.simulate('ultra:architect', 'test task')
       expect(result.success).toBe(true)
     })
   })
   ```

**Files:**
- `/src/agents/simulator.ts`
- `/src/agents/**/*.simulation.test.ts`

**Success Criteria:**
- ✅ All agent types simulated
- ✅ Agent handoffs tested
- ✅ Agent failures tested

**Error Handling:**
- Simulation failed → Fix simulator
- Handoff failed → Fix handoff logic

---

## Phase 6: Deployment & Operations (32 hours)

### Task 6.0: Deployment Strategy (8 hours)

**Owner:** DevOps Team
**Inputs:** Application
**Outputs:** Deployment configuration
**Dependencies:** All implementation tasks
**Risk:** Medium

**Description:**
Implement deployment strategy:
- Docker containerization
- Kubernetes manifests (optional)
- CI/CD pipeline
- Environment configuration

**Steps:**
1. Create Dockerfile:
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```
2. Create docker-compose.yml:
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - GITHUB_TOKEN=${GITHUB_TOKEN}
       depends_on:
         - redis
     redis:
       image: redis:7-alpine
   ```
3. Create CI/CD pipeline:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm test
         - run: npm run build
         - run: docker build -t app .
         - run: docker push app
   ```

**Files:**
- `Dockerfile`
- `docker-compose.yml`
- `.github/workflows/deploy.yml`

**Success Criteria:**
- ✅ Application containerizes
- ✅ Docker compose works locally
- ✅ CI/CD pipeline deploys

**Error Handling:**
- Build failed → Fix Dockerfile
- Deploy failed → Check logs, rollback

---

### Task 6.1: Monitoring & Alerting (8 hours)

**Owner:** DevOps Team
**Inputs:** Application
**Outputs:** Monitoring dashboard, alerts
**Dependencies:** Task 6.0 (Deployment)
**Risk:** Low

**Description:**
Implement monitoring and alerting:
- Metrics collection (Prometheus)
- Logging (ELK stack)
- Tracing (OpenTelemetry)
- Alerting (PagerDuty, Slack)

**Steps:**
1. Install monitoring dependencies:
   ```bash
   npm install prom-client @opentelemetry/api
   ```
2. Create metrics collector:
   ```typescript
   import promClient from 'prom-client'

   const workflowCreatedCounter = new promClient.Counter({
     name: 'workflows_created_total',
     help: 'Total number of workflows created',
   })

   const workflowDurationHistogram = new promClient.Histogram({
     name: 'workflow_duration_seconds',
     help: 'Workflow duration in seconds',
     buckets: [60, 300, 900, 3600],
   })
   ```
3. Create metrics endpoint:
   ```typescript
   // /api/metrics
   export async function GET() {
     return new Response(await promClient.register.metrics(), {
       headers: { 'Content-Type': 'text/plain' },
     })
   }
   ```
4. Set up alerts:
   ```typescript
   // Alert on high error rate
   if (errorRate > 0.05) {
     await alert('High error rate detected', { errorRate })
   }
   ```

**Files:**
- `/src/lib/monitoring/metrics.ts`
- `/src/app/api/metrics/route.ts`

**Success Criteria:**
- ✅ Metrics collected
- ✅ Metrics endpoint works
- ✅ Alerts configured

**Error Handling:**
- Metrics collection failed → Log error, continue
- Alert failed → Log error, send email

---

### Task 6.2: Logging & Observability (8 hours)

**Owner:** DevOps Team
**Inputs:** Application
**Outputs:** Structured logging, traces
**Dependencies:** Task 6.1 (Monitoring)
**Risk:** Low

**Description:**
Implement structured logging and tracing:
- Structured JSON logs
- Log levels (DEBUG, INFO, WARN, ERROR)
- Distributed tracing
- Correlation IDs

**Steps:**
1. Install logging dependencies:
   ```bash
   npm install pino @opentelemetry/node
   ```
2. Create logger:
   ```typescript
   import pino from 'pino'

   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     formatters: {
       level: (label) => ({ level: label }),
     },
     timestamp: pino.stdTimeFunctions.isoTime,
   })
   ```
3. Add correlation IDs:
   ```typescript
   import { AsyncLocalStorage } from 'async_hooks'

   const contextStorage = new AsyncLocalStorage<{ correlationId: string }>()

   export function withContext<T>(fn: () => T): T {
     return contextStorage.run({ correlationId: randomUUID() }, fn)
   }

   export function getContext() {
     return contextStorage.getStore()
   }
   ```
4. Add distributed tracing:
   ```typescript
   import { trace } from '@opentelemetry/api'

   const tracer = trace.getTracer('workflow-engine')

   async function createWorkflow(input: WorkflowCreateInput) {
     const span = tracer.startSpan('createWorkflow')
     try {
       // ... workflow creation logic
       span.end()
     } catch (error) {
       span.recordException(error)
       span.end()
       throw error
     }
   }
   ```

**Files:**
- `/src/lib/logging/logger.ts`
- `/src/lib/tracing/tracer.ts`

**Success Criteria:**
- ✅ Logs are structured JSON
- ✅ Correlation IDs link requests
- ✅ Traces show request flow

**Error Handling:**
- Logger failed → Log to stderr
- Tracer failed → Continue without tracing

---

### Task 6.3: Backup & Disaster Recovery (4 hours)

**Owner:** DevOps Team
**Inputs:** Production data
**Outputs:** Backup strategy, recovery procedures
**Dependencies:** Task 6.0 (Deployment)
**Risk:** Low

**Description:**
Implement backup and disaster recovery:
- Database backups
- State file backups
- Recovery procedures
- Runbooks

**Steps:**
1. Create backup script:
   ```bash
   #!/bin/bash
   # backup.sh

   # Backup state files
   tar -czf state-$(date +%Y%m%d).tar.gz .ultra/state/

   # Backup Redis
   redis-cli SAVE

   # Upload to S3
   aws s3 cp state-$(date +%Y%m%d).tar.gz s3://backups/
   ```
2. Create recovery procedure:
   ```bash
   #!/bin/bash
   # recover.sh

   # Download from S3
   aws s3 cp s3://backups/state-$(date +%Y%m%d).tar.gz .

   # Extract
   tar -xzf state-$(date +%Y%m%d).tar.gz

   # Restart services
   docker-compose restart
   ```
3. Document runbooks:
   - How to restore from backup
   - How to handle failed deployments
   - How to scale up/down

**Files:**
- `/scripts/backup.sh`
- `/scripts/recover.sh`
- `/docs/runbooks.md`

**Success Criteria:**
- ✅ Backups run automatically
- ✅ Recovery tested
- ✅ Runbooks documented

**Error Handling:**
- Backup failed → Alert admin, retry
- Recovery failed → Alert admin, try older backup

---

### Task 6.4: Runbooks & Troubleshooting (4 hours)

**Owner:** DevOps Team
**Inputs:** Application
**Outputs:** Runbooks, troubleshooting guides
**Dependencies:** All deployment tasks
**Risk:** Low

**Description:**
Create runbooks and troubleshooting guides:
- Common issues and solutions
- Debugging procedures
- Performance tuning
- Scaling procedures

**Steps:**
1. Create runbooks:
   ```markdown
   # Runbook: Workflow Stuck in "Running" State

   ## Symptoms
   - Workflow status is "running" but not progressing
   - Agent heartbeat not updating

   ## Diagnosis
   1. Check agent status: GET /api/agents/{id}
   2. Check agent logs: kubectl logs {pod-name}
   3. Check workflow state: GET /api/workflows/{id}

   ## Resolution
   1. If agent failed: Reassign task to another agent
   2. If agent stale: Restart agent
   3. If workflow state corrupted: Restore from checkpoint

   ## Prevention
   - Set up alerts for stale agents
   - Implement health checks
   ```
2. Create troubleshooting guide:
   ```markdown
   # Troubleshooting Guide

   ## High Memory Usage
   - Check for memory leaks in agents
   - Restart agents periodically
   - Increase memory limits

   ## Slow API Responses
   - Check database query performance
   - Add indexes to slow queries
   - Enable caching

   ## GitHub API Rate Limits
   - Check rate limit usage: GET /api/github/rate-limit
   - Implement request queuing
   - Add caching for GitHub data
   ```

**Files:**
- `/docs/runbooks.md`
- `/docs/troubleshooting.md`

**Success Criteria:**
- ✅ Runbooks cover common issues
- ✅ Troubleshooting guide is comprehensive
- ✅ Team trained on procedures

**Error Handling:**
- Issue not in runbook → Escalate to engineering
- Resolution failed → Escalate to engineering

---

## Summary

**Total Tasks:** 90 (was 56 in v1)
**Total Estimated Effort:** ~748 hours (~10-12 weeks with 1-2 developers)

**Timeline Breakdown:**
- Phase 0: Codebase Audit (8h)
- Phase 0.5: Coordination & Coherency (28h)
- Phase 1: Frontend Components (174h)
- Phase 2: Backend Services (116h)
- Phase 3: Agent Layer (132h)
- Phase 4: Integrations (116h)
- Phase 5: Testing (40h)
- Phase 6: Deployment & Operations (32h)

**Dependencies to Install:**
```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.13",
    "@auth/core": "^5.0.0-beta.13",
    "zod": "^3.22.4",
    "isomorphic-dompurify": "^2.11.0",
    "@upstash/ratelimit": "^1.0.0",
    "@upstash/redis": "^1.25.1",
    "ws": "^8.16.0",
    "pino": "^8.17.2",
    "prom-client": "^15.1.0",
    "@opentelemetry/api": "^1.7.0",
    "@opentelemetry/node": "^0.47.0"
  },
  "devDependencies": {
    "vitest": "^1.2.2",
    "@vitest/ui": "^1.2.2",
    "@playwright/test": "^1.41.2",
    "autocannon": "^7.12.0",
    "@prisma/client": "^5.9.1"
  }
}
```

**Critical Path:**
1. Phase 0 (Codebase Audit) → Phase 0.5 (Coordination) → Phase 2 (Backend Services) → Phase 3 (Agent Layer) → Phase 4 (Integrations) → Phase 5 (Testing) → Phase 6 (Deployment)

**Parallel Work:**
- Phase 1 (Frontend) can run in parallel with Phase 2 (Backend) after Phase 0
- Phase 5 (Testing) can start as soon as components are implemented

**Risk Mitigation:**
- Distributed coordination (Phase 0.5) prevents race conditions
- State consistency manager (Phase 4.1) ensures data integrity
- Comprehensive testing (Phase 5) catches issues early
- Monitoring & alerting (Phase 6.1) detects production issues

**Success Metrics:**
- User can submit workflow in < 2 minutes
- Intent detection accuracy > 90%
- Real-time updates visible via WebSocket
- All security vulnerabilities addressed
- >80% test coverage
- Production-ready with monitoring

---

**End of Implementation Plan v2**
