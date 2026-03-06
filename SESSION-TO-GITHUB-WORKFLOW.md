# 🔄 Session-to-GitHub Auto-Conversion System

**Status:** Design Complete
**Goal:** Convert Relay chat sessions (JSONL) → GitHub issues/comments with intent detection

---

## The Core Flow

```
User opens Relay chat in project (e.g., /p/ubuntu/)
         ↓
First message detected → Intent analysis
         ↓
    ┌────────────────┴────────────────┐
    │                             │
"Build/fix"                 "Review/analyze"
(Work Request)              (Inquiry)
    │                             │
    ↓                             ↓
GitHub FR Issue           GitHub Discussion
[ultra:architect]         [ultra:analyst]
    │                             │
    └──────────┬──────────────────┘
               ↓
    JSONL session → GitHub comments
               ↓
        Issue + Comments = Permanent record
```

---

## Intent Detection

### Type A: Feature Request (FR)
**Triggers:**
- "build", "create", "implement", "add", "fix"
- "not working", "broken", "error"
- Action verbs, specific deliverables

**Examples:**
- "Build a REST API for tasks"
- "Fix the login bug"
- "Add OAuth to the dashboard"

**Result:**
- Create GitHub issue with type: `feature-request`
- Assign to `ultra:architect`
- Add to project board "To Do"

### Type B: Review/Analysis (Inquiry)
**Triggers:**
- "how does", "explain", "show me", "what is"
- "review", "analyze", "understand"
- Question words, exploratory

**Examples:**
- "How does the auth flow work?"
- "Explain this component architecture"
- "What's the difference between these approaches?"

**Result:**
- Create GitHub Discussion or issue with type: `question`
- Assign to `ultra:analyst` or `ultra:reviewer`
- Add to "Backlog" or keep open for reference

### Type C: Bug Report
**Triggers:**
- "error", "bug", "crash", "broken"
- Stack traces, error messages

**Result:**
- GitHub issue with type: `bug`
- Assign to `ultra:debugger`
- High priority

---

## Session-to-GitHub Conversion

### Step 1: Session Start

```typescript
// User opens Relay chat in /p/ubuntu/
// Session ID: 87a4b7e8-70ce-4997-aa71-b6dee3c0fc74

interface SessionStart {
  sessionId: string
  projectId: string        // "ubuntu"
  githubRepo: string       // "hscheema1979/ubuntu-home"
  startTime: string        // ISO timestamp
  user: string             // Current user email
}
```

### Step 2: First Message Analysis

```typescript
// User sends first message
const firstMessage = "Build a REST API for task management"

// Intent detection
const intent = await detectIntent(firstMessage)
// → { type: 'feature-request', confidence: 0.95 }

// Create GitHub issue
const issue = await createGitHubIssue({
  owner: 'hscheema1979',
  repo: 'ubuntu-home',
  title: `[FR] Build a REST API for task management`,
  body: formatFeatureRequest({
    sessionId: '87a4b7e8-70ce-4997-aa71-b6dee3c0fc74',
    request: firstMessage,
    timestamp: new Date().toISOString()
  }),
  labels: [
    'type:feature-request',
    'status:pending',
    'project:ubuntu',
    'agent:ultra-architect'
  ]
})

// Store issue ID in session context
sessionContext.githubIssue = issue.id
sessionContext.intent = intent
```

### Step 3: Continue Chat → Add Comments

```typescript
// Every subsequent message becomes a GitHub comment

async function handleUserMessage(message: string) {
  // 1. Post as GitHub comment
  await createGitHubComment(sessionContext.githubIssue, {
    body: `**User:**\n\n${message}`
  })

  // 2. Get agent response
  const response = await agentChat(message)

  // 3. Post response as GitHub comment
  await createGitHubComment(sessionContext.githubIssue, {
    body: `**Agent (${response.agent}):**\n\n${response.content}`
  })

  // 4. Update issue if task completed
  if (response.status === 'complete') {
    await updateGitHubIssue(sessionContext.githubIssue, {
      state: 'closed',
      labels: ['status:completed']
    })
  }
}
```

### Step 4: Session End → Archive

```typescript
// Session ends (user closes chat)
await finalizeSession({
  sessionId: '87a4b7e8-70ce-4997-aa71-b6dee3c0fc74',
  githubIssue: 123,
  summary: generateSummary(),
  jsonlPath: '/home/ubuntu/.claude/projects/-home-ubuntu/87a4b7e8.jsonl'
})

// Add final comment to issue
await createGitHubComment(123, {
  body: formatSessionSummary({
    duration: '45 minutes',
    messages: 23,
    filesModified: ['src/api/tasks.ts', 'src/api/tasks.test.ts'],
    commits: ['abc123', 'def456'],
    jsonlUrl: 'https://github.com/.../session.jsonl'
  })
})
```

---

## JSONL → GitHub Transformation

### Raw JSONL Format

