# 🔄 Complete Project & Agent Lifecycle - Operations Playbook

**Status:** Complete System Design
**Goal:** End-to-end management, measurement, and execution of projects with agents

---

## The Complete Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    PROJECT LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. INITIATION                                                   │
│     ├─ User opens Relay chat in project                         │
│     ├─ Intent detection (FR/bug/review)                         │
│     ├─ GitHub issue created                                     │
│     └─ Agent auto-assigned                                      │
│                                                                   │
│  2. REQUIREMENTS (ultra:analyst)                                 │
│     ├─ Extract requirements from user                           │
│     ├─ Clarify ambiguities                                      │
│     ├─ Document in spec.md                                      │
│     └─ Get user approval                                        │
│                                                                   │
│  3. ARCHITECTURE (ultra:architect)                               │
│     ├─ Design system architecture                               │
│     ├─ Define components & interfaces                           │
│     ├─ Create diagrams & documentation                          │
│     └─ Get user approval                                        │
│                                                                   │
│  4. PLANNING (ultra:planner)                                     │
│     ├─ Break down into tasks                                    │
│     ├─ Create implementation plan                               │
│     ├─ Estimate effort                                          │
│     ├─ Define dependencies                                      │
│     └─ Get user approval                                        │
│                                                                   │
│  5. EXECUTION (ultra:executor team)                              │
│     ├─ Parallel task execution                                  │
│     ├─ Code changes                                             │
│     ├─ Git commits                                             │
│     ├─ Progress tracking                                        │
│     └─ Update GitHub issues                                     │
│                                                                   │
│  6. VERIFICATION (ultra:verifier)                                │
│     ├─ Run tests                                                │
│     ├─ Check quality gates                                      │
│     ├─ Verify requirements met                                  │
│     └─ Document results                                         │
│                                                                   │
│  7. REVIEW (ultra:reviewer)                                      │
│     ├─ Security review                                          │
│     ├─ Quality review                                           │
│     ├─ Performance review                                       │
│     └─ Code review                                              │
│                                                                   │
│  8. APPROVAL (User)                                              │
│     ├─ Review changes                                           │
│     ├─ Test in environment                                      │
│     ├─ Approve or request changes                               │
│     └─ Merge to main                                             │
│                                                                   │
│  9. DEPLOYMENT (ultra:deployer)                                  │
│     ├─ Deploy to staging                                        │
│     ├─ Smoke tests                                              │
│     ├─ Deploy to production                                     │
│     └─ Monitor                                                   │
│                                                                   │
│  10. MONITORING (System)                                          │
│      ├─ Track metrics                                           │
│      ├─ Monitor errors                                          │
│      ├─ Collect feedback                                        │
│      └─ Generate reports                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: INITIATION

### Trigger Points
1. **User opens Relay chat** in `/p/{project}/`
2. **User sends first message**
3. **Intent detected**
4. **GitHub issue created**

### Data Collection
```typescript
interface SessionInitiation {
  sessionId: string
  projectId: string
  githubRepo: string
  timestamp: string
  user: string

  // Intent analysis
  intent: {
    type: 'feature-request' | 'bug-report' | 'question' | 'review'
    confidence: number
    agent: string
    priority: 'low' | 'medium' | 'high' | 'critical'
  }

  // Initial request
  request: {
    message: string
    context: string[]
    attachments?: string[]
  }

  // GitHub integration
  github: {
    issueId: number
    issueUrl: string
    milestone?: string
    labels: string[]
  }
}
```

### GitHub Issue Template

```markdown
# [{TYPE}] {Title}

**Session ID:** {sessionId}
**Project:** {projectId}
**Created:** {timestamp}
**User:** {user}

---

## Initial Request

{user_message}

---

## Intent Analysis

- **Type:** {intent_type}
- **Confidence:** {confidence}%
- **Suggested Agent:** {agent}
- **Priority:** {priority}

---

## Context

**Project:** {githubRepo}
**Working Directory:** {projectPath}
**Branch:** {branch}

---

## Progress

- [ ] Requirements gathering
- [ ] Architecture design
- [ ] Implementation planning
- [ ] Execution
- [ ] Verification
- [ ] Review
- [ ] Deployment

---

**Labels:** {labels}
**Agent:** {agent}
**Status:** pending
```

