# Platform-Agnostic Control Center Dashboard - Implementation Plan v1

**Project:** UltraPilot Dashboard Architecture Redesign
**Date:** 2026-03-06
**Version:** 1.0
**Author:** ultra:planner
**Status:** DRAFT - Pending Multi-Perspective Review

---

## 1. Overview

This implementation plan transforms the existing UltraPilot Dashboard from a development-focused tool into a **holistic, platform-agnostic control center** supporting Development, Trading, and Healthcare platforms with enterprise-grade compliance, scalability, and security.

### 1.1 Scope Summary

| Domain | Current State | Target State |
|--------|---------------|--------------|
| Platform Support | GitHub/Development only | Development, Trading, Healthcare, Custom (pluggable) |
| Organization | Single-org hardcoded | Multi-org with switching and cross-org views |
| Compliance | None | HIPAA, FINRA/SOX, SOC2 frameworks |
| Real-time | Polling-based | WebSocket with <500ms latency |
| Scalability | Single-user design | 100+ concurrent workflows, 1000+ agents |
| Authentication | Basic GitHub OAuth | MFA, RBAC, ABAC |

### 1.2 Implementation Phases Summary

```
Phase 1: Platform Abstraction (Week 1-4)      [CORE FOUNDATION]
Phase 2: Multi-Organization Support (Week 5-7) [TEAM COORDINATION]
Phase 3: Enhanced Compliance (Week 8-11)      [REGULATORY]
Phase 4: Scalability & Real-Time (Week 12-14) [PERFORMANCE]
Phase 5: Advanced Collaboration (Week 15-16)  [TEAM FEATURES]
```

---

## 2. File Structure

```
src/
├── app/
│   ├── dashboard/
│   │   ├── control/              # Existing: Workflow submission (ACTIVE)
│   │   ├── workflows/            # Existing: Workflow list
│   │   ├── agents/               # Existing: Agent status
│   │   ├── platforms/            # NEW: Multi-platform overview
│   │   ├── repos/                # Existing: Repository management
│   │   ├── traces/               # Existing: Audit trail
│   │   ├── compliance/           # NEW: Compliance reports
│   │   ├── team/                 # NEW: Team collaboration
│   │   ├── settings/             # Existing: Configuration
│   │   └── admin/                # NEW: System administration
│   ├── api/
│   │   ├── v2/                   # NEW: v2 API with platform abstraction
│   │   │   ├── workflows/
│   │   │   ├── platforms/
│   │   │   ├── agents/
│   │   │   ├── repos/
│   │   │   ├── audit/
│   │   │   ├── teams/
│   │   │   ├── compliance/
│   │   │   └── realtime/         # WebSocket endpoint
│   │   └── webhooks/             # Platform webhook handlers
│   └── layout.tsx                # Root layout with providers
│
├── components/
│   ├── dashboard/
│   │   └── ...existing...
│   ├── platforms/                # NEW: Platform-specific UI
│   │   ├── platform-switcher.tsx
│   │   ├── platform-dashboard.tsx
│   │   └── compliance-badge.tsx
│   ├── realtime/                 # NEW: Real-time components
│   │   ├── realtime-status.tsx
│   │   ├── websocket-provider.tsx
│   │   └── event-stream.tsx
│   ├── collaboration/            # NEW: Team features
│   │   ├── activity-feed.tsx
│   │   ├── mention-input.tsx
│   │   └── shared-workspace.tsx
│   └── ui/                       # Existing: shadcn components
│
├── contexts/
│   ├── org-context.tsx           # Existing: Enhance for multi-org
│   ├── project-context.tsx       # Existing: Keep
│   ├── platform-context.tsx      # NEW: Platform switching
│   ├── user-context.tsx          # NEW: User auth and roles
│   └── realtime-context.tsx      # NEW: WebSocket state
│
├── hooks/
│   ├── ...existing...
│   ├── use-platform-data.ts      # NEW: Platform data fetching
│   ├── use-compliance.ts         # NEW: Compliance checks
│   ├── use-websocket.ts          # NEW: Real-time connection
│   └── use-workflow-control.ts   # NEW: Workflow actions
│
├── lib/
│   ├── platforms/                # NEW: Platform adapters
│   │   ├── registry.ts           # Platform registration
│   │   ├── base-adapter.ts       # Abstract base class
│   │   ├── development.ts        # GitHub adapter
│   │   ├── trading.ts            # Trading platform adapter
│   │   ├── healthcare.ts         # Healthcare/FHIR adapter
│   │   └── custom.ts             # Custom platform template
│   ├── compliance/               # NEW: Compliance frameworks
│   │   ├── hipaa.ts
│   │   ├── finra.ts
│   │   ├── soc2.ts
│   │   └── unified-audit.ts
│   ├── realtime/                 # NEW: Real-time infrastructure
│   │   ├── websocket-server.ts
│   │   ├── event-bus.ts
│   │   └── broadcast.ts
│   ├── services/
│   │   ├── workflow-engine.ts    # Existing: Enhance
│   │   ├── agent-service.ts      # NEW: Agent orchestration
│   │   └── team-service.ts       # NEW: Team management
│   └── db.ts                     # Existing: Extend schema
│
└── types/
    ├── api.ts                    # Existing: Extend
    ├── github.ts                 # Existing: Keep
    ├── platforms.ts              # NEW: Platform types
    ├── compliance.ts             # NEW: Compliance types
    ├── realtime.ts               # NEW: WebSocket types
    └── team.ts                   # NEW: Collaboration types
```

---

## 3. Component Architecture

### 3.1 New Page Components

```typescript
// /dashboard/platforms/page.tsx
interface PlatformsPageProps {
  searchParams: { platform?: string }
}
// Lists all platforms, shows platform health, allows switching

// /dashboard/compliance/page.tsx
interface CompliancePageProps {
  searchParams: {
    platform?: PlatformType
    dateRange?: string
    reportType?: ComplianceReportType
  }
}
// Unified compliance reports across platforms

// /dashboard/team/page.tsx
interface TeamPageProps {
  searchParams: { org?: string; team?: string }
}
// Team workload, assignment, collaboration

// /dashboard/admin/page.tsx
interface AdminPageProps {}
// System configuration, platform registration, user management
```

### 3.2 Core Component Hierarchy

```
DashboardLayout
├── TopNavigation
│   ├── PlatformSwitcher (NEW)
│   ├── OrgSwitcher (enhanced)
│   ├── UserMenu
│   └── ComplianceBadge (NEW)
├── SidebarNav
│   ├── Platform specific menu (dynamic)
│   └── Common menu items
└── ContentArea
    ├── RealTimeStatus (NEW - live HUD)
    └── PageContent
```

### 3.3 Real-Time Status Component

```typescript
// components/realtime/realtime-status.tsx
interface RealTimeStatusProps {
  compact?: boolean  // Toggle between focused/full view
  showAgents?: boolean
  showMetrics?: boolean
}

interface RealTimeStatusData {
  currentPhase: number
  ralphIteration: number
  ralphMaxIterations: number
  qaCycle: number
  qaMaxCycles: number
  status: 'running' | 'paused' | 'completed' | 'error'
  contextUsage: number  // percentage
  activeTasks: number
  totalTasks: number
  activeAgents: number

  // Full view only
  agents?: Array<{
    id: string
    name: string
    tier: 'haiku' | 'sonnet' | 'opus'
    status: 'idle' | 'busy' | 'error'
    currentTask?: string
    duration: string
  }>
}
```