```jsonl
{"role":"user","content":"Build a REST API for task management","timestamp":"2025-03-05T22:00:00Z"}
{"role":"assistant","content":"I'll help you build a REST API for task management. Let me start by...","timestamp":"2025-03-05T22:00:05Z"}
{"role":"user","content":"Use Express.js and TypeScript","timestamp":"2025-03-05T22:05:00Z"}
{"role":"assistant","content":"Perfect! I'll use Express.js with TypeScript. Here's the architecture...","timestamp":"2025-03-05T22:05:10Z"}
{"role":"tool","name":"write","file":"src/api/tasks.ts","timestamp":"2025-03-05T22:10:00Z"}
{"role":"assistant","content":"I've created the task CRUD operations. Let me add tests...","timestamp":"2025-03-05T22:15:00Z"}
```

### Converted GitHub Issue

```markdown
# [FR] Build a REST API for task management

**Session ID:** 87a4b7e8-70ce-4997-aa71-b6dee3c0fc74
**Project:** ubuntu-home
**Created:** 2025-03-05T22:00:00Z
**Agent:** ultra:architect

---

## Initial Request

**User:** Build a REST API for task management

---

## Discussion

### ultra:architect (2025-03-05 22:00:05)

I'll help you build a REST API for task management. Let me start by analyzing requirements and designing the architecture...

---

### User (2025-03-05 22:05:00)

Use Express.js and TypeScript

---

### ultra:architect (2025-03-05 22:05:10)

Perfect! I'll use Express.js with TypeScript. Here's the architecture I'm planning:

**Endpoints:**
- GET /api/tasks - List all tasks
- GET /api/tasks/:id - Get single task
- POST /api/tasks - Create task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task

Let me implement this...

---

## Changes Made

**Files Modified:**
- `src/api/tasks.ts` - Created task CRUD operations
- `src/api/tasks.test.ts` - Added unit tests (47 passing)

**Commits:**
- abc123: "feat: Add task CRUD operations"
- def456: "test: Add task API tests"

---

## Session Summary

**Duration:** 45 minutes
**Messages:** 23
**Agent Involved:** ultra:architect
**Status:** ✅ Completed

**Session Transcript:** [View JSONL](https://github.com/.../session.jsonl)

---

**Labels:** `type:feature-request`, `status:completed`, `agent:ultra-architect`
```

---

## Intent Detection Engine

```typescript
// /lib/intent-detector.ts

interface IntentAnalysis {
  type: 'feature-request' | 'bug-report' | 'question' | 'review'
  confidence: number
  suggestedAgent: string
  suggestedLabels: string[]
}

export async function detectIntent(
  message: string,
  context?: SessionContext
): Promise<IntentAnalysis> {

  const patterns = {
    featureRequest: {
      triggers: [
        /\b(build|create|implement|add|make|develop)\b/i,
        /\b(new|feature|functionality|capability)\b/i,
        /\b(api|endpoint|service|component)\b/i
      ],
      agent: 'ultra:architect',
      labels: ['type:feature-request', 'status:pending']
    },

    bugReport: {
      triggers: [
        /\b(bug|error|crash|broken|not working|fail)\b/i,
        /\b(fix|repair|resolve)\b/i
      ],
      agent: 'ultra:debugger',
      labels: ['type:bug', 'priority:high', 'status:pending']
    },

    question: {
      triggers: [
        /\b(how|what|why|when|where|explain|show me)\b/i,
        /\?\?*$/  // Ends with question mark
      ],
      agent: 'ultra:analyst',
      labels: ['type:question', 'status:discussion']
    },

    review: {
      triggers: [
        /\b(review|analyze|audit|check|examine)\b/i,
        /\b(code|architecture|design|implementation)\b/i
      ],
      agent: 'ultra:reviewer',
      labels: ['type:review', 'status:discussion']
    }
  }

  // Score each pattern
  const scores = Object.entries(patterns).map(([type, config]) => {
    const matchCount = config.triggers.reduce((count, pattern) => {
      return count + (pattern.test(message) ? 1 : 0)
    }, 0)

    return {
      type,
      score: matchCount,
      agent: config.agent,
      labels: config.labels
    }
  })

  // Find highest scoring type
  const best = scores.sort((a, b) => b.score - a.score)[0]

  return {
    type: best.type as any,
    confidence: best.score > 0 ? 0.9 : 0.3,
    suggestedAgent: best.agent,
    suggestedLabels: best.labels
  }
}
```

---

## Project Auto-Detection

```typescript
// When user opens /p/ubuntu/

interface RelayProject {
  id: string
  path: string
  githubRepo?: string  // Auto-mapped
}

const projectMapping = {
  'ubuntu': {
    githubRepo: 'hscheema1979/ubuntu-home',
    path: '/home/ubuntu'
  },
  'hscheema1979': {
    githubRepo: 'hscheema1979/ultrapilot-dashboard',
    path: '/home/ubuntu/hscheema1979'
  },
  'myhealthteam': {
    githubRepo: 'creative-adventures/myhealthteam',
    path: '/home/ubuntu/myhealthteam'
  }
}

// Auto-detect from Relay project config
export function getGitHubRepo(projectId: string): string {
  return projectMapping[projectId]?.githubRepo || 'hscheema1979/ultrapilot-dashboard'
}
```

