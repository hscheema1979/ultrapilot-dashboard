# Project Management Platform Patterns - Applied to Agent Dashboard

**Analysis:** How Jira, Linear, Asana, Monday.com work and how to apply to our ultra:architect + ultra:team-lead system

---

## Core Patterns from PM Platforms

### 1. **Hierarchical Issue Structure**

**Jira Pattern:**
```
Epic "Build REST API"
  ├─ Story "Create task endpoints"
  │   ├─ Task "Design schema"
  │   ├─ Task "Implement CRUD"
  │   └─ Task "Write tests"
  ├─ Story "Create user endpoints"
  └─ Story "Add authentication"
```

**Applied to Our System:**
```
GitHub Issue #123 (Feature Request)
  ├─ Subtask #124 (Requirements)
  ├─ Subtask #125 (Architecture)
  ├─ Subtask #126 (Planning)
  ├─ Subtask #127 (Implementation)
  │   ├─ Subtask #128 (Build /api/tasks)
  │   ├─ Subtask #129 (Build /api/users)
  │   └─ Subtask #130 (Add auth)
  ├─ Subtask #131 (Verification)
  └─ Subtask #132 (Deployment)
```

**Implementation:**
- Parent issue = Feature Request
- Subtasks = PLC phases
- Each phase can have its own subtasks
- ultra:architect manages this hierarchy

---

### 2. **Multiple Views**

**Jira Provides:**
- **Board View** (Kanban) - Columns for statuses
- **List View** - Table with sorting/filtering
- **Timeline View** - Gantt chart
- **Calendar View** - By due date
- **Roadmap View** - Strategic overview

**Our Dashboard Should Have:**

**A. Board View (GitHub Project Board)**
```
To Do  │  In Progress  │  Review  │  Done
───────┼───────────────┼─────────┼──────
#123   │  #127         │  #131   │  #100
#124   │  #128         │         │  #099
#125   │  #129         │         │
```

**B. List View (Enhanced)**
```typescript
// /projects?view=list
- Columns: ID, Title, Status, Assignee, Priority, Sprint, Updated
- Sortable columns
- Filterable (by status, assignee, label)
- Bulk actions (assign, change status)
```

**C. Timeline View (NEW)**
```typescript
// /projects?view=timeline
- Gantt chart showing phases over time
- Dependencies between tasks
- Agent assignments
- Progress indicators
```

**D. PLC View (Already built /plc)**
```typescript
- Phase pipeline visualization
- Current phase details
- Agent activity
- Progress tracking
```

**E. Agent View (Already built /agents)**
```typescript
- Active agents list
- Agent workload
- Performance metrics
```

---

### 3. **Configurable Workflows**

**Jira Pattern:**
```
To Do → In Progress → In Review → Done
        ↓           ↓
     Backlog    Blocked
```

**Our PLC Workflow:**
```
initiation → requirements → architecture → planning → execution → verification → review → approval → deployment → monitoring
     ↓             ↓            ↓            ↓
   cancelled     blocked      on_hold      failed
```

**Implementation:**
```typescript
// GitHub labels as workflow state
labels: [
  'phase:requirements',     // Current position
  'status:on-track',        // Health status
  'priority:high',          // Priority
  'type:feature-request'   // Type
]
```

**Workflow Rules (Automation):**
```typescript
// ultra:team-lead enforces rules
async function canAdvancePhase(projectId: string, fromPhase: string, toPhase: string) {
  // Rule 1: Must complete current phase
  const currentPhase = await getPhaseProgress(projectId, fromPhase)
  if (!currentPhase.complete) {
    throw new Error(`${fromPhase} phase not complete`)
  }

  // Rule 2: Architecture must be approved before planning
  if (toPhase === 'planning') {
    const architectureApproved = await checkLabel(projectId, 'architecture:approved')
    if (!architectureApproved) {
      throw new Error('Architecture not approved')
    }
  }

  // Rule 3: All tests must pass before review
  if (toPhase === 'review') {
    const testsPassing = await runTests(projectId)
    if (!testsPassing) {
      throw new Error('Tests not passing')
    }
  }

  return true
}
```

---

### 4. **Rich Issue Metadata**

**Jira Fields:**
- Summary, Description
- Issue Type (Epic, Story, Task, Bug)
- Priority (Blocker, Critical, Major, Minor, Trivial)
- Status, Resolution
- Assignee, Reporter
- Sprint, Epic Link
- Components, Labels
- Original Estimate, Time Spent, Remaining
- Attachment, Links
- Environment, Affects Version

**Our GitHub Issues Should Have:**