### 3.4 Platform Switcher Component

```typescript
// components/platforms/platform-switcher.tsx
interface PlatformSwitcherProps {
  currentPlatform: PlatformType
  platforms: Platform[]
  onPlatformChange: (platform: PlatformType) => void
}

interface Platform {
  id: string
  name: string
  type: PlatformType
  icon: string
  health: 'healthy' | 'degraded' | 'down'
  compliance: ComplianceStatus
}
```

---

## 4. API Surface

### 4.1 REST API Endpoints (v2)

```typescript
// ============================================================================
// WORKFLOWS
// ============================================================================

// POST /api/v2/workflows/execute
interface ExecuteWorkflowRequest {
  platform: PlatformType
  type: WorkflowType
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string  // User or team
  complianceLevel?: 'standard' | 'hipaa' | 'finra' | 'soc2'
}

interface ExecuteWorkflowResponse {
  workflowId: string
  status: WorkflowStatus
  phase: WorkflowPhase
  estimatedCompletion?: string
  complianceRequirements?: ComplianceRequirement[]
}

// GET /api/v2/workflows
interface ListWorkflowsRequest {
  platform?: PlatformType
  status?: WorkflowStatus
  phase?: WorkflowPhase
  assignee?: string
  page?: number
  per_page?: number
}

// GET /api/v2/workflows/:id
interface GetWorkflowResponse {
  workflow: Workflow
  trace: WorkflowTrace
  agents: AgentActivity[]
  compliance: ComplianceStatus
}

// PUT /api/v2/workflows/:id/cancel
// PUT /api/v2/workflows/:id/pause
// PUT /api/v2/workflows/:id/resume
// GET /api/v2/workflows/:id/trace

// ============================================================================
// PLATFORMS
// ============================================================================

// GET /api/v2/platforms
interface ListPlatformsResponse {
  platforms: Platform[]
  currentPlatform: PlatformType
  userPermissions: PlatformPermissions[]
}

// GET /api/v2/platforms/:id
interface GetPlatformResponse {
  platform: Platform
  health: PlatformHealth
  compliance: ComplianceRequirements
  statistics: PlatformStatistics
}

// POST /api/v2/platforms/register
interface RegisterPlatformRequest {
  id: string
  name: string
  type: PlatformType
  authConfig: AuthConfig
  complianceRequirements: ComplianceRequirements
  webhookConfig: WebhookConfig
  customSchema?: Record<string, unknown>
}

// PUT /api/v2/platforms/:id/config

// ============================================================================
// AGENTS
// ============================================================================

// GET /api/v2/agents
interface ListAgentsResponse {
  agents: Agent[]
  statistics: AgentStatistics
}

// GET /api/v2/agents/:id/status
interface GetAgentStatusResponse {
  agent: Agent
  currentTask?: AgentTask
  performance: AgentPerformance
  health: AgentHealth
}

// GET /api/v2/agents/:id/performance
interface GetAgentPerformanceResponse {
  metrics: AgentPerformanceMetrics
  history: PerformanceHistory[]
}

// POST /api/v2/agents/:id/assign
interface AssignAgentRequest {
  taskId: string
  workflowId: string
  priority?: Priority
}

// ============================================================================
// REPOSITORIES
// ============================================================================

// GET /api/v2/repos
interface ListReposRequest {
  platform?: PlatformType
  org?: string
  health?: RepoHealthStatus
  page?: number
  per_page?: number
}

// GET /api/v2/repos/:id
// GET /api/v2/repos/:id/health
// POST /api/v2/repos/:id/sync

// ============================================================================
// AUDIT & COMPLIANCE
// ============================================================================

// GET /api/v2/audit
interface QueryAuditRequest {
  platform?: PlatformType
  eventType?: AuditEventType
  actor?: string
  dateRange?: DateRange
  complianceTag?: string
  page?: number
  per_page?: number
}

interface QueryAuditResponse {
  events: AuditEvent[]
  total: number
  hasMore: boolean
}

// GET /api/v2/compliance
interface GetComplianceReportRequest {
  platform: PlatformType
  reportType: ComplianceReportType
  dateRange: DateRange
}

interface GetComplianceReportResponse {
  report: ComplianceReport
  status: 'compliant' | 'non-compliant' | 'pending'
  violations: ComplianceViolation[]
  recommendations: string[]
}

// ============================================================================
// TEAMS
// ============================================================================

// GET /api/v2/teams
interface ListTeamsResponse {
  teams: Team[]
  userTeams: Team[]
}

// GET /api/v2/teams/:id
interface GetTeamResponse {
  team: Team
  members: TeamMember[]
  workload: TeamWorkload
  activeWorkflows: Workflow[]
}

// PUT /api/v2/teams/:id/assign
interface AssignWorkflowRequest {
  workflowId: string
  assignee: string
  priority?: Priority
}

// GET /api/v2/teams/:id/workload

// ============================================================================
// REAL-TIME
// ============================================================================

// GET /api/v2/realtime/stream (WebSocket upgrade)
interface WebSocketMessage {
  type: RealTimeEventType
  data: unknown
  timestamp: string
}

// POST /api/v2/realtime/subscribe
interface SubscribeRequest {
  events: RealTimeEventType[]
  filters?: SubscriptionFilter
}
```

### 4.2 WebSocket Events

```typescript
type RealTimeEventType =
  | 'workflow.started'
  | 'workflow.phase_complete'
  | 'workflow.completed'
  | 'workflow.failed'
  | 'workflow.paused'
  | 'agent.assigned'
  | 'agent.activity'
  | 'agent.error'
  | 'qa.cycle_start'
  | 'qa.cycle_complete'
  | 'compliance.alert'
  | 'audit.log_entry'
  | 'platform.health_change'
  | 'team.activity'

interface RealTimeEvent {
  type: RealTimeEventType
  id: string
  timestamp: string
  platform: PlatformType
  data: unknown
}

// Example events
interface WorkflowStartedEvent extends RealTimeEvent {
  type: 'workflow.started'
  data: {
    workflowId: string
    title: string
    platform: PlatformType
    phase: WorkflowPhase
    assignee?: string
  }
}

interface AgentActivityEvent extends RealTimeEvent {
  type: 'agent.activity'
  data: {
    agentId: string
    workflowId: string
    activity: string
    progress: number
    eta?: string
  }
}

interface ComplianceAlertEvent extends RealTimeEvent {
  type: 'compliance.alert'
  data: {
    severity: 'critical' | 'high' | 'medium' | 'low'
    platform: PlatformType
    requirement: string
    message: string
    actionRequired: boolean
  }
}
```

---

## 5. Data Models

### 5.1 Core TypeScript Interfaces