---

## Agent Selection Based on Intent

```typescript
// Auto-assign correct agent

const agentWorkflow = {
  'feature-request': [
    'ultra:analyst',      // Extract requirements
    'ultra:architect',    // Design architecture
    'ultra:planner',      // Create implementation plan
    'ultra:executor'      // Implement
  ],

  'bug-report': [
    'ultra:debugger',     // Investigate
    'ultra:executor',     // Fix
    'ultra:verifier'      // Verify fix
  ],

  'question': [
    'ultra:analyst'       // Answer questions
  ],

  'review': [
    'ultra:reviewer'      // Review code
  ]
}

// First message starts the workflow
async function startAgentWorkflow(intent: IntentAnalysis, issueId: number) {
  const agents = agentWorkflow[intent.type]

  // Spawn first agent
  const agent = await spawnAgent(agents[0], {
    taskId: issueId,
    githubIssue: issueId,
    intent: intent
  })

  return agent
}
```

---

## Session UI Integration

### Chat Interface Shows GitHub Status

```typescript
// Relay chat UI with GitHub integration
export function RelayChatWithGitHub({ projectId }: Props) {
  const [githubIssue, setGithubIssue] = useState<GitHubIssue | null>(null)
  const [intent, setIntent] = useState<IntentAnalysis | null>(null)

  // First message
  async function handleFirstMessage(message: string) {
    // Detect intent
    const detected = await detectIntent(message)
    setIntent(detected)

    // Show what's happening
    toast.show({
      title: 'Creating GitHub Issue',
      description: `${detected.type} → Assigning to ${detected.suggestedAgent}`
    })

    // Create GitHub issue
    const issue = await createGitHubIssueFromMessage(message, detected)
    setGithubIssue(issue)

    // Start agent workflow
    await startAgentWorkflow(detected, issue.id)
  }

  return (
    <div className="flex flex-col h-screen">
      {/* GitHub Issue Banner */}
      {githubIssue && (
        <div className="bg-muted border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="font-medium">#{githubIssue.number}</span>
              <Badge>{intent?.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {githubIssue.title}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() =>
              window.open(githubIssue.html_url, '_blank')
            }>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <ChatMessages />

      {/* Input Area */}
      <ChatInput onSend={!githubIssue ? handleFirstMessage : handleFollowUp} />
    </div>
  )
}
```

---

## Dashboard Integration

### New "Sessions" Page

```typescript
// src/app/sessions/page.tsx
export default function SessionsPage() {
  const { sessions } = useGitHubSessions()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Recent Sessions</h1>

        <div className="grid gap-4">
          {sessions.map(session => (
            <SessionCard key={session.id} session={session}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.project} • {formatDate(session.created)}
                  </p>
                  <p className="text-sm mt-2">{session.summary}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge>{session.intent}</Badge>
                  <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Continue
                  </Button>
                  <Button size="sm" variant="outline" onClick={() =>
                    window.open(session.githubUrl, '_blank')
                  }>
                    <Github className="h-4 w-4 mr-2" />
                    View Issue
                  </Button>
                </div>
              </div>
            </SessionCard>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
```

---

## Benefits

✅ **Permanent Record** - Every session becomes a GitHub issue
✅ **Auto-Detection** - Intent detected automatically
✅ **Agent Routing** - Right agent auto-assigned
✅ **Full Context** - JSONL transcript linked to issue
✅ **Searchable** - All sessions searchable in GitHub
✅ **Reviewable** - Can reference past work easily
✅ **Continuous** - Close issue, reopen later = continuation

---

## Example Session Flow

```
1. User opens /p/ubuntu/
   → Session ID: 87a4b7e8...

2. User types: "The auth middleware is throwing 500 errors"
   → Intent: bug-report detected
   → Creates GitHub issue #123
   → Title: "[BUG] Auth middleware throwing 500 errors"
   → Assigns: ultra:debugger
   → Status: pending

3. Agent responds: "I'll investigate..."
   → Comment posted to #123

4. Agent finds and fixes bug
   → Creates commit abc123
   → Comment: "Fixed in abc123 - null pointer in JWT validation"
   → Closes issue #123

5. JSONL session archived
   → Final comment with session summary
   → Link to full JSONL transcript

6. Dashboard shows:
   → Session card with "Bug Report" badge
   → "Completed" status
   → Link to GitHub issue #123
   → Link to JSONL file
```

---

## Implementation Priority

### Phase 1: Core Detection
- Intent detection engine
- First message → GitHub issue creation
- Session context tracking

### Phase 2: Agent Integration
- Auto-assign agents based on intent
- Agent responses → GitHub comments
- Issue status updates

### Phase 3: Session Archive
- JSONL → GitHub issue body
- Final summary generation
- JSONL file attachment

### Phase 4: UI
- GitHub status banner in chat
- Sessions page in dashboard
- Search/filter sessions

---

**This approach makes every conversation a permanent, searchable, trackable work item in GitHub!** 🎯