**Template for Feature Request:**
```markdown
# [FR] {Title}

**Type:** Feature Request
**Priority:** {High/Medium/Low}
**Project:** {ubuntu/hscheema1979/...}
**Complexity:** {Simple/Medium/Complex}

## Requirements
{user requirements}

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Technical Details
- **Approach:** {architecture decision}
- **Components:** {affected components}
- **Dependencies:** {other issues}
- **Estimate:** {time estimate}

## Implementation Plan
1. Phase 1: {description}
2. Phase 2: {description}
3. Phase 3: {description}

## Definition of Done
- [ ] Code complete
- [ ] Tests passing (>90% coverage)
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Deployed to production

**Labels:** `type:fr`, `priority:high`, `phase:initiation`, `agent:ultra-architect`
```

**Custom Fields via GitHub:**
- Use **labels** for categorical data
- Use **milestones** for releases/sprints
- Use **projects** for organization
- Use **comments** for time tracking

---

### 5. **Time Tracking**

**Jira Pattern:**
- Original Estimate
- Time Spent
- Remaining Estimate
- Work log entries

**Our Approach (GitHub + Agent Tracking):**

**A. Agent Time Tracking:**
```typescript
// Agents report time automatically
interface AgentTimeLog {
  agentId: string
  taskId: number
  phase: string
  started: string
  completed?: string
  duration: number  // milliseconds
}

// ultra:architect tracks time for subtasks
async function executePhase(phase: string) {
  const start = Date.now()

  await performPhaseWork(phase)

  const duration = Date.now() - start

  // Log time
  await createTimeLog({
    agent: 'ultra:architect',
    phase,
    duration,
    timestamp: new Date().toISOString()
  })

  // Post comment to GitHub
  await createComment(issueId, {
    body: `⏱️ ${phase} phase: ${formatDuration(duration)}`
  })
}
```

**B. Dashboard Shows:**
```
┌─────────────────────────────────┐
│ Time Tracking                   │
├─────────────────────────────────┤
│ Estimated: 4h                   │
│ Spent: 2h 15m                   │
│ Remaining: 1h 45m               │
│                                 │
│ Breakdown by Phase:             │
│ Requirements: 15m ✓             │
│ Architecture: 45m ✓             │
│ Planning: 30m ✓                 │
│ Execution: 1h (in progress)     │
└─────────────────────────────────┘
```

---

### 6. **Sprint/Release Planning**

**Jira Pattern:**
- Sprints (1-4 weeks)
- Sprint backlog
- Sprint goal
- Velocity tracking
- Burndown charts

**Our Approach (GitHub Milestones):**

**A. Milestones as Releases/Sprints:**
```typescript
milestone: "Sprint 1 (Week 1)"
dueDate: "2025-03-10"
issues: [123, 124, 125, 126]

milestone: "Sprint 2 (Week 2)"
dueDate: "2025-03-17"
issues: [127, 128, 129]
```

**B. ultra:team-lead Plans Sprints:**
```typescript
async function planSprint(milestoneId: string, capacity: number) {
  // Get candidate issues
  const issues = await getIssuesWithLabel('ready-for-sprint')

  // Estimate effort
  const estimates = await Promise.all(
    issues.map(issue => estimateEffort(issue))
  )

  // Select issues that fit capacity
  const selected = selectIssuesForSprint(estimates, capacity)

  // Assign to milestone
  for (const issue of selected) {
    await updateIssue(issue.id, { milestone: milestoneId })
  }

  // Create sprint board
  await createSprintBoard(milestoneId, selected)
}
```

**C. Dashboard Shows:**
- Sprint burndown chart
- Velocity chart
- Sprint capacity vs commitment
- Active sprints

---

### 7. **Reporting & Dashboards**

**Jira Reports:**
- Burndown chart
- Velocity chart
- Cumulative flow diagram
- Sprint report
- Release burndown
- Time tracking report

**Our Dashboard Reports:**

**A. PLC Progress Report:**
```typescript
// /reports/plc-progress
- Projects by phase
- Average time per phase
- Phase success rate
- Bottleneck identification
```

**B. Agent Performance Report:**
```typescript
// /reports/agent-performance
- Tasks completed per agent
- Average task time
- Success rate
- Error rate
- Utilization %
```

**C. Project Velocity Report:**
```typescript
// /reports/velocity
- Issues completed per week
- Points completed per sprint
- Trend over time
- Forecast completion
```

**D. Quality Metrics Report:**
```typescript
// /reports/quality
- Bug rate over time
- Test coverage trend
- Code quality scores
- Deployment success rate
```

---

### 8. **Automation & Rules**

**Jira Automation:**
- When issue created → assign to lead
- When status = "Ready for QA" → notify QA team
- When all subtasks done → transition parent
- When due date passed → escalate

**Our Agent Automations:**