```typescript
// types/platforms.ts

export type PlatformType = 'development' | 'trading' | 'healthcare' | 'custom'

export interface Platform {
  id: string
  name: string
  type: PlatformType
  config: PlatformConfig
  compliance: ComplianceRequirements
  integrations: Integration[]
  health: PlatformHealth
  statistics: PlatformStatistics
}

export interface PlatformConfig {
  apiEndpoints: ApiEndpointConfig[]
  authScheme: AuthScheme
  dataRetention: DataRetentionPolicy
  webhooks: WebhookConfig
  customSchema?: Record<string, unknown>
}

export interface PlatformHealth {
  status: 'healthy' | 'degraded' | 'down'
  lastCheck: string
  uptime: number  // percentage
  dependencies: HealthCheck[]
}

export interface PlatformStatistics {
  totalWorkflows: number
  activeWorkflows: number
  completedWorkflows: number
  failedWorkflows: number
  averageCycleTime: number  // minutes
  agentUtilization: number  // percentage
}

export interface ComplianceRequirements {
  frameworks: ComplianceFramework[]
  dataClassification: DataClassification[]
  auditRetention: number  // days
  encryptionRequired: boolean
  mfaRequired: boolean
}

export type ComplianceFramework =
  | 'none'
  | 'hipaa'
  | 'finra'
  | 'sox'
  | 'soc2'
  | 'iso27001'
  | 'custom'

export interface DataClassification {
  type: string
  level: 'public' | 'internal' | 'confidential' | 'restricted'
  handling: string[]
}

// types/compliance.ts

export interface AuditEvent {
  id: string
  timestamp: string
  platform: PlatformType
  eventType: AuditEventType
  actor: string
  action: string
  resource: string
  outcome: 'success' | 'failure'
  details: Record<string, unknown>
  complianceTag?: string
  immutable: boolean
}

export type AuditEventType =
  | 'workflow.created'
  | 'workflow.started'
  | 'workflow.completed'
  | 'agent.assigned'
  | 'data.accessed'
  | 'data.modified'
  | 'data.exported'
  | 'compliance.violation'
  | 'user.authenticated'
  | 'permission.granted'
  | 'permission.revoked'

export interface ComplianceReport {
  id: string
  platform: PlatformType
  framework: ComplianceFramework
  period: DateRange
  status: 'compliant' | 'non-compliant' | 'pending'
  violations: ComplianceViolation[]
  metrics: ComplianceMetrics
  generatedAt: string
}

export interface ComplianceViolation {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  requirement: string
  description: string
  affectedResource: string
  remediation: string
  status: 'open' | 'in-progress' | 'resolved'
}

export interface ComplianceMetrics {
  totalEvents: number
  compliantEvents: number
  nonCompliantEvents: number
  complianceRate: number  // percentage
  highSeverityViolations: number
  openViolations: number
}

export interface ComplianceReportType {
  hipaa: {
    phiAccessLog: PhiAccessEntry[]
    baaTracking: BaaStatus[]
    encryptionVerification: EncryptionStatus[]
  }
  finra: {
    tradeExecutionLog: TradeExecution[]
    communicationsRecording: CommunicationRecord[]
    riskLimitChecks: RiskLimitCheck[]
    surveillanceAlerts: SurveillanceAlert[]
  }
  soc2: {
    changeManagement: ChangeRecord[]
    accessReviews: AccessReview[]
    vulnerabilityScans: VulnerabilityReport[]
  }
}

// types/realtime.ts

export interface WebSocketConnection {
  id: string
  userId: string
  orgId: string
  connectedAt: string
  subscriptions: RealTimeEventType[]
  filters: SubscriptionFilter
}

export interface SubscriptionFilter {
  platforms?: PlatformType[]
  workflows?: string[]
  teams?: string[]
  severity?: 'critical' | 'high' | 'medium' | 'low'
}

export interface RealTimeState {
  connected: boolean
  connecting: boolean
  error?: string
  lastEvent?: RealTimeEvent
  subscriptions: RealTimeEventType[]
}

// types/team.ts

export interface Team {
  id: string
  name: string
  organization: string
  parentTeamId?: string
  subteams: string[]
  members: TeamMember[]
  permissions: TeamPermissions
  workload: TeamWorkload
  settings: TeamSettings
}

export interface TeamMember {
  userId: string
  username: string
  role: TeamRole
  permissions: string[]
  joinedAt: string
  status: 'active' | 'away' | 'offline'
}

export type TeamRole =
  | 'admin'
  | 'lead'
  | 'member'
  | 'viewer'

export interface TeamPermissions {
  canManageMembers: boolean
  canAssignWorkflows: boolean
  canViewAllWorkflows: boolean
  canManageSettings: boolean
  canApproveWorkflows: boolean
}

export interface TeamWorkload {
  activeTasks: number
  totalCapacity: number
  utilizationRate: number
  queuedWorkflows: number
  averageCompletionTime: number  // minutes
  membersWorkload: MemberWorkload[]
}

export interface MemberWorkload {
  userId: string
  activeTasks: number
  capacity: number
  utilization: number
  averageTaskDuration: number
}

export interface TeamSettings {
  autoAssignment: boolean
  notificationPreferences: NotificationPreferences
  workingHours: WorkingHours
  timezone: string
}

export interface NotificationPreferences {
  workflowAssigned: boolean
  workflowCompleted: boolean
  complianceAlert: boolean
  teammateMention: boolean
  channels: ('email' | 'slack' | 'dashboard' | 'sms')[]
}

export interface WorkingHours {
  start: string  // HH:MM
  end: string    // HH:MM
  days: number[]  // 0-6 (Sunday-Saturday)
  timezone: string
}

// Extended workflow types (extend existing api.ts)

export interface Workflow {
  id: string
  platform: PlatformType
  type: WorkflowType
  phase: WorkflowPhase
  status: WorkflowStatus
  priority: Priority
  agents: string[]
  repository?: string
  organization: string
  team?: string
  assignee?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  trace: WorkflowTrace
  compliance: ComplianceStatus
  dependencies: string[]  // workflow IDs
  labels: string[]
}

export type WorkflowPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type WorkflowStatus =
  | 'pending'
  | 'active'
  | 'paused'
  | 'completed'
  | 'blocked'
  | 'failed'
  | 'cancelled'

export type Priority = 'low' | 'medium' | 'high' | 'critical'

export type WorkflowType =
  | 'feature-request'
  | 'bug-report'
  | 'code-review'
  | 'trade-execution'
  | 'patient-workflow'
  | 'compliance-review'
  | 'custom'

export interface WorkflowTrace {
  id: string
  workflowId: string
  events: TraceEvent[]
  timeline: TraceTimeline
  artifacts: Artifact[]
}

export interface TraceEvent {
  id: string
  timestamp: string
  phase: WorkflowPhase
  agent?: string
  action: string
  details: Record<string, unknown>
}

export interface TraceTimeline {
  phaseStartTimes: Record<WorkflowPhase, string>
  phaseDurations: Record<WorkflowPhase, number>  // seconds
  totalDuration: number  // seconds
}

export interface Artifact {
  id: string
  type: 'document' | 'code' | 'test' | 'report' | 'custom'
  name: string
  url: string
  size: number
  created_at: string
  created_by: string
}

export interface ComplianceStatus {
  framework: ComplianceFramework
  compliant: boolean
  lastCheck: string
  violations: ComplianceViolation[]
  requirements: ComplianceRequirement[]
}

export interface ComplianceRequirement {
  id: string
  name: string
  description: string
  status: 'pending' | 'met' | 'exempt'
  evidence?: string[]
}
```

---

## 6. Implementation Tasks

### 6.1 Phase 1: Platform Abstraction (Week 1-4)

#### Task 1.1: Platform Registry System

**ID:** T1.1
**Title:** Create Platform Registry and Base Adapter
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Implement the core platform abstraction layer that allows dynamic registration and normalization of different platform types.

**Input Contracts:**
- Existing GitHub integration code in `src/lib/github/`
- Platform configuration schemas from spec

