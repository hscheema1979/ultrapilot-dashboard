# 🔗 Deep Integration: Relay Chat ↔ GitHub App ↔ Mission Control Dashboard

**Status:** Architecture Design
**Goal:** Unified system where chat, GitHub, and dashboard are one cohesive experience

---

## Overview

Create a **seamless tri-directional integration** where:

1. **Relay Chat Interface** → User interacts with agents
2. **GitHub App** → Tasks, issues, PRs, project boards (single source of truth)
3. **Mission Control Dashboard** → Real-time visibility, metrics, controls

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER EXPERIENCE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Relay Chat Interface              Mission Control Dashboard    │
│  ├─ Chat with agents               ├─ Real-time metrics        │
│  ├─ See task progress              ├─ Kanban boards            │
│  ├─ File browser                   ├─ Workflow monitoring      │
│  └─ Session history                └─ Project overview         │
│          │                              │                       │
│          └──────────┬───────────────────┘                       │
│                     │                                            │
│                     ▼                                            │
│          GitHub App (Single Source of Truth)                    │
│          ├─ Issues = Tasks                                     │
│          ├─ Project Boards = Kanban                             │
│          ├─ PRs = Deliverables                                  │
│          ├─ Comments = Chat history                             │
│          └─ Labels = Categories                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture

### 1. GitHub App as Central Hub

**Everything flows through GitHub:**

```
User Chat → GitHub Issue → Dashboard Display
                   ↓
              Agent Work
                   ↓
            GitHub Comments
                   ↓
            Dashboard Updates
```

**Data Model:**
- **GitHub Issue** = Task/Request
- **Issue Comments** = Chat conversation
- **Project Board Columns** = Task status (To Do, In Progress, Done)
- **Pull Requests** = Code deliverables
- **Labels** = Task categorization
- **Milestones** = Epics/Workflows

---

### 2. Relay Chat Interface Integration

#### A. Chat-to-GitHub Flow

**When user sends message to agent:**

```typescript
// Relay chat interface
async function handleUserMessage(message: string, projectId: string) {
  // 1. Detect if this is a work request
  const workRequest = parseWorkRequest(message)

  if (workRequest) {
    // 2. Create GitHub issue
    const issue = await createGitHubIssue({
      owner: 'hscheema1979',
      repo: currentProject.repo,
      title: workRequest.title,
      body: formatIssueBody(message),
      labels: [
        'relay-task',
        `project:${projectId}`,
        `agent:${workRequest.agent}`,
        `status:pending`
      ]
    })

    // 3. Add to project board "To Do" column
    await addIssueToProjectBoard(issue.id, 'todo')

    // 4. Display in chat as task card
    chatInterface.displayTaskCard({
      id: issue.number,
      title: issue.title,
      status: 'pending',
      url: issue.html_url
    })

    // 5. Start agent work
    const agentTask = await spawnAgent(workRequest.agent, {
      taskId: issue.number,
      githubContext: issue,
      prompt: message
    })

    // 6. Update issue to "In Progress"
    await updateIssueLabels(issue.number, [
      'status:in-progress'
    ])
    await moveIssueInProjectBoard(issue.id, 'in-progress')

    return agentTask
  }

  // Regular chat message
  return await agentChat(message)
}
```

#### B. Agent Response to GitHub

**When agent responds:**

```typescript
async function handleAgentResponse(response: string, taskId: number) {
  // 1. Post as GitHub comment
  await createGitHubComment(taskId, {
    body: formatAgentResponse(response),
    author: 'Agent (ultra-pilot)'
  })

  // 2. Update in real-time on dashboard
  dashboard.emit('task:updated', {
    id: taskId,
    lastComment: response,
    timestamp: new Date()
  })

  // 3. Update task card in Relay chat
  chatInterface.updateTaskCard(taskId, {
    lastMessage: response.slice(0, 100)
  })
}
```

#### C. File Changes to GitHub

**When agent edits files:**

