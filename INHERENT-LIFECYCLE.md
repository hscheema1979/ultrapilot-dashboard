# Inherent Lifecycle Management - Agent Orchestration

**Correct Approach:** Lifecycle is **invisible/background**, managed by agents, not a separate UI

---

## The Wrong Approach (What I Just Built)

❌ Separate `/lifecycle` page
❌ User has to go view lifecycle progress
❌ Manual tracking
❌ Separated from actual work

---

## The Right Approach (What You Want)

✅ **Inherent lifecycle** - happens automatically in background
✅ **ultra:team-lead** orchestrates everything
✅ **ultra:architect** reviews and manages technical lifecycle
✅ Main dashboard just **shows current state naturally**
✅ Relay chat shows progress naturally
✅ No separate pages needed

---

## How It Should Work

### User Experience

```
User: Opens Relay chat in /p/ubuntu/
User: "Build a REST API for task management"

[System - BACKGROUND, INVISIBLE]
→ ultra:team-lead detects request
→ Creates GitHub issue automatically
→ Assigns ultra:architect to lead
→ ultra:architect breaks down phases
→ Spawns sub-agents for each phase
→ Manages handoffs between phases
→ Tracks progress automatically
→ Updates GitHub issues automatically
→ Moves to next phase when complete

[User just sees in Relay chat]:
Agent: I'll help you build a REST API. Let me start by gathering requirements...
Agent: Requirements clear. Now designing architecture...
Agent: Architecture complete. Creating implementation plan...
Agent: Plan approved. Starting implementation...

[User just sees in main dashboard /]:
- Projects board shows "REST API" card
- Progress bar updates automatically
- Status badge: "In Progress - Architecture Phase"
- Metrics update in real-time
```

### Agent Orchestration

```typescript
// ultra:team-lead - The invisible conductor
class UltraTeamLead {
  async orchestrate(userRequest: string, project: string) {
    // 1. Create GitHub issue (background)
    const issue = await this.createGitHubIssue(userRequest)

    // 2. Detect what's needed
    const analysis = await this.analyzeRequest(userRequest)

    // 3. Assign ultra:architect as lead
    const architect = await this.spawn('ultra:architect', {
      taskId: issue.id,
      role: 'technical-lead',
      scope: analysis
    })

    // 4. ultra:architect manages the lifecycle
    await architect.manageLifecycle({
      requirements: () => this.spawn('ultra:analyst'),
      architecture: () => this.doArchitecture(),
      planning: () => this.spawn('ultra:planner'),
      execution: () => this.spawnTeam('ultra:executor'),
      verification: () => this.spawn('ultra:verifier'),
      review: () => this.spawnReviewers(),
      deployment: () => this.spawn('ultra:deployer')
    })

    // 5. Monitor and manage automatically
    await this.monitorProgress(issue.id)

    // 6. User just sees results in chat
  }
}
```

### ultra:architect Role

```typescript
// ultra:architect - Technical lifecycle manager
class UltraArchitect {
  async manageLifecycle(phases: Record<string, () => Agent>) {
    for (const [phaseName, spawnAgent] of Object.entries(phases)) {
      // Move to this phase
      await this.updateGitHubPhase(phaseName)

      // Spawn agent for this phase
      const agent = await spawnAgent()

      // Monitor agent work
      await this.monitorAgent(agent)

      // Verify phase completion
      const complete = await this.verifyPhase(phaseName)
      if (!complete) {
        // Handle issues - maybe iterate
        await this.handlePhaseIssue(phaseName)
        continue
      }

      // Notify user (in chat)
      await this.notifyUser(`✅ ${phaseName} complete`)

      // Handoff to next phase
      await this.handoff(phaseName, getNextPhase(phaseName))
    }

    // All phases complete
    await this.notifyUser('🎉 Project complete!')
    await this.closeGitHubIssue()
  }
}
```

---

## What the User Sees

### In Main Dashboard (/)

**Projects Tab (Already exists):**
```
┌─────────────────────────────────────┐
│ Active Projects                     │
├─────────────────────────────────────┤
│                                     │
│ ┌───────────────────────────────┐  │
│ │ REST API for Tasks            │  │
│ │ Status: Architecture Phase    │  │
│ │ Progress: ████████░░ 80%      │  │
│ │ Agent: ultra:architect        │  │
│ │ Started: 2h ago               │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Fix Login Bug                 │  │
│ │ Status: Execution Phase       │  │
│ │ Progress: █████████░ 90%      │  │
│ │ Agent: ultra:debugger         │  │
│ │ Started: 45min ago            │  │
│ └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**No separate lifecycle page needed - it's just THERE**

### In Relay Chat

User sees natural conversation:
```
Agent (ultra:architect): I'll build a REST API for task management.
                     Let me start by gathering requirements...