**Output Contracts:**
```typescript
// lib/platforms/registry.ts
export class PlatformRegistry {
  register(adapter: PlatformAdapter): void
  unregister(id: string): void
  get(id: string): PlatformAdapter | undefined
  list(): PlatformAdapter[]
  getByType(type: PlatformType): PlatformAdapter[]
  getActive(): PlatformAdapter
  setActive(id: string): void
}

// lib/platforms/base-adapter.ts
export abstract class PlatformAdapter {
  abstract id: string
  abstract name: string
  abstract type: PlatformType

  abstract authenticate(credentials: unknown): Promise<AuthContext>
  abstract fetchWorkflows(filters: FilterOptions): Promise<Workflow[]>
  abstract fetchAgents(filters: FilterOptions): Promise<Agent[]>
  abstract fetchRepos(filters: FilterOptions): Promise<Repository[]>
  abstract submitWorkflow(workflow: WorkflowRequest): Promise<Workflow>
  abstract cancelWorkflow(id: string): Promise<void>
  abstract getComplianceReport(range: DateRange): Promise<ComplianceReport>
  abstract subscribeToEvents(handler: EventHandler): UnsubscribeFunction
}
```

**Dependencies:**
- None (foundational task)

**Success Criteria:**
- Platform registry can register/unregister adapters at runtime
- Base adapter defines all required methods
- Unit tests for registry operations pass
- TypeScript types export correctly

---

#### Task 1.2: Development Platform Adapter

**ID:** T1.2
**Title:** Implement GitHub/Development Platform Adapter
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Wrap existing GitHub integration code into the new adapter pattern, ensuring compatibility while providing the abstraction interface.

**Input Contracts:**
- Existing `src/lib/github/*` modules
- Base adapter from T1.1

**Output Contracts:**
```typescript
// lib/platforms/development.ts
export class DevelopmentAdapter extends PlatformAdapter {
  id = 'development'
  name = 'Development (GitHub)'
  type = 'development' as const

  async authenticate(credentials: GitHubCredentials): Promise<AuthContext>
  async fetchWorkflows(filters: WorkflowFilters): Promise<Workflow[]>
  async fetchAgents(filters: AgentFilters): Promise<Agent[]>
  async fetchRepos(filters: RepoFilters): Promise<Repository[]>
  async submitWorkflow(request: WorkflowRequest): Promise<Workflow>
  async cancelWorkflow(id: string): Promise<void>
  async getComplianceReport(range: DateRange): Promise<ComplianceReport>
  subscribeToEvents(handler: EventHandler): UnsubscribeFunction
}
```

**Dependencies:**
- T1.1 (Base Adapter)

**Success Criteria:**
- All existing GitHub features work through adapter
- Backward compatibility with existing pages
- Compliance reports include SOC2 metrics

---

#### Task 1.3: Platform Context Provider

**ID:** T1.3
**Title:** Create React Context for Platform Management
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Implement React context provider to manage current platform selection and provide platform-specific data throughout the component tree.

**Input Contracts:**
- Platform registry from T1.1
- Existing context patterns

**Output Contracts:**
```typescript
// contexts/platform-context.tsx
interface PlatformContextValue {
  currentPlatform: PlatformType
  platforms: Platform[]
  switchPlatform: (platform: PlatformType) => Promise<void>
  isSwitching: boolean
  registry: PlatformRegistry
}

export function PlatformProvider({ children }: { children: ReactNode })
export function usePlatform(): PlatformContextValue
```

**Dependencies:**
- T1.1 (Platform Registry)

**Success Criteria:**
- Platform switcher component works
- Context updates all subscribed components
- Platform data cached and invalidated correctly
- Error handling for unavailable platforms

---

#### Task 1.4: Platform-Specific UI Components

**ID:** T1.4
**Title:** Build Platform-Aware UI Components
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Create reusable UI components that adapt their display based on the current platform type, showing appropriate metrics and controls.

**Input Contracts:**
- Platform context from T1.3
- shadcn/ui components

**Output Contracts:**
```typescript
// components/platforms/platform-switcher.tsx
interface PlatformSwitcherProps {
  compact?: boolean
}

// components/platforms/platform-dashboard.tsx
interface PlatformDashboardProps {
  platform: PlatformType
}

// components/platforms/compliance-badge.tsx
interface ComplianceBadgeProps {
  platform: PlatformType
  detailed?: boolean
}

// components/platforms/metrics-card.tsx
interface MetricsCardProps {
  platform: PlatformType
  metricType: string
}
```

**Dependencies:**
- T1.3 (Platform Context)

**Success Criteria:**
- All components render for each platform type
- Platform-appropriate icons and colors
- Compliance badges show correct frameworks
- Metrics cards display platform-specific data

---

### 6.2 Phase 2: Multi-Organization Support (Week 5-7)

#### Task 2.1: Enhanced Organization Context

**ID:** T2.1
**Title:** Extend Organization Context for Multi-Org
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Enhance existing org context to support multiple organizations with proper isolation, cross-org views for admins, and org-level settings.

**Input Contracts:**
- Existing `src/contexts/org-context.tsx`
- User authentication context

**Output Contracts:**
```typescript
interface Organization {
  id: string
  name: string
  slug: string
  avatar?: string
  platforms: PlatformType[]
  settings: OrganizationSettings
  memberRole: OrgRole
  joinedAt: string
}

interface OrganizationSettings {
  defaultPlatform: PlatformType
  complianceLevel: ComplianceFramework
  teamStructure: TeamStructure
  notificationChannels: NotificationChannel[]
}

type OrgRole = 'owner' | 'admin' | 'member' | 'viewer'

interface OrgContextValue {
  currentOrg: Organization | null
  organizations: Organization[]
  switchOrg: (orgId: string) => Promise<void>
  hasPermission: (permission: string) => boolean
  canAccessCrossOrg: boolean
  isLoading: boolean
}
```

**Dependencies:**
- T1.1 (Platform Registry - for org/platform association)

**Success Criteria:**
- Org switching without re-authentication
- Cross-org views for authorized users
- Org-level isolation enforced
- Settings persist correctly

---

#### Task 2.2: Team Hierarchy Management

**ID:** T2.2
**Title:** Implement Team Hierarchy System
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Create a hierarchical team structure (Org -> Team -> Subteam -> Individual) with inherited permissions and workload tracking.

**Input Contracts:**
- Organization context from T2.1
- Team data models from spec

**Output Contracts:**
```typescript
// lib/services/team-service.ts
export class TeamService {
  async listTeams(orgId: string): Promise<Team[]>
  async getTeam(teamId: string): Promise<Team>
  async createTeam(input: CreateTeamInput): Promise<Team>
  async updateTeam(teamId: string, updates: Partial<Team>): Promise<Team>
  async deleteTeam(teamId: string): Promise<void>
  async getTeamWorkload(teamId: string): Promise<TeamWorkload>
  async assignWorkflow(workflowId: string, teamId: string, assignee?: string): Promise<void>
  async getMemberWorkload(userId: string): Promise<MemberWorkload>
}

// types/team.ts (as defined in Data Models)
```

**Dependencies:**
- T2.1 (Organization Context)

**Success Criteria:**
- Team hierarchy creates correctly
- Permissions inherit from parent teams
- Workload distributes to available members
- Auto-assignment respects capacity

---

#### Task 2.3: Workload Distribution Engine

**ID:** T2.3
**Title:** Build Queue-Based Workflow Distribution
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Implement intelligent workflow assignment based on team capacity, skill matching, workload balancing, and priority queues.

**Input Contracts:**
- Team service from T2.2
- Workflow data models