---

## Phase 2-4: DISCOVERY (Requirements, Architecture, Planning)

### Agent Workflow

```typescript
// ultra:analyst
async function gatherRequirements(issueId: number) {
  // 1. Read initial request from GitHub issue
  const issue = await getGitHubIssue(issueId)
  const userRequest = issue.body

  // 2. Ask clarifying questions
  const questions = await generateQuestions(userRequest)
  await postGitHubComment(issueId, {
    body: formatQuestions(questions)
  })

  // 3. Wait for user responses
  const answers = await waitForUserResponses(issueId)

  // 4. Create requirements document
  const requirements = await extractRequirements(answers)
  await createSpecFile(projectId, requirements)

  // 5. Post requirements summary to GitHub
  await postGitHubComment(issueId, {
    body: formatRequirementsSummary(requirements)
  })

  // 6. Update issue status
  await updateIssueLabels(issueId, ['phase:requirements-complete'])

  return requirements
}

// ultra:architect
async function designArchitecture(requirements: any, issueId: number) {
  // 1. Analyze requirements
  const analysis = await analyzeRequirements(requirements)

  // 2. Design architecture
  const architecture = await designSystem(analysis)

  // 3. Create diagrams
  const diagrams = await createDiagrams(architecture)

  // 4. Document interfaces
  const interfaces = await defineInterfaces(architecture)

  // 5. Post architecture to GitHub
  await postGitHubComment(issueId, {
    body: formatArchitectureDocument(architecture, diagrams)
  })

  // 6. Create spec.md with architecture
  await updateSpecFile(projectId, {
    requirements,
    architecture,
    interfaces
  })

  // 7. Update issue
  await updateIssueLabels(issueId, ['phase:architecture-complete'])

  return architecture
}

// ultra:planner
async function createPlan(architecture: any, issueId: number) {
  // 1. Break down into tasks
  const tasks = await decomposeIntoTasks(architecture)

  // 2. Estimate effort
  const estimates = await estimateTasks(tasks)

  // 3. Define dependencies
  const dependencies = await identifyDependencies(tasks)

  // 4. Create implementation plan
  const plan = await createImplementationPlan(tasks, estimates, dependencies)

  // 5. Post plan to GitHub
  await postGitHubComment(issueId, {
    body: formatImplementationPlan(plan)
  })

  // 6. Create subtasks for each task
  const subtasks = await createGitHubSubtasks(issueId, tasks)

  // 7. Add to project board
  await addTasksToProjectBoard(subtasks, 'todo')

  // 8. Update spec.md
  await updateSpecFile(projectId, { plan })

  // 9. Update issue
  await updateIssueLabels(issueId, ['phase:planning-complete'])

  return plan
}
```

---

## Phase 5: EXECUTION

### Task Distribution

```typescript
interface Task {
  id: string
  parentId: number  // GitHub issue number
  title: string
  description: string
  assignee: string  // Which agent
  dependencies: string[]  // Other task IDs
  files: string[]  // Files this task will modify
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  estimated: number  // Minutes
  actual?: number  // Minutes
}

// ultra:team-lead orchestrates
async function executePlan(plan: ImplementationPlan, issueId: number) {
  // 1. Create GitHub subtasks
  const subtasks = await createSubtasks(plan.tasks)

  // 2. Spawn executor agents in parallel (respecting dependencies)
  const agents = await spawnExecutors(subtasks)

  // 3. Monitor progress
  await monitorExecution(agents, issueId)

  // 4. Handle failures
  await handleFailures(agents)

  // 5. Collect results
  const results = await collectResults(agents)

  // 6. Post summary to GitHub
  await postGitHubComment(issueId, {
    body: formatExecutionSummary(results)
  })

  return results
}

// Individual ultra:executor
async function executeTask(task: Task) {
  // 1. Update GitHub subtask to "in-progress"
  await updateGitHubTask(task.id, { status: 'in-progress' })

  // 2. Create feature branch
  const branch = `feature/task-${task.id}`
  await gitCheckout(branch)

  // 3. Execute task
  const result = await performTask(task)

  // 4. Commit changes
  const commit = await gitCommit({
    message: `[TASK-${task.id}] ${task.title}`,
    files: result.files
  })

  // 5. Run tests
  const testResults = await runTests()

  // 6. Create PR
  const pr = await createPullRequest({
    title: `[TASK-${task.id}] ${task.title}`,
    body: formatPRDescription(result),
    branch: branch,
    base: 'main'
  })

  // 7. Update GitHub subtask to "completed"
  await updateGitHubTask(task.id, {
    status: 'completed',
    pr: pr.number,
    commit: commit.hash
  })

  // 8. Post PR link to parent issue
  await postGitHubComment(task.parentId, {
    body: `✅ Completed [TASK-${task.id}](${pr.url})`
  })

  return { result, commit, pr, testResults }
}
```