```typescript
async function handleFileEdit(taskId: number, file: string, changes: any) {
  // 1. Commit changes
  const commit = await gitCommit({
    message: `[TASK-${taskId}] ${changes.message}`,
    files: [file]
  })

  // 2. Record in GitHub issue
  await createGitHubComment(taskId, {
    body: `
      📝 **File Modified:** ${file}

      \`\`\`diff
      ${changes.diff}
      \`\`\`

      **Commit:** ${commit.hash}
    `
  })

  // 3. Update issue metadata
  await updateIssue(taskId, {
    filesModified: [...existingFiles, file],
    commits: [...existingCommits, commit.hash]
  })
}
```

---

### 3. Mission Control Dashboard Integration

#### A. Real-Time Task Board

**New page: `/tasks`**

```typescript
// src/app/tasks/page.tsx
export default function TasksPage() {
  const { issues, loading } = useGitHubIssues({
    state: 'open',
    labels: 'relay-task'
  })

  const { columns } = useGitHubProjectBoard()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Agent Task Board</h1>

        {/* Kanban Board from GitHub Project */}
        <KanbanBoard
          columns={columns}
          issues={issues}
          onDrop={handleDrop}
          realTime={true} // WebSocket updates
        />

        {/* Task List */}
        <TaskList issues={issues} />
      </div>
    </DashboardLayout>
  )
}
```

#### B. Live Agent Status

**New section in main dashboard:**

```typescript
// src/components/dashboard/agent-status.tsx
export function AgentStatus() {
  const { tasks } = useGitHubTasks()

  const activeAgents = tasks.filter(t =>
    t.labels.includes('status:in-progress')
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Agents</CardTitle>
      </CardHeader>
      <CardContent>
        {activeAgents.map(task => (
          <AgentTaskCard key={task.id} task={task}>
            <AgentStatusIndicator
              agent={task.agent}
              status={task.status}
              progress={task.progress}
            />
            <ChatPreview taskId={task.id} />
          </AgentTaskCard>
        ))}
      </CardContent>
    </Card>
  )
}
```

#### C. GitHub Integration Widget

**Show GitHub issues alongside dashboard metrics:**

```typescript
// src/components/dashboard/github-integration.tsx
export function GitHubIntegration() {
  const { issues, project, stats } = useGitHubData()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          GitHub Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Open Issues" value={stats.open} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Completed" value={stats.completed} />
        </div>

        {/* Recent Tasks */}
        <div>
          <h3 className="font-semibold mb-2">Recent Agent Tasks</h3>
          <IssueList issues={issues.slice(0, 5)} />
        </div>

        {/* Link to GitHub */}
        <Link href={project.html_url}>
          <Button variant="outline" size="sm">
            View on GitHub
            <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
```

---

### 4. Bi-Directional Sync

#### GitHub → Dashboard (Real-Time)

```typescript
// WebSocket listener for GitHub webhooks
function setupGitHubWebhookListener() {
  websocket.on('github:issue_updated', (data) => {
    // Update dashboard state
    queryClient.invalidateQueries(['github-issues'])

    // Update task card in Relay chat
    if (currentRelaySession) {
      relayChat.updateTaskCard(data.issue.id, data.changes)
    }
  })

  websocket.on('github:comment_created', (data) => {
    // Show notification in dashboard
    toast.show({
      title: `New comment on #${data.issue.number}`,
      message: data.comment.body.slice(0, 100)
    })

    // Update chat interface
    relayChat.appendMessage(data.comment)
  })

  websocket.on('github:issue_closed', (data) => {
    // Move to "Done" column
    queryClient.setQueryData(['project-board'], (board) => {
      return moveCardToColumn(board, data.issue.id, 'done')
    })

    // Show completion notification
    toast.show({
      title: 'Task Completed',
      description: data.issue.title
    })
  })
}
```

#### Dashboard → GitHub (User Actions)

```typescript
// User actions in dashboard update GitHub
async function handleUserAction(action: DashboardAction) {
  switch (action.type) {
    case 'move-task':
      await moveGitHubIssue(action.taskId, action.toColumn)
      break

    case 'reassign-task':
      await updateGitHubIssue(action.taskId, {
        assignees: action.assignees
      })
      break

    case 'add-comment':
      await createGitHubComment(action.taskId, {
        body: action.comment
      })
      break

    case 'close-task':
      await closeGitHubIssue(action.taskId)
      break
  }
}
```

---

## User Experience Flows

### Flow 1: User Requests Work via Chat

```
1. User opens Relay chat
   → Selects project (ubuntu)
   → Sends message: "Fix the login bug"

2. System creates GitHub issue
   → Title: "[BUG] Fix login bug"
   → Labels: relay-task, bug-fix, project:ubuntu
   → Added to "To Do" column

3. Agent starts working
   → Issue moved to "In Progress"
   → Agent posts comment: "Investigating..."

4. Dashboard shows live update
   → New card in "In Progress" column
   → Agent status indicator shows "ultra:debugger"

5. Agent finds and fixes bug
   → Posts comment with findings
   → Creates commit: "Fix login null pointer"
   → Comments with diff

6. Dashboard updates in real-time
   → Shows commit link
   → Displays diff preview
   → Updates progress to 90%

7. Agent completes task
   → Closes issue
   → Moves to "Done" column
   → Dashboard shows completion notification

8. User sees all of this in:
   - Relay chat (conversation)
   - Dashboard (task board, metrics)
   - GitHub (issue, comments, commit)
```

### Flow 2: User Creates Task from Dashboard

```
1. User visits /tasks page
   → Sees Kanban board from GitHub

2. Clicks "New Task"
   → Fills in form
   → Selects agent (ultra-pilot)

3. System creates GitHub issue
   → Shows up on Kanban board immediately
   → Appears in Relay chat as task card

4. Agent auto-starts
   → Issue moves to "In Progress"
   → Chat shows agent working

5. User can monitor in all three places:
   - Dashboard: Drag-and-drop Kanban
   - Relay: Live chat with agent
   - GitHub: Full issue history
```

### Flow 3: Agent Requests User Input

```
1. Agent working on task
   → Needs clarification

2. Agent posts GitHub comment:
   "@user, should I use OAuth or JWT?"

3. User notified in:
   - Dashboard: Toast notification
   - Relay: Chat message highlighted
   - GitHub: @mention

4. User replies in Relay chat:
   "Use OAuth with Google"

5. Agent receives reply
   → Continues work
   → Posts comment: "Proceeding with OAuth..."

6. All three interfaces stay in sync
```

---

## Technical Implementation

### A. GitHub Webhook Handler

```typescript
// /api/github/webhooks
export async function POST(request: Request) {
  const webhook = await request.json()

  switch (webhook.action) {
    case 'opened':
      // New issue created
      await broadcastToClients({
        type: 'github:issue_created',
        issue: webhook.issue
      })
      break

    case 'created':
      // Comment added
      await broadcastToClients({
        type: 'github:comment_created',
        issue: webhook.issue,
        comment: webhook.comment
      })
      break

    case 'closed':
      // Issue closed
      await broadcastToClients({
        type: 'github:issue_closed',
        issue: webhook.issue
      })
      break

    case 'labeled':
    case 'unlabeled':
      // Labels changed (status update)
      await broadcastToClients({
        type: 'github:issue_updated',
        issue: webhook.issue,
        changes: webhook.changes
      })
      break
  }

  return Response.json({ received: true })
}
```

### B. Real-Time Sync Service

```typescript
// /lib/github-sync.ts
export class GitHubSyncService {
  private ws: WebSocket

  constructor() {
    this.ws = new WebSocket('wss://bitloom.cloud/api/github/events')
    this.setupListeners()
  }

  private setupListeners() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // Update React Query cache
      queryClient.setQueryData(
        ['github-issues', data.issue.id],
        data.issue
      )

      // Update local storage
      localStorage.setItem(
        `github-issue-${data.issue.id}`,
        JSON.stringify(data.issue)
      )

      // Emit to all connected clients
      this.emitToClients(data)
    }
  }

  private emitToClients(data: any) {
    // Relay chat clients
    relayClients.forEach(client => {
      client.send(JSON.stringify(data))
    })

    // Dashboard clients
    dashboardClients.forEach(client => {
      client.send(JSON.stringify(data))
    })
  }
}
```

### C. Unified Task Context

```typescript
// /contexts/task-context.tsx
interface TaskContext {
  // From GitHub
  issue: GitHubIssue
  comments: GitHubComment[]