**Output Contracts:**
```typescript
// lib/services/workflow-distribution.ts
export class WorkflowDistributionEngine {
  async assignWorkflow(
    workflow: Workflow,
    strategy: AssignmentStrategy
  ): Promise<AssignmentResult>

  async getQueueStatus(orgId: string): Promise<QueueStatus>
  async reassignWorkflow(workflowId: string, reason: string): Promise<void>
  async manualAssign(workflowId: string, assigneeId: string): Promise<void>
  async optimizeAssignments(teamId: string): Promise<OptimizationResult>
}

type AssignmentStrategy =
  | 'round-robin'
  | 'least-loaded'
  | 'skill-matched'
  | 'priority-based'
  | 'manual'

interface AssignmentResult {
  workflowId: string
  assignee: string
  team: string
  estimatedStart: string
  estimatedCompletion: string
}
```

**Dependencies:**
- T2.2 (Team Hierarchy)

**Success Criteria:**
- Auto-assignment respects team capacity
- Priority queues process in order
- Skill matching uses agent capabilities
- Manual override works for leads

---

#### Task 2.4: Team Collaboration Page

**ID:** T2.4
**Title:** Create Team Management Dashboard
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Build the team dashboard page showing team workload, member status, active workflows, and providing management controls.

**Input Contracts:**
- Team service from T2.2
- Distribution engine from T2.3

**Output Contracts:**
```typescript
// app/dashboard/team/page.tsx
interface TeamPageProps {
  searchParams: { org?: string; team?: string; view?: 'workload' | 'members' | 'settings' }
}

// components/collaboration/team-workload-view.tsx
interface TeamWorkloadViewProps {
  teamId: string
  timeframe?: 'day' | 'week' | 'month'
}

// components/collaboration/member-card.tsx
interface MemberCardProps {
  member: TeamMember
  workload: MemberWorkload
}
```

**Dependencies:**
- T2.2 (Team Hierarchy)
- T2.3 (Distribution Engine)

**Success Criteria:**
- Workload visualization accurate
- Member status updates in real-time
- Workflow assignment controls work
- Team settings editable

---

### 6.3 Phase 3: Enhanced Compliance (Week 8-11)

#### Task 3.1: Unified Audit Framework

**ID:** T3.1
**Title:** Create Immutable Audit Log System
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Implement a write-once, append-only audit log that captures all relevant events across platforms with proper retention policies.

**Input Contracts:**
- Audit event data models
- Platform adapters (for event generation)

**Output Contracts:**
```typescript
// lib/compliance/unified-audit.ts
export class UnifiedAuditLog {
  async log(event: AuditEvent): Promise<string>
  async query(filters: AuditQuery): Promise<AuditEvent[]>
  async getComplianceReport(
    framework: ComplianceFramework,
    range: DateRange
  ): Promise<ComplianceReport>
  async export(format: 'json' | 'csv' | 'pdf', filters: AuditQuery): Promise<Buffer>
  async verifyIntegrity(): Promise<IntegrityReport>
}

// Database schema for audit log
interface AuditLogEntry {
  id: string
  timestamp: string  // ISO 8601
  platform: PlatformType
  eventType: AuditEventType
  actor: string
  action: string
  resource: string
  outcome: 'success' | 'failure'
  details: string  // JSON stringified
  complianceTag?: string
  hash: string  // For integrity verification
  signature?: string  // For regulated industries
  _immutable: true  // Database constraint
}
```

**Dependencies:**
- T1.2 (Development Adapter - for GitHub events)
- Database schema update

**Success Criteria:**
- All audit events captured
- Immutable storage enforced
- Query performance <1s
- Integrity verification passes

---

#### Task 3.2: HIPAA Compliance Module

**ID:** T3.2
**Title:** Implement HIPAA Compliance Features
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Create HIPAA-specific compliance tracking including PHI access logging, minimum necessary enforcement, and BAA tracking.

**Input Contracts:**
- Unified audit log from T3.1
- Healthcare platform adapter

**Output Contracts:**
```typescript
// lib/compliance/hipaa.ts
export class HipaaCompliance {
  async logPhiAccess(
    userId: string,
    patientId: string,
    dataAccessed: string[],
    reason: string
  ): Promise<void>

  async checkMinimumNecessary(
    userId: string,
    requestedFields: string[]
  ): Promise<{ allowed: boolean; deniedFields: string[] }>

  async generatePhiAccessReport(range: DateRange): Promise<PhiAccessReport>
  async verifyBaaStatus(businessAssociate: string): Promise<BaaStatus>
  async createBreachNotification(breach: PhiBreach): Promise<void>
}

interface PhiAccessReport {
  period: DateRange
  totalAccessEvents: number
  accessByUser: Record<string, number>
  accessByPatient: Record<string, number>
  unusualPatterns: Anomaly[]
}
```

**Dependencies:**
- T3.1 (Unified Audit)

**Success Criteria:**
- All PHI access logged
- Minimum necessary enforced
- BAA tracking functional
- Breach notification workflow ready

---

#### Task 3.3: FINRA/SOX Compliance Module

**ID:** T3.3
**Title:** Implement FINRA/SOX Compliance Features
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Create trading-specific compliance including immutable trade audit trail, risk limit enforcement, and communications recording.

**Input Contracts:**
- Unified audit log from T3.1
- Trading platform adapter

**Output Contracts:**
```typescript
// lib/compliance/finra.ts
export class FinraCompliance {
  async logTradeExecution(trade: TradeExecution): Promise<void>
  async enforceRiskLimits(order: Order): Promise<{ allowed: boolean; reason?: string }>
  async recordCommunication(communication: CommunicationRecord): Promise<void>
  async generateSurveillanceReport(range: DateRange): Promise<SurveillanceReport>
  async verifyTradeAuditTrail(): Promise<IntegrityReport>
}

// lib/compliance/sox.ts
export class SoxCompliance {
  async logChangeManagement(change: ChangeRecord): Promise<void>
  async requireApproval(change: ChangeRecord): Promise<boolean>
  async generateSoxReport(range: DateRange): Promise<SoxReport>
}

interface TradeExecution {
  id: string
  timestamp: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  executionVenue: string
  traderId: string
  riskCheckPassed: boolean
  _immutable: true
}
```

**Dependencies:**
- T3.1 (Unified Audit)

**Success Criteria:**
- Trade audit trail immutable
- Risk limits enforced pre-trade
- Communications captured
- SOX reports generate correctly

---

#### Task 3.4: Compliance Dashboard

**ID:** T3.4
**Title:** Create Unified Compliance Dashboard
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Build the compliance dashboard page showing compliance status across all platforms, violations, reports, and remediation workflows.

**Input Contracts:**
- All compliance modules from T3.1-T3.3
- Compliance data models

**Output Contracts:**
```typescript
// app/dashboard/compliance/page.tsx
interface CompliancePageProps {
  searchParams: {
    platform?: PlatformType
    framework?: ComplianceFramework
    dateRange?: string
  }
}

// components/compliance/compliance-status-card.tsx
interface ComplianceStatusCardProps {
  platform: PlatformType
  framework: ComplianceFramework
}

// components/compliance/violation-list.tsx
interface ViolationListProps {
  severity?: 'critical' | 'high' | 'medium' | 'low'
  status?: 'open' | 'in-progress' | 'resolved'
}

// components/compliance/report-generator.tsx
interface ReportGeneratorProps {
  frameworks: ComplianceFramework[]
}
```