---

## Phase 6-7: VERIFICATION & REVIEW

### Automated Verification

```typescript
// ultra:verifier
async function verifyWork(issueId: number) {
  // 1. Get all PRs for this issue
  const prs = await getIssuePullRequests(issueId)

  const results = []

  for (const pr of prs) {
    // 2. Run test suite
    const tests = await runTestSuite(pr.head)

    // 3. Check code quality
    const quality = await runLinter(pr.head)

    // 4. Security scan
    const security = await runSecurityScan(pr.head)

    // 5. Performance check
    const performance = await runPerformanceTests(pr.head)

    // 6. Verify requirements
    const requirements = await verifyRequirementsMet(pr.head)

    results.push({
      pr: pr.number,
      tests,
      quality,
      security,
      performance,
      requirements
    })
  }

  // 7. Post verification report
  await postGitHubComment(issueId, {
    body: formatVerificationReport(results)
  })

  // 8. Update labels
  const allPassed = results.every(r =>
    r.tests.passed &&
    r.quality.score > 80 &&
    !r.security.issues &&
    r.requirements.met
  )

  if (allPassed) {
    await updateIssueLabels(issueId, ['verification:passed'])
  } else {
    await updateIssueLabels(issueId, ['verification:failed'])
  }

  return results
}
```

### Multi-Dimensional Review

```typescript
// Spawn all reviewers in parallel
async function reviewWork(issueId: number) {
  const reviewers = await Promise.all([
    spawnAgent('ultra:security-reviewer', { issueId }),
    spawnAgent('ultra:quality-reviewer', { issueId }),
    spawnAgent('ultra:performance-reviewer', { issueId }),
    spawnAgent('ultra:code-reviewer', { issueId })
  ])

  const results = await Promise.all(
    reviewers.map(r => r.wait())
  )

  // Aggregate reviews
  const review = {
    security: results[0],
    quality: results[1],
    performance: results[2],
    code: results[3]
  }

  // Post review to GitHub
  await postGitHubComment(issueId, {
    body: formatReviewReport(review)
  })

  // Check if all approved
  const allApproved = results.every(r => r.approved)

  if (allApproved) {
    await updateIssueLabels(issueId, ['review:approved'])
  } else {
    await updateIssueLabels(issueId, ['review:changes-requested'])
  }

  return review
}
```

---

## Phase 8-9: APPROVAL & DEPLOYMENT

### User Approval Workflow

```typescript
// Wait for user approval
async function waitForApproval(issueId: number) {
  // 1. Post approval request
  await postGitHubComment(issueId, {
    body: `
      ✅ **Ready for Review**

      All checks passed. Please review and approve:

      - [ ] Review PRs
      - [ ] Test in staging
      - [ ] Approve deployment

      Reply \`/approve\` when ready.
    `
  })

  // 2. Wait for /approve command
  const approval = await waitForComment(issueId, (comment) => {
    return comment.body.includes('/approve') &&
           comment.author.type === 'User'
  })

  // 3. Merge all PRs
  const prs = await getIssuePullRequests(issueId)
  for (const pr of prs) {
    await mergePullRequest(pr.number)
  }

  // 4. Update issue
  await updateGitHubIssue(issueId, {
    state: 'closed'
  })

  return approval
}
```

### Deployment

```typescript
// ultra:deployer
async function deploy(issueId: number) {
  // 1. Deploy to staging
  await deployToStaging()

  // 2. Run smoke tests
  const smokeTests = await runSmokeTests('staging')

  if (!smokeTests.passed) {
    await postGitHubComment(issueId, {
      body: `❌ Staging smoke tests failed. Aborting deployment.`
    })
    throw new Error('Smoke tests failed')
  }

  // 3. Deploy to production
  await deployToProduction()

  // 4. Run smoke tests
  const prodTests = await runSmokeTests('production')

  // 5. Monitor for 5 minutes
  const health = await monitorHealth(5 * 60 * 1000)

  // 6. Post deployment summary
  await postGitHubComment(issueId, {
    body: formatDeploymentSummary({
      staging: smokeTests,
      production: prodTests,
      health
    })
  })

  return { smokeTests, prodTests, health }
}
```

---

## Phase 10: MONITORING & METRICS

### Metrics Collection

```typescript
interface ProjectMetrics {
  // Time metrics
  cycleTime: number          // Total time from request to deployment
  leadTime: number           // Time to first response
  activeTime: number         // Actual work time
  waitTime: number           // Waiting time (reviews, approvals)