  // Local state
  agentStatus: AgentStatus
  localChanges: FileChange[]

  // Actions
  addComment: (comment: string) => Promise<void>
  updateStatus: (status: TaskStatus) => Promise<void>
  viewOnGitHub: () => void
  openInRelay: () => void
}

export function TaskProvider({ children, taskId }: Props) {
  const { issue } = useGitHubIssue(taskId)
  const { comments } = useGitHubComments(taskId)
  const { agentStatus } = useAgentStatus(taskId)

  return (
    <TaskContext.Provider value={{
      issue,
      comments,
      agentStatus,
      addComment: async (text) => {
        await createGitHubComment(taskId, { body: text })
      },
      updateStatus: async (status) => {
        await updateIssueLabels(taskId, [`status:${status}`])
      },
      viewOnGitHub: () => {
        window.open(issue.html_url, '_blank')
      },
      openInRelay: () => {
        // Open Relay chat with this task
      }
    }}>
      {children}
    </TaskContext.Provider>
  )
}
```

---

## UI Components

### 1. Task Card (Dashboard)

```typescript
// src/components/tasks/task-card.tsx
export function TaskCard({ issue }: { issue: GitHubIssue }) {
  const status = getLabel(issue, 'status')
  const agent = getLabel(issue, 'agent')
  const project = getLabel(issue, 'project')

  return (
    <Card className={getStatusColor(status)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AgentIcon agent={agent} />
              <CardTitle>{issue.title}</CardTitle>
              <Badge>{status}</Badge>
            </div>
            <CardDescription>
              {project} • #{issue.number}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => openInRelay(issue.id)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Open in Relay
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => viewOnGitHub(issue.html_url)}>
                <Github className="h-4 w-4 mr-2" />
                View on GitHub
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        {/* Latest comment preview */}
        <CommentPreview comments={issue.comments} />

        {/* Progress bar */}
        {status === 'in-progress' && (
          <Progress value={issue.progress || 50} />
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button size="sm" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Details
          </Button>
          {status !== 'done' && (
            <Button size="sm" onClick={() => closeTask(issue.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 2. Chat Interface Integration

```typescript
// Relay chat UI with GitHub integration
export function RelayChat({ projectId }: Props) {
  const { issues } = useGitHubTasks({ projectId })
  const [messages, setMessages] = useState<ChatMessage[]>([])

  return (
    <div className="flex h-screen">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatMessages messages={messages} />
        <ChatInput onSend={handleSendMessage} />
      </div>

      {/* Task Sidebar */}
      <div className="w-80 border-l">
        <TaskSidebar>
          {issues.map(issue => (
            <TaskCardCompact
              key={issue.id}
              issue={issue}
              onClick={() => loadTaskChat(issue.id)}
            />
          ))}
        </TaskSidebar>
      </div>
    </div>
  )
}
```

---

## Benefits

✅ **Single Source of Truth** - GitHub is the central database
✅ **Real-Time Sync** - All interfaces update simultaneously
✅ **Persistent History** - Everything saved in GitHub
✅ **Visible Progress** - Kanban boards, metrics, chat all show same data
✅ **Flexible Access** - Work from chat, dashboard, or GitHub directly
✅ **Searchable** - All tasks searchable via GitHub
✅ **Collaborative** - Multiple users can see and interact
✅ **Audit Trail** - Full history in GitHub issues/comments

---

## Implementation Priority

### Phase 1: Foundation
1. GitHub webhook endpoints
2. Task creation from chat
3. Dashboard task board (GitHub issues)
4. Basic bi-directional sync

### Phase 2: Chat Integration
1. Chat-to-GitHub issue creation
2. Agent response to GitHub comments
3. Real-time chat updates from GitHub
4. Task cards in chat interface

### Phase 3: Advanced Features
1. File change tracking
2. Commit linking
3. Progress indicators
4. Multi-project support

### Phase 4: Polish
1. Real-time WebSocket updates
2. Notification system
3. Analytics dashboard
4. Advanced filtering/search

---

## Next Steps

**Should I:**

A. **Build Phase 1** (Foundation) - Get basic GitHub ↔ Dashboard sync working
B. **Prototype** chat integration - Quick Relay + GitHub connection
C. **Design** complete UI mockups - Full wireframes for all interfaces

**Which would you prefer?**