**Dependencies:**
- T3.1 (Unified Audit)
- T3.2 (HIPAA)
- T3.3 (FINRA/SOX)

**Success Criteria:**
- Compliance status accurate
- Violations clearly displayed
- Reports generate <24 hours
- Remediation workflows trigger

---

### 6.4 Phase 4: Scalability & Real-Time (Week 12-14)

#### Task 4.1: WebSocket Infrastructure

**ID:** T4.1
**Title:** Implement Real-Time WebSocket Server
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Create a WebSocket server for real-time updates with subscription management, filtering, and connection pooling.

**Input Contracts:**
- Next.js API routes
- Real-time event types

**Output Contracts:**
```typescript
// lib/realtime/websocket-server.ts
export class WebSocketServer {
  constructor(options: ServerOptions)

  start(): Promise<void>
  stop(): Promise<void>

  broadcast(event: RealTimeEvent): void
  send(connectionId: string, event: RealTimeEvent): void

  subscribe(connectionId: string, eventTypes: RealTimeEventType[]): void
  unsubscribe(connectionId: string, eventTypes: RealTimeEventType[]): void

  getConnections(): ConnectionInfo[]
  getConnectionStats(): ConnectionStats
}

// app/api/v2/realtime/route.ts
export async function GET(request: Request): Promise<Response>
// Upgrade to WebSocket

interface ConnectionInfo {
  id: string
  userId: string
  orgId: string
  connectedAt: string
  subscriptions: RealTimeEventType[]
  latency: number
}
```

**Dependencies:**
- None (can run parallel to Phase 1-3)

**Success Criteria:**
- WebSocket connections stable
- Subscriptions filter correctly
- Broadcasts <100ms latency
- Reconnection handles gracefully

---

#### Task 4.2: Real-Time Event Bus

**ID:** T4.2
**Title:** Create Event Bus for Cross-Service Communication
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Implement an event bus that aggregates events from all platforms, agents, and services for WebSocket broadcasting.

**Input Contracts:**
- Platform adapters (for platform events)
- Agent service (for agent events)
- WebSocket server from T4.1

**Output Contracts:**
```typescript
// lib/realtime/event-bus.ts
export class RealTimeEventBus {
  subscribe(eventType: RealTimeEventType, handler: EventHandler): UnsubscribeFunction
  publish(event: RealTimeEvent): void
  start(): void
  stop(): void

  // Event aggregators
  monitorWorkflows(): void
  monitorAgents(): void
  monitorCompliance(): void
  monitorPlatforms(): void
}

// Event sources
interface EventSource {
  platform: PlatformType
  type: 'webhook' | 'poll' | 'push'
  config: EventSourceConfig
}
```

**Dependencies:**
- T4.1 (WebSocket Server)
- T1.2 (Development Adapter)

**Success Criteria:**
- All events captured
- Event ordering preserved
- No events lost during restart
- Performance handles 1000+ events/sec

---

#### Task 4.3: React WebSocket Integration

**ID:** T4.3
**Title:** Create React Context and Hooks for WebSocket
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Build React context and custom hooks for components to subscribe to real-time updates.

**Input Contracts:**
- WebSocket server from T4.1
- Event bus from T4.2

**Output Contracts:**
```typescript
// contexts/realtime-context.tsx
interface RealtimeContextValue {
  connected: boolean
  connecting: boolean
  error?: string
  subscribe: (eventTypes: RealTimeEventType[], callback: EventCallback) => UnsubscribeFunction
  send: (message: ClientMessage) => void
}

export function RealtimeProvider({ children }: { children: ReactNode })
export function useRealtime(): RealtimeContextValue

// hooks/use-websocket.ts
export function useWebSocket(options?: {
  autoConnect?: boolean
  reconnectInterval?: number
}): RealtimeContextValue

// hooks/use-workflow-updates.ts
export function useWorkflowUpdates(workflowId?: string): {
  workflow: Workflow | null
  isUpdating: boolean
}

// hooks/use-agent-updates.ts
export function useAgentUpdates(agentId?: string): {
  agent: Agent | null
  activities: AgentActivity[]
}
```

**Dependencies:**
- T4.1 (WebSocket Server)
- T4.2 (Event Bus)

**Success Criteria:**
- Auto-reconnect on disconnect
- Subscription management works
- Performance efficient (no unnecessary re-renders)
- Error boundaries handle failures

---

#### Task 4.4: Real-Time Status HUD

**ID:** T4.4
**Title:** Build Live HUD Component
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Create the real-time status HUD showing current phase, agent activity, QA cycles, and context usage with sub-second updates.

**Input Contracts:**
- Real-time context from T4.3
- HUD design from spec

**Output Contracts:**
```typescript
// components/realtime/realtime-status.tsx
interface RealTimeStatusProps {
  compact?: boolean  // Toggle focused/full view
  showAgents?: boolean
  showMetrics?: boolean
  className?: string
}

// components/realtime/hud-focused.tsx
// Compact single-line version

// components/realtime/hud-full.tsx
// Detailed version with agent list

interface RealTimeStatusData {
  currentPhase: number
  phaseName: string
  ralphIteration: number
  ralphMaxIterations: number
  qaCycle: number
  qaMaxCycles: number
  status: 'running' | 'paused' | 'completed' | 'error'
  contextUsage: number
  activeTasks: number
  totalTasks: number
  activeAgents: number
  agents?: AgentDisplay[]
}
```

**Dependencies:**
- T4.3 (React WebSocket Integration)

**Success Criteria:**
- Updates <500ms for critical events
- Compact view fits in header
- Full view shows agent details
- Color coding for status

---

### 6.5 Phase 5: Advanced Collaboration (Week 15-16)

#### Task 5.1: Activity Feed System

**ID:** T5.1
**Title:** Create Team Activity Feed
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Implement a real-time activity feed showing actions across the team with @mentions, notifications, and activity attribution.

**Input Contracts:**
- Real-time event bus from T4.2
- Team context from T2.2

**Output Contracts:**
```typescript
// lib/services/activity-service.ts
export class ActivityService {
  async logActivity(activity: TeamActivity): Promise<void>
  async getTeamActivities(teamId: string, options: GetActivitiesOptions): Promise<TeamActivity[]>
  async getMentions(userId: string): Promise<Mention[]>
  async markActivityRead(activityId: string): Promise<void>
  async createMention(mentionedUserId: string, activityId: string): Promise<void>
}

interface TeamActivity {
  id: string
  timestamp: string
  userId: string
  username: string
  avatar?: string
  action: string
  target?: {
    type: 'workflow' | 'agent' | 'team' | 'repository'
    id: string
    name: string
  }
  mentions: string[]  // User IDs
  teamId: string
  metadata: Record<string, unknown>
}

// components/collaboration/activity-feed.tsx
interface ActivityFeedProps {
  teamId: string
  filter?: ActivityFilter
  realtime?: boolean
}
```

**Dependencies:**
- T2.2 (Team Hierarchy)
- T4.2 (Event Bus)

**Success Criteria:**
- Real-time updates in feed
- @mentions trigger notifications
- Activity attribution correct
- Pagination works for history

---

#### Task 5.2: Notification System

**ID:** T5.2
**Title:** Implement Multi-Channel Notifications
**Owner:** ultra:executor
**Complexity:** Medium

**Description:**
Create notification system supporting dashboard, email, Slack, and SMS channels with user preferences.

**Input Contracts:**
- Activity feed from T5.1
- User settings