  // Quality metrics
  bugRate: number            // Bugs found post-deployment
  testCoverage: number       // % of code covered
  codeQualityScore: number   // Linter score

  // Agent metrics
  agentsInvolved: string[]   // Which agents participated
  agentTime: Record<string, number>  // Time per agent

  // User metrics
  satisfaction: number       // User rating (1-5)
  iterations: number         // How many iterations

  // Outcome
  status: 'success' | 'failed' | 'partial'
  issuesCreated: number      // GitHub issues created
  prsCreated: number         // Pull requests created
  linesChanged: number       // Lines of code changed
}

async function collectMetrics(issueId: number): Promise<ProjectMetrics> {
  const issue = await getGitHubIssue(issueId)
  const comments = await getIssueComments(issueId)
  const events = await getIssueEvents(issueId)

  // Calculate cycle time
  const created = new Date(issue.created_at)
  const closed = new Date(issue.closed_at)
  const cycleTime = closed.getTime() - created.getTime()

  // Agent participation
  const agentsInvolved = [
    ...new Set(
      comments
        .filter(c => c.author_type === 'Bot')
        .map(c => extractAgentFromComment(c))
    )
  ]

  // Count PRs
  const prs = await getIssuePullRequests(issueId)

  return {
    cycleTime,
    leadTime: calculateLeadTime(events),
    activeTime: calculateActiveTime(comments),
    waitTime: calculateWaitTime(comments),
    bugRate: 0, // Tracked post-deployment
    testCoverage: await getCoverage(issueId),
    codeQualityScore: await getQualityScore(issueId),
    agentsInvolved,
    agentTime: calculateAgentTime(comments),
    satisfaction: await getUserSatisfaction(issueId),
    iterations: calculateIterations(comments),
    status: issue.labels.includes('status:completed') ? 'success' : 'failed',
    issuesCreated: 1,
    prsCreated: prs.length,
    linesChanged: await calculateLinesChanged(prs)
  }
}
```

---

## Dashboard Implementation

### Page: /lifecycle

```typescript
// src/app/lifecycle/page.tsx
export default function LifecyclePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Project Lifecycle</h1>

        {/* Lifecycle Visualization */}
        <LifecycleVisualization />

        {/* Active Projects */}
        <ActiveProjectsList />

        {/* Metrics Dashboard */}
        <LifecycleMetrics />
      </div>
    </DashboardLayout>
  )
}
```

### Lifecycle Progress Component

```typescript
// src/components/lifecycle/lifecycle-progress.tsx
export function LifecycleProgress({ issueId }: Props) {
  const { issue, events } = useGitHubIssue(issueId)
  const phase = detectCurrentPhase(issue.labels)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          <Progress value={calculateProgress(phase)} />

          {/* Phase Steps */}
          <div className="grid grid-cols-10 gap-2">
            {PHASES.map((p, i) => (
              <PhaseStep
                key={p.id}
                phase={p}
                current={phase}
                index={i}
                completed={isPhaseCompleted(issue, p.id)}
              />
            ))}
          </div>

          {/* Current Activity */}
          <CurrentActivity issueId={issueId} />

          {/* Next Steps */}
          <NextSteps phase={phase} />
        </div>
      </CardContent>
    </Card>
  )
}