**A. ultra:team-lead Automations:**
```typescript
// Rule 1: Auto-assign agents
when: issue.created with label 'type:fr'
then: assign ultra:architect

// Rule 2: Create subtasks for PLC
when: issue.created with label 'lifecycle'
then: create subtasks for each phase

// Rule 3: Advance phase when complete
when: phase.complete && phase.approved
then: advance to next phase

// Rule 4: Notify when blocked
when: status = 'blocked' > 1 hour
then: notify user + escalate to ultra:team-lead
```

**B. ultra:architect Automations:**
```typescript
// Rule 1: Create tasks from plan
when: planning.phase.complete
then: create implementation tasks

// Rule 2: Spawn executors
when: execution.phase.start
then: spawn parallel executors for independent tasks

// Rule 3: Run tests when code changes
when: files.committed
then: run test suite

// Rule 4: Request review when implementation done
when: execution.phase.complete
then: create PR + spawn reviewers
```

---

### 9. **Integrations**

**Jira Integrates With:**
- **Bitbucket/GitHub** - Commits, branches, PRs linked to issues
- **CI/CD** - Build/deploy status on issues
- **Slack/Teams** - Notifications
- **Confluence** - Documentation
- **Jira Service Management** - Customer support

**Our Dashboard Integrates:**

**A. GitHub (Native):**
- ✅ Issues = tasks
- ✅ Comments = discussion
- ✅ PRs = code delivery
- ✅ Project boards = Kanban
- ✅ Milestones = releases
- ✅ Labels = metadata
- ✅ Webhooks = real-time updates

**B. Relay Chat (Native):**
- ✅ User talks to agents
- ✅ Agents post updates
- ✅ @mentions for collaboration
- ✅ File sharing

**C. CI/CD (Future):**
```typescript
// When PR created → run CI
when: pull_request.opened
then: trigger GitHub Actions

// Update issue with CI status
when: workflow_run.completed
then: update issue with build status
```

**D. Notifications (Future):**
```typescript
// Notify on important events
when: phase.advanced
then: send notification to user

when: agent.failed
then: alert user
```

---

## Applied to Our Dashboard

### Dashboard Pages (Updated)

**1. Overview (/)** - Enhanced
```
┌─────────────────────────────────────┐
│ Active Sprints                      │
│ ├─ Sprint 1 (Week 1) - 60% complete │
│ └─ Sprint 2 (Week 2) - Planning     │
├─────────────────────────────────────┤
│ My Issues (assigned to me)          │
│ ├─ #123 REST API                    │
│ └─ #124 Login bug                   │
├─────────────────────────────────────┤
│ Recent Activity                     │
│ ├─ ultra:architect completed phase  │
│ └─ PR #156 merged                   │
└─────────────────────────────────────┘
```

**2. Board (/projects)** - Multiple views
```
[Board] [List] [Timeline] [Backlog]

Board View: (GitHub project board)
List View: (Sortable/filterable table)
Timeline View: (Gantt chart)
Backlog View: (Icebox for future work)
```

**3. PLC Manager (/plc)** - Phase control
```
Select: Project → Issue → Phase
See: Pipeline, progress, agents
Control: Advance, review, pause
```

**4. Agents (/agents)** - Agent management
```
Active agents, workload, performance
Reassign, spawn, monitor
```

**5. Sprints (/sprints)** - NEW
```
Sprint planning, capacity, velocity
Burndown charts
Sprint goals
```

**6. Reports (/reports)** - NEW
```
PLC progress, Agent performance
Velocity, Quality metrics
Custom reports
```

**7. GitHub (/github)** - Integration
```
Connection status, project boards
Recent activity, sync control
```

---

## Key Differences from Jira

### Jira Approach:
- User manually creates issues
- User manually assigns work
- User manually updates status
- User manually tracks time
- Reports show manual data

### Our Approach:
- **ultra:team-lead** creates/issues
- **ultra:architect** assigns work
- **Agents** update status automatically
- **Agents** track time automatically
- Reports show actual agent activity
- **AI-driven** project management

---

## Implementation Priority

### Phase 1: Core (Now)
- ✅ Board view (GitHub project boards)
- ✅ PLC Manager (/plc)
- ✅ Agents Monitor (/agents)
- ✅ GitHub Integration (/github)

### Phase 2: Enhanced Views
- List view with sorting/filtering
- Timeline/Gantt view
- Backlog/icebox view
- Sprint planning

### Phase 3: Automation
- ultra:team-lead rules engine
- ultra:architect workflows
- Auto-assignment logic
- Phase transition automation

### Phase 4: Reporting
- Velocity reports
- Burndown charts
- Agent performance
- Quality metrics

---

**This applies proven PM platform patterns to our AI agent orchestration system!** 🎯