**Output Contracts:**
```typescript
// lib/services/notification-service.ts
export class NotificationService {
  async notify(notification: Notification): Promise<void>
  async getNotifications(userId: string): Promise<Notification[]>
  async markRead(notificationId: string): Promise<void>
  async updatePreferences(userId: string, prefs: NotificationPreferences): Promise<void>
  async sendToChannel(channel: NotificationChannel, notification: Notification): Promise<void>
}

interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  actionUrl?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  channels: NotificationChannel[]
  read: boolean
  createdAt: string
}

type NotificationType =
  | 'workflow_assigned'
  | 'workflow_completed'
  | 'workflow_failed'
  | 'compliance_alert'
  | 'mention'
  | 'team_invitation'

// components/collaboration/notification-center.tsx
interface NotificationCenterProps {
  unreadOnly?: boolean
}
```

**Dependencies:**
- T5.1 (Activity Feed)

**Success Criteria:**
- All channels functional
- User preferences respected
- Real-time notifications
- Read/unread tracking

---

#### Task 5.3: Shared Workspace

**ID:** T5.3
**Title:** Build Collaborative Workspace
**Owner:** ultra:executor-high
**Complexity:** High

**Description:**
Implement a shared workspace for concurrent users with conflict resolution and collaborative editing.

**Input Contracts:**
- Real-time infrastructure from T4.1-T4.2
- Team context

**Output Contracts:**
```typescript
// lib/services/collaboration-service.ts
export class CollaborationService {
  async joinWorkspace(workspaceId: string): Promise<Workspace>
  async leaveWorkspace(workspaceId: string): Promise<void>
  async updatePresence(workspaceId: string, presence: Presence): Promise<void>
  async broadcastEdit(workspaceId: string, edit: Edit): Promise<void>
  async resolveConflict(conflict: EditConflict): Promise<ResolvedEdit>
}

interface Workspace {
  id: string
  type: 'workflow' | 'document' | 'planning'
  participants: Participant[]
  content: WorkspaceContent
  locks: Record<string, string>  // resource -> userId
  version: number
}

interface Participant {
  userId: string
  username: string
  avatar?: string
  cursor?: Cursor
  presence: 'active' | 'away' | 'offline'
  lastSeen: string
}

// components/collaboration/shared-workspace.tsx
interface SharedWorkspaceProps {
  workspaceId: string
  type: WorkspaceType
}
```

**Dependencies:**
- T4.1 (WebSocket)
- T5.1 (Activity Feed)

**Success Criteria:**
- Multiple users can collaborate
- Edits sync in real-time
- Conflicts resolve automatically
- Presence indicators work

---

## 7. Integration Strategy

### 7.1 GitHub Integration

**Current State:**
- GitHub OAuth for authentication
- Octokit for API calls
- Webhook receiver for GitHub events

**Enhancement Plan:**

1. **GitHub App Registration**
   - Create GitHub App for multi-org support
   - Support both org-level and repo-level installations
   - Webhook events for all workflow-related activities

2. **API Integration**
   ```
   GitHub Webhook → API Gateway → Event Bus → WebSocket → UI
                                   ↓
                             Platform Adapter
                                   ↓
                            Workflow Service
   ```

3. **Authentication Flow**
   ```
   User → OAuth2 → JWT → API Gateway → GitHub API
           ↓
      Store tokens per org
   ```

### 7.2 Ultra-Lead Integration

**Integration Points:**

1. **Phase 0-1 Orchestration**
   ```typescript
   // lib/services/ultra-lead-service.ts
   export class UltraLeadService {
     async startPhase0(workflowId: string): Promise<PhaseResult>
     async startPhase1(workflowId: string): Promise<PhaseResult>

     private spawnAgent(agentType: string, task: Task): Promise<AgentSession>
     private collectResults(agentSessions: AgentSession[]): Promise<PhaseResult>
   }
   ```

2. **Agent Communication**
   - AgentMessageBus for agent-to-agent communication
   - Progress events streamed via WebSocket
   - Session state persisted to database

### 7.3 Ultra-Autoloop Integration

**Heartbeat Monitoring:**

```typescript
// lib/services/autoloop-service.ts
export class AutoloopService {
  async getHeartbeat(): Promise<AutoloopHeartbeat>
  async superviseWorkflow(workflowId: string): Promise<SupervisionStatus>
  async triggerIntervention(workflowId: string, reason: string): Promise<void>

  // Parse heartbeat from GitHub issue comment
  private parseHeartbeat(commentBody: string): HeartbeatData
}
```

### 7.4 External Platform Integration

**Trading Platform:**
```typescript
// lib/platforms/trading.ts
export class TradingAdapter extends PlatformAdapter {
  async executeTrade(order: Order): Promise<TradeResult>
  async getMarketData(symbols: string[]): Promise<MarketData[]>
  async checkRiskLimits(order: Order): Promise<RiskCheckResult>
}
```

**Healthcare Platform:**
```typescript
// lib/platforms/healthcare.ts
export class HealthcareAdapter extends PlatformAdapter {
  async getPatientData(patientId: string, consent: boolean): Promise<PatientData>
  async logPhiAccess(access: PhiAccess): Promise<void>
  async verifyConsent(patientId: string): Promise<ConsentStatus>
}
```

---

## 8. Testing Strategy

### 8.1 Unit Testing

**Coverage Targets:**
- Platform adapters: 90%
- Services: 85%
- Utilities: 95%
- Components: 70%

**Framework:** Jest + Testing Library

```typescript
// Example: Platform Adapter Test
describe('DevelopmentAdapter', () => {
  it('should authenticate with GitHub credentials', async () => {
    const adapter = new DevelopmentAdapter()
    const result = await adapter.authenticate({ token: 'test-token' })
    expect(result.userId).toBeDefined()
  })

  it('should fetch workflows with filters', async () => {
    const adapter = new DevelopmentAdapter()
    const workflows = await adapter.fetchWorkflows({ status: 'active' })
    expect(workflows).toHaveLength(5)
  })
})
```

### 8.2 Integration Testing

**Scenarios:**
1. Platform switching workflow
2. Multi-org workflow distribution
3. Compliance event capture and reporting
4. Real-time event propagation
5. Cross-platform workflow execution

**Framework:** Playwright

```typescript
// Example: Multi-Org Workflow Test
test('should distribute workflow across orgs', async ({ page }) => {
  await page.goto('/dashboard/workflows')
  await page.selectOption('[data-testid="org-selector"]', 'org2')
  await page.fill('[data-testid="workflow-title"]', 'Test Workflow')
  await page.click('[data-testid="submit-workflow"]')
  await expect(page.locator('[data-testid="workflow-status"]')).toHaveText('active')
})
```

### 8.3 Performance Testing

**Metrics:**
- API response time (p50, p95, p99)
- WebSocket message latency
- Database query performance
- Page load time

**Tools:** k6, Lighthouse

```javascript
// Example: k6 load test
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Sustained
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 0 },    // Ramp down
  ],
}

export default function () {
  let res = http.get('/api/v2/workflows')
  check(res, { 'status was 200': (r) => r.status == 200 })
  sleep(1)
}
```

### 8.4 Compliance Testing

**HIPAA:**
- PHI access audit trail verification
- Encryption at rest and in transit
- Minimum necessary enforcement

**FINRA:**
- Trade audit trail immutability
- Risk limit enforcement
- Communications recording verification

**SOC2:**
- Change management tracking
- Access review certification
- Vulnerability scan integration

---

## 9. Deployment Strategy

### 9.1 Environments