const PHASES = [
  { id: 'initiation', name: 'Initiation', icon: Zap },
  { id: 'requirements', name: 'Requirements', icon: FileText },
  { id: 'architecture', name: 'Architecture', icon: Layout },
  { id: 'planning', name: 'Planning', icon: ListTodo },
  { id: 'execution', name: 'Execution', icon: Code },
  { id: 'verification', name: 'Verification', icon: CheckCircle },
  { id: 'review', name: 'Review', icon: GitBranch },
  { id: 'approval', name: 'Approval', icon: User },
  { id: 'deployment', name: 'Deployment', icon: Rocket },
  { id: 'monitoring', name: 'Monitoring', icon: BarChart }
]
```

### Metrics Dashboard

```typescript
// src/components/lifecycle/metrics-dashboard.tsx
export function MetricsDashboard() {
  const { metrics } = useLifecycleMetrics()

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Time Metrics */}
      <MetricCard
        title="Avg Cycle Time"
        value={formatDuration(metrics.avgCycleTime)}
        icon={Clock}
        trend={metrics.cycleTimeTrend}
      />

      {/* Quality Metrics */}
      <MetricCard
        title="Bug Rate"
        value={`${metrics.bugRate}%`}
        icon={Bug}
        trend={metrics.bugRateTrend}
      />

      {/* Agent Metrics */}
      <MetricCard
        title="Active Agents"
        value={metrics.activeAgents}
        icon={Bot}
      />

      {/* User Metrics */}
      <MetricCard
        title="Satisfaction"
        value={`${metrics.satisfaction}/5`}
        icon={Star}
        trend={metrics.satisfactionTrend}
      />

      {/* Velocity Chart */}
      <VelocityChart data={metrics.velocity} />

      {/* Agent Distribution */}
      <AgentDistribution data={metrics.agentTime} />

      {/* Quality Trends */}
      <QualityTrends data={metrics.quality} />
    </div>
  )
}
```

---

## Operations Playbook Functions

### 1. Project Health Score

```typescript
function calculateProjectHealth(metrics: ProjectMetrics): number {
  const scores = {
    cycleTime: normalizeScore(metrics.cycleTime, 0, MAX_CYCLE_TIME),
    quality: metrics.codeQualityScore / 100,
    bugs: 1 - (metrics.bugRate / 100),
    tests: metrics.testCoverage / 100,
    satisfaction: metrics.satisfaction / 5
  }

  return Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
}
```

### 2. Agent Efficiency

```typescript
function calculateAgentEfficiency(agentId: string): number {
  const completedTasks = await getAgentCompletedTasks(agentId)
  const totalTime = await getAgentTotalTime(agentId)

  const efficiency = completedTasks / (totalTime / 60) // Tasks per hour
  return efficiency
}
```

### 3. Bottleneck Detection

```typescript
function detectBottlenecks(projectId: string): Bottleneck[] {
  const issues = await getProjectIssues(projectId)

  const bottlenecks = []

  // Check for stuck phases
  const phaseDistribution = calculatePhaseDistribution(issues)
  for (const [phase, count] of Object.entries(phaseDistribution)) {
    if (count > THRESHOLD) {
      bottlenecks.push({
        type: 'phase',
        phase,
        count,
        severity: 'high'
      })
    }
  }

  // Check for slow agents
  const agentTimes = await calculateAgentTimes(issues)
  for (const [agent, time] of Object.entries(agentTimes)) {
    if (time > SLOW_THRESHOLD) {
      bottlenecks.push({
        type: 'agent',
        agent,
        time,
        severity: 'medium'
      })
    }
  }

  return bottlenecks
}
```

---

## API Endpoints

```typescript
// /api/lifecycle/*
GET  /api/lifecycle/active          // Get all active projects
GET  /api/lifecycle/:issueId         // Get project lifecycle data
GET  /api/lifecycle/:issueId/metrics // Get project metrics
GET  /api/lifecycle/:issueId/phase   // Get current phase
POST /api/lifecycle/:issueId/advance // Advance to next phase
GET  /api/lifecycle/health           // Get overall system health
GET  /api/lifecycle/bottlenecks      // Detect bottlenecks
GET  /api/lifecycle/agents/:agentId  // Get agent performance
```

---

**This complete lifecycle system enables full visibility, management, and optimization of every project from initiation to deployment!** 🎯