Agent (ultra:architect): Requirements documented. Now designing
                     the system architecture...

Agent (ultra:architect): Architecture complete. Creating implementation
                     plan with 5 tasks...

Agent (ultra:team-lead): Spawning 3 executors for parallel implementation...

Agent (ultra:executor-1): Built task CRUD endpoints...

Agent (ultra:executor-2): Built user management endpoints...

Agent (ultra:architect): All components implemented. Running verification...

Agent (ultra:verifier): All 47 tests passing ✅

Agent (ultra:architect): Ready for deployment. Approve?
```

**Just natural chat - lifecycle happens invisibly**

---

## ultra:team-lead Responsibilities

### 1. Request Analysis
```typescript
async analyzeRequest(request: string) {
  return {
    type: detectType(request),  // FR, bug, review
    complexity: estimateComplexity(request),
    phasesNeeded: determinePhases(request),
    agentsNeeded: selectAgents(request),
    timeline: estimateTimeline(request)
  }
}
```

### 2. Resource Planning
```typescript
async planResources(analysis) {
  // Spawn right agents at right time
  // Manage parallel vs sequential execution
  // Handle dependencies
  // Optimize for speed and quality
}
```

### 3. Progress Monitoring
```typescript
async monitorProgress(issueId: number) {
  // Watch GitHub issue for updates
  // Track agent activity
  // Detect bottlenecks
  // Reassign if needed
  // Keep user informed
}
```

### 4. Quality Gates
```typescript
async enforceQualityGate(phase: string) {
  // Each phase has exit criteria
  // Don't proceed until criteria met
  // Example: Can't go from Architecture → Planning
  //          unless architecture is approved
}
```

### 5. User Communication
```typescript
async keepUserInformed(issueId: number) {
  // Post updates to GitHub issue
  // Send messages to Relay chat
  // Update dashboard metrics
  // Ask for approvals when needed
}
```

---

## ultra:architect Responsibilities

### 1. Technical Leadership
- Owns the technical vision
- Makes architectural decisions
- Approves technical approaches
- Reviews code and designs

### 2. Phase Management
```typescript
async managePhase(phase: string) {
  // Define what "done" means for this phase
  // Execute phase work
  // Verify completion
  // Get approval if needed
  // Hand off to next phase
}
```

### 3. Agent Coordination
```typescript
async coordinateAgents(phase: string) {
  // Spawn sub-agents
  // Assign tasks
  // Monitor progress
  // Resolve conflicts
  // Merge results
}
```

### 4. Decision Making
- When to iterate on a phase
- When to proceed to next phase
- When to escalate issues
- When to ask user for input

---

## Dashboard Integration (Natural)

### Main Dashboard (/) - Projects Tab

**Already exists, just enhance:**

```typescript
// src/app/page.tsx - Projects Tab
<TabsContent value="projects">
  <ProjectsBoard />
</TabsContent>
```

**Enhanced ProjectsBoard component:**
- Shows all active projects from GitHub issues
- Progress bar from phase tracking
- Current phase badge
- Active agents
- Time tracking
- All from GitHub labels and comments

**No new page needed**

### Relay Chat Integration

**Chat interface shows:**
- Active project context
- Current phase
- Progress updates
- Agent messages

**All automatic, invisible lifecycle management**

---

## GitHub as State Machine

### Issue Labels Represent State

```markdown
issue: #123
labels:
  - lifecycle                    # This is a managed project
  - phase:execution             # Current phase
  - agent:ultra-architect        # Lead agent
  - project:ubuntu               # Relay project
  - type:feature-request        # Request type
  - status:on-track              # Health status
```

### Phase Transitions

```
initiation → requirements → architecture → planning → execution → verification → review → approval → deployment → done
     ↓              ↓              ↓            ↓          ↓           ↓            ↓         ↓          ↓      ↓
  Create      ultra:       ultra:        ultra:      Spawn       ultra:      Spawn     ultra:  ultra:   Close
  Issue       analyst       architect    planner    executors   verifier   reviewers  deployer
```

### Comments as Progress Log

```markdown
[PHASE] Requirements - STARTED
Agent: ultra:analyst
Time: 2025-03-05 22:00

Gathering requirements from user...