```
Development (dev.ultrapilot.dev)
  - Feature branches deployed
  - Auto-deploy on push to main
  - Real data mocking

Staging (staging.ultrapilot.dev)
  - Pre-production testing
  - Full data integration
  - Performance testing

Production (ultrapilot.io)
  - Blue-green deployment
  - Canary releases
  - 99.9% uptime SLA
```

### 9.2 Database Migration

**Schema Changes:**
```sql
-- Platform registry
CREATE TABLE platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT NOT NULL,  -- JSON
  compliance TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Organizations
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL
);

-- Teams
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  parent_team_id TEXT REFERENCES teams(id),
  settings TEXT NOT NULL,  -- JSON
  created_at TEXT NOT NULL
);

-- Audit log (immutable)
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  outcome TEXT NOT NULL,
  details TEXT NOT NULL,  -- JSON
  compliance_tag TEXT,
  hash TEXT NOT NULL,
  _immutable BOOLEAN DEFAULT TRUE
);
CREATE INDEX audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX audit_log_platform ON audit_log(platform);

-- Real-time subscriptions
CREATE TABLE websocket_subscriptions (
  connection_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  filters TEXT,  -- JSON
  created_at TEXT NOT NULL,
  PRIMARY KEY (connection_id, event_type)
);
```

### 9.3 Rollout Plan

**Week 1-4 (Phase 1):**
- Deploy platform registry to dev
- Test with single GitHub org
- Migrate existing data

**Week 5-7 (Phase 2):**
- Deploy multi-org support to staging
- Test team hierarchy
- Load test workload distribution

**Week 8-11 (Phase 3):**
- Deploy compliance modules to staging
- Run compliance audits
- Legal review of HIPAA/FINRA features

**Week 12-14 (Phase 4):**
- Deploy WebSocket infrastructure
- Performance testing at scale
- Optimize database queries

**Week 15-16 (Phase 5):**
- Deploy collaboration features
- End-to-end testing
- Documentation and training

**Production Rollout:**
1. Feature flags for new functionality
2. Beta users per platform
3. Gradual rollout by organization
4. Monitor metrics and rollback plan

---

## 10. Success Criteria

### 10.1 Phase 1: Platform Abstraction

| Criteria | Metric | Target |
|----------|--------|--------|
| Platform registration works | Manual test | All 3 platforms registered via config |
| Platform switching latency | p95 | <500ms |
| Backward compatibility | Existing pages work | 100% |
| Adapter test coverage | Code coverage | >90% |

### 10.2 Phase 2: Multi-Organization

| Criteria | Metric | Target |
|----------|--------|--------|
| Org switching without re-auth | Manual test | Instant switch |
| Team hierarchy depth | Max levels | 5 levels |
| Auto-assignment accuracy | Correct assignments | >95% |
| Workload balancing | Distribution fairness | <20% variance |

### 10.3 Phase 3: Enhanced Compliance

| Criteria | Metric | Target |
|----------|--------|--------|
| Audit log completeness | Events captured | 100% |
| Audit log immutability | Tamper detection | 100% |
| HIPAA PHI access logged | Access events | 100% |
| FINRA trade audit immutable | Write-once verification | Pass |
| Compliance report generation | Generation time | <24 hours |

### 10.4 Phase 4: Scalability & Real-Time

| Criteria | Metric | Target |
|----------|--------|--------|
| Dashboard load time | p95 | <2s |
| API response time (cached) | p95 | <100ms |
| WebSocket latency | p95 | <500ms |
| Concurrent workflows | Active workflows | 100+ |
| Concurrent agents | Active agents | 1000+ |

### 10.5 Phase 5: Collaboration

| Criteria | Metric | Target |
|----------|--------|--------|
| Activity feed latency | Event to display | <1s |
| Notification delivery | Success rate | >99% |
| Shared workspace sync | Edit propagation | <500ms |
| Conflict resolution | Auto-resolve rate | >90% |

---

## Appendix A: Dependencies Between Tasks

```
Phase 1 (Platform Abstraction)
T1.1 (Registry) ──┬──> T1.2 (Dev Adapter)
                  └──> T1.3 (Platform Context) ──> T1.4 (UI Components)

Phase 2 (Multi-Org)
T2.1 (Enhanced Org Context) ──┬──> T2.2 (Team Hierarchy)
                              │
T1.1 (Registry) ──────────────┘
                              │
T2.2 ──> T2.3 (Workload Distribution) ──> T2.4 (Team Dashboard)

Phase 3 (Compliance)
T3.1 (Unified Audit) ──┬──> T3.2 (HIPAA)
                       ├──> T3.3 (FINRA/SOX)
                       └──> T3.4 (Compliance Dashboard)
T1.2 (Dev Adapter) ─────> T3.1 (for GitHub events)

Phase 4 (Real-Time)
T4.1 (WebSocket Server) ──┬──> T4.2 (Event Bus)
                          │
                          └──> T4.3 (React Integration) ──> T4.4 (HUD)

Phase 5 (Collaboration)
T4.2 (Event Bus) ──> T5.1 (Activity Feed) ──> T5.2 (Notifications)
T2.2 (Team Hierarchy) ──> T5.1
T4.1 (WebSocket) ───────> T5.3 (Shared Workspace)
```

---

## Appendix B: Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Platform adapter complexity | High | High | Incremental rollout, extensive testing |
| Real-time scaling issues | Medium | High | Load testing, connection pooling |
| Compliance gaps | Low | Critical | Legal review, audit trails |
| Data migration issues | Medium | Medium | Dry-run migrations, rollback plan |
| Third-party API changes | Medium | Medium | Version pinning, abstractions |
| Performance degradation | Medium | High | Continuous monitoring, optimization |

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| Platform Adapter | Pluggable module that normalizes data and operations for a specific platform type |
| Platform Type | Category of platform: development, trading, healthcare, or custom |
| Compliance Framework | Regulatory standard: HIPAA, FINRA, SOX, SOC2, ISO27001 |
| Audit Event | Immutable record of an action taken within the system |
| Real-Time Event | Message broadcast via WebSocket for immediate UI updates |
| Team Hierarchy | Organizational structure: Org → Team → Subteam → Individual |
| Workload Distribution | Automatic assignment of workflows based on capacity and skills |
| Compliance Badge | Visual indicator of compliance status for a platform |
| Phase Transition | Movement between UltraPilot workflow phases (0-5) |
| QA Cycle | Testing iteration during Phase 3 of UltraPilot workflow |
| Agent Session | Active connection to an AI agent working on a task |
| Presence | User's online status and cursor position in shared workspace |
| Conflict Resolution | Automatic or manual resolution of simultaneous edits |
| Audit Trail | Chronological record of all compliance-relevant events |
| PHI | Protected Health Information (HIPAA) |
| BAA | Business Associate Agreement (HIPAA) |
| SOC2 | Service Organization Control 2 compliance |
| FINRA | Financial Industry Regulatory Authority |
| SOX | Sarbanes-Oxley Act compliance |

---

**End of Implementation Plan v1**

**Next Steps:**
1. Submit for multi-perspective review
2. Incorporate feedback from domain experts
3. Generate final approved plan (plan-final.md)
4. Begin Phase 1 implementation

**Questions for Reviewers:**
1. Are the platform abstraction requirements clear?
2. Is the compliance framework sufficient for regulated industries?
3. Are there missing integration points?
4. Is the task breakdown granular enough?
5. Are the success criteria measurable?