[PHASE] Requirements - COMPLETE
Agent: ultra:analyst
Time: 2025-03-05 22:15
Duration: 15min

Requirements documented in spec.md
User approved
Moving to architecture phase

[PHASE] Architecture - STARTED
Agent: ultra:architect
Time: 2025-03-05 22:16
```

---

## Implementation (Correct Way)

### Agent Skills to Create

**1. ultra:team-lead**
```bash
# Location: ~/.claude/skills/ultra-team-lead/

Responsibilities:
- Receive user requests
- Create GitHub issues
- Analyze and plan
- Orchestrate lifecycle
- Monitor progress
- Keep user informed
```

**2. ultra:architect (enhanced)**
```bash
# Already exists, enhance with:
- Phase management
- Agent coordination
- Technical decisions
- Quality gates
- Progress tracking
```

### Dashboard Enhancements

**Projects Tab Enhancement:**
```typescript
// src/components/dashboard/projects-board.tsx
// Already exists, just add:
// - Phase detection from labels
// - Progress calculation from phase
// - Active agent display
// - Real-time updates from GitHub webhooks
```

**No new pages needed**

---

## User Experience (Correct)

### Starting a Project

```
User: [Opens Relay chat in /p/ubuntu/]
User: Build a REST API for task management

[INVISIBLE BACKGROUND]
→ ultra:team-lead detects request
→ Creates GitHub issue #123
→ Assigns ultra:architect
→ ultra:architect starts requirements phase

[USER SEES IN CHAT]
ultra:architect: I'll build a REST API for task management.
                Let me start by gathering requirements...

[USER SEES IN DASHBOARD / → Projects Tab]
Card appears: "REST API for Tasks"
Progress: 10% (Requirements phase)
Agent: ultra:architect
```

### During Execution

```
[INVISIBLE BACKGROUND]
→ ultra:architect completes requirements
→ Moves to architecture phase
→ Designs system
→ Moves to planning phase
→ Creates implementation plan
→ Spawns 3 ultra:executors
→ Monitors progress
→ Handles any issues
→ Moves to verification
→ Runs tests
→ Moves to review
→ Spawns reviewers
→ All approve
→ Asks for deployment approval

[USER SEES IN CHAT]
ultra:architect: Requirements complete ✅
                Architecture complete ✅
                Implementation plan ready ✅
                Spawning team...
                ultra:executor-1: Built task endpoints ✅
                ultra:executor-2: Built user endpoints ✅
                ultra:executor-3: Built auth endpoints ✅
                Verification complete ✅
                Review complete ✅
                Ready to deploy. Approve?

[USER SEES IN DASHBOARD]
"REST API for Tasks" card
Progress: 90% (Approval phase)
Agents: ultra:architect + 3 executors
Status: Ready for deployment
```

### Completion

```
User: /approve

[INVISIBLE BACKGROUND]
→ ultra:architect deploys to staging
→ Runs smoke tests
→ Deploys to production
→ Monitors for 5min
→ Closes GitHub issue #123
→ Collects metrics

[USER SEES IN CHAT]
ultra:architect: Deployed to production ✅
                Monitoring for 5min...
                All systems healthy ✅
                Project complete! 🎉

[USER SEES IN DASHBOARD]
"REST API for Tasks" card moves to "Completed"
Metrics:
  Cycle time: 2h 15min
  Test coverage: 95%
  Code quality: 88/100
  Satisfaction: 5/5
```

---

## Key Insight

**The lifecycle is NOT a UI feature - it's an agent orchestration system.**

- **ultra:team-lead** = Project manager (invisible)
- **ultra:architect** = Tech lead (visible in chat)
- **Dashboard** = Just shows current state naturally
- **Relay chat** = Natural communication interface
- **GitHub** = Source of truth and state machine

**No separate lifecycle page needed. It's INHERENT.**

---

## What to Build Instead

### 1. ultra:team-lead skill
- Orchestrates lifecycle automatically
- Manages GitHub issues
- Coordinates agents
- Monitors progress
- Invisible to user unless needed

### 2. Enhance ultra:architect
- Add phase management
- Add agent coordination
- Add quality gates
- Add decision making

### 3. Enhance Projects Board
- Show phase from GitHub labels
- Show progress from phase
- Show agents from comments
- Real-time updates via webhooks

### 4. NO /lifecycle page
- Delete it
- Use main dashboard /
- Use existing Projects tab
- Lifecycle is invisible/background

---

**The RIGHT way: Inherent, automatic, agent-managed lifecycle.** ✅
