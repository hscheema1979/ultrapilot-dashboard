# Task Recording System for Relay Chat Interface

**Status:** Design Phase
**Goal:** Record every agent interaction that edits code, builds, or modifies anything as a trackable task

---

## Overview

When agents work in the Relay chat interface (via ultra-pilot or any multi-step process), each significant action should be automatically recorded as a **Task** with:
- Project association
- Task type (bug fix, feature, workflow, etc.)
- Agent(s) involved
- Files modified
- Status tracking
- Time tracking

---

## Task Model

```typescript
interface Task {
  // Identification
  id: string                    // Unique task ID (e.g., "TASK-20250305-001")
  projectId: string             // Associated Relay project (ubuntu, hscheema1979, etc.)

  // Classification
  type: TaskType                // What kind of work?
  category: TaskCategory        // High-level category
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Content
  title: string                 // Short summary
  description: string           // Full prompt/request
  agent: string                 // Which agent? (ultra-pilot, executor, etc.)
  workflow?: string             // Which workflow? (if applicable)

  // Status
  status: TaskStatus            // Current state
  progress: number              // 0-100

  // Changes
  filesModified: string[]       // List of files changed
  commits: string[]             // Git commit hashes
  branches?: string             // Feature branch created

  // Relationships
  parentTask?: string           // If this is a subtask
  relatedTasks: string[]        // Related task IDs
  issue?: string                // Related GitHub issue number

  // Metadata
  created: string               // ISO timestamp
  started?: string              // When agent started work
  completed?: string            // When finished
  duration?: number             // Seconds

  // Results
  result?: TaskResult           // Success, failure, partial
  error?: string                // Error message if failed
  notes?: string                // Additional notes

  // Verification
  verified: boolean             // Was work verified?
  testsPassed?: boolean         // Did tests pass?
}

type TaskType =
  | 'bug-fix'                   // Fix a bug
  | 'feature'                   // Add new feature
  | 'refactor'                  // Refactor code
  | 'test'                      // Add/update tests
  | 'docs'                      // Update documentation
  | 'build'                     // Build/deploy
  | 'debug'                     // Debug investigation
  | 'review'                    // Code review
  | 'workflow'                  // Multi-step workflow

type TaskCategory =
  | 'feature-development'
  | 'bug-fix'
  | 'maintenance'
  | 'documentation'
  | 'testing'
  | 'deployment'
  | 'investigation'

type TaskStatus =
  | 'pending'                   // Not started yet
  | 'in-progress'              // Agent working on it
  | 'completed'                // Done successfully
  | 'failed'                   // Failed with error
  | 'blocked'                  // Blocked by something
  | 'cancelled'                // Cancelled

type TaskResult =
  | 'success'                  // Fully completed
  | 'partial'                  // Partially done
  | 'failed'                   // Failed
  | 'deferred'                 // Deferred for later
```

---

## Storage Options

### Option 1: JSON Files (Recommended for MVP)
```
.ultra/
└── tasks/
    ├── ubuntu/
    │   ├── TASK-20250305-001.json
    │   ├── TASK-20250305-002.json
    │   └── index.json          // Project task index
    ├── hscheema1979/
    │   ├── TASK-20250305-003.json
    │   └── index.json
    └── global-index.json       // All tasks across projects
```

**Pros:** Simple, git-tracked, easy to inspect
**Cons:** Manual querying, no real-time updates

### Option 2: SQLite Database
```
.ultra/tasks.db
```

**Pros:** Queryable, ACID, efficient
**Cons:** Not git-tracked, requires migration

### Option 3: GitHub Issues (Recommended for Production)
- Create GitHub issues for each task
- Use labels for type, status, project
- Comments for progress updates

**Pros:** GitHub integration, visible, API access
**Cons:** Requires GitHub App, API calls

### Option 4: Hybrid (Best of Both)
- JSON for local cache/fast access
- GitHub issues for persistence/visibility
- Sync between them

---

## Integration Points

### 1. Ultra-Pilot Integration

**When ultra-pilot is invoked:**

```typescript
// In ultra-pilot skill
async function startUltrapilot(prompt: string, project: string) {
  // Create task record
  const task = await createTask({
    projectId: project,
    type: 'workflow',
    category: 'feature-development',
    title: extractTitle(prompt),
    description: prompt,
    agent: 'ultra-pilot',
    status: 'pending',
    created: new Date().toISOString()
  })

  // Update status to in-progress
  await updateTask(task.id, {
    status: 'in-progress',
    started: new Date().toISOString()
  })

  try {
    // Run ultra-pilot workflow
    const result = await runUltrapilot(prompt, project)

    // Record completion
    await updateTask(task.id, {
      status: 'completed',
      completed: new Date().toISOString(),
      duration: calculateDuration(task.started),
      result: 'success',
      filesModified: result.files,
      commits: result.commits
    })
  } catch (error) {
    // Record failure
    await updateTask(task.id, {
      status: 'failed',
      error: error.message,
      result: 'failed'
    })
  }
}
```

### 2. Agent Tool Monitoring

**Detect Edit/Write tool usage:**

```typescript
// Wrap Edit/Write tools
const originalEdit = tools.Edit
tools.Edit = async function(...args) {
  const result = await originalEdit.apply(this, args)

  // Record file modification
  await recordFileModification({
    taskId: currentTaskId,
    file: args[0].file_path,
    operation: 'edit',
    timestamp: new Date().toISOString()
  })

  return result
}
```

### 3. Git Hook Integration

**Record commits:**

```bash
# .git/hooks/post-commit
#!/bin/bash
TASK_ID=$(git config --get ultrapilot.taskid)
if [ -n "$TASK_ID" ]; then
  # Record this commit
  node .ultra/scripts/record-commit.js "$TASK_ID" "$GIT_COMMIT"
fi
```

### 4. Relay Chat UI Integration

**Add task recording to chat interface:**

```typescript
// Relay chat component
function ChatInterface() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  async function sendMessage(message: string) {
    // Detect if this is a work request
    const isWorkRequest = detectWorkRequest(message)

    if (isWorkRequest) {
      // Auto-create task
      const task = await createTask({
        projectId: currentProject,
        type: inferTaskType(message),
        title: message.slice(0, 100),
        description: message,
        status: 'pending'
      })
      setCurrentTask(task)
    }

    // Send to agent
    const response = await agentChat(message, currentTask?.id)

    // Update task with agent response
    if (currentTask) {
      await updateTask(currentTask.id, {
        progress: extractProgress(response)
      })
    }
  }
}
```

---

## UI Components

### 1. Task List Component

```typescript
// src/components/tasks/task-list.tsx
interface TaskListProps {
  projectId: string
  filter?: TaskFilter
}

export function TaskList({ projectId, filter }: TaskListProps) {
  const tasks = useTasks(projectId, filter)

  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

### 2. Task Card Component

```typescript
// src/components/tasks/task-card.tsx
interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <Card className={getStatusColor(task.status)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <TaskTypeIcon type={task.type} />
              <CardTitle>{task.title}</CardTitle>
              <Badge>{task.status}</Badge>
            </div>
            <CardDescription>{task.projectId}</CardDescription>
          </div>
          <Badge variant={getPriorityVariant(task.priority)}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm">{task.description}</p>

        {task.filesModified.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium">Files Modified:</p>
            <ul className="text-xs text-muted-foreground">
              {task.filesModified.map(file => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Agent: {task.agent}</span>
          <span>Duration: {formatDuration(task.duration)}</span>
          {task.completed && (
            <span>Completed: {formatDate(task.completed)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Task Detail View

```typescript
// src/app/tasks/[id]/page.tsx
export default function TaskDetailPage({ params }: { params: { id: string } }) {
  const task = useTask(params.id)

  return (
    <div className="space-y-6">
      <TaskHeader task={task} />
      <TaskTimeline task={task} />
      <TaskChanges task={task} />
      <TaskLogs task={task} />
    </div>
  )
}
```

### 4. Task Dashboard

```typescript
// src/app/tasks/page.tsx
export default function TasksDashboard() {
  const stats = useTaskStats()

  return (
    <div className="space-y-6">
      <TaskStats stats={stats} />
      <TaskFilters />
      <TaskList />
    </div>
  )
}
```

---

## Task Recording API

### Create Task

```typescript
async function createTask(data: Partial<Task>): Promise<Task> {
  const task: Task = {
    id: generateTaskId(),
    projectId: data.projectId || currentProject,
    type: data.type || 'feature',
    category: data.category || 'feature-development',
    priority: data.priority || 'medium',
    title: data.title,
    description: data.description,
    agent: data.agent,
    workflow: data.workflow,
    status: 'pending',
    progress: 0,
    filesModified: [],
    commits: [],
    relatedTasks: [],
    created: new Date().toISOString(),
    verified: false
  }

  // Save to storage
  await saveTask(task)

  // Create GitHub issue (if enabled)
  if (githubIntegrationEnabled) {
    await createGitHubIssue(task)
  }

  return task
}
```

### Update Task

```typescript
async function updateTask(
  taskId: string,
  updates: Partial<Task>
): Promise<Task> {
  const task = await getTask(taskId)
  const updated = { ...task, ...updates }

  await saveTask(updated)

  // Update GitHub issue
  if (githubIntegrationEnabled) {
    await updateGitHubIssue(updated)
  }

  return updated
}
```

### Query Tasks

```typescript
interface TaskQuery {
  projectId?: string
  type?: TaskType
  status?: TaskStatus
  agent?: string
  dateRange?: [Date, Date]
}

async function queryTasks(query: TaskQuery): Promise<Task[]> {
  // Implementation depends on storage choice
  // Return filtered tasks
}
```

---

## Recording Workflows

### Ultra-Pilot Workflow

```bash
User: /ultrapilot Build REST API for task management

[System]
1. Create task: TASK-20250305-001
   Type: workflow
   Agent: ultra-pilot

2. Phase 0: Requirements
   → Create subtask: TASK-20250305-002
     Type: feature
     Agent: ultra:analyst

3. Phase 0: Architecture
   → Create subtask: TASK-20250305-003
     Type: feature
     Agent: ultra:architect

4. Phase 2: Execution
   → Create subtask: TASK-20250305-004
     Type: feature
     Agent: ultra:executor

[Result]
- TASK-20250305-001: Completed (parent)
  ├─ TASK-20250305-002: Completed (requirements)
  ├─ TASK-20250305-003: Completed (architecture)
  └─ TASK-20250305-004: Completed (implementation)
```

### Bug Fix Workflow

```bash
User: The login button is broken

[System]
1. Detect issue → Create task: TASK-20250305-005
   Type: bug-fix
   Status: in-progress

2. Agent debugs → Record findings
   Files: src/components/LoginButton.tsx

3. Agent fixes → Record changes
   Files modified: 1
   Commit: abc123

4. Tests pass → Mark complete
   Status: completed
   Verified: true
```

---

## Task Visualization

### Timeline View

```
March 2025
├── TASK-001 [████████████] 100% ✓ REST API
├── TASK-002 [████████████] 100% ✓ Requirements
├── TASK-003 [████████████] 100% ✓ Architecture
├── TASK-004 [████████░░░░] 60% → Implementation
└── TASK-005 [████░░░░░░░░] 30% → Bug fix
```

### Project View

```
Ubuntu Project
├── 5 tasks completed
├── 2 tasks in progress
└── 1 task blocked

Total time: 4h 32m
```

### Agent View

```
ultra-pilot: 12 tasks (10 completed)
ultra:executor: 25 tasks (22 completed)
ultra:analyst: 8 tasks (8 completed)
```

---

## Implementation Priority

### Phase 1: Core (MVP)
- ✅ Task data model
- ✅ JSON file storage
- ✅ Basic CRUD API
- ✅ Ultra-pilot integration

### Phase 2: UI
- Task list component
- Task card component
- Task detail view
- Project dashboard

### Phase 3: Advanced
- GitHub integration
- Task relationships
- Time tracking
- Analytics dashboard

### Phase 4: Automation
- Auto-detect work requests
- Auto-categorize tasks
- Auto-create subtasks
- Progress indicators

---

## Questions for User

1. **Storage preference:** JSON files, SQLite, or GitHub issues?
2. **UI priority:** Want to see task dashboard in Relay UI immediately or start with backend?
3. **Auto-detection:** Should system auto-create tasks for any Edit/Write, or only for /ultrapilot commands?
4. **GitHub integration:** Create issues for each task or keep local?
5. **Task hierarchy:** Need parent/child task relationships?

---

## Next Steps

**Option A: Start with MVP**
1. Implement task model + JSON storage
2. Add ultra-pilot integration
3. Create task list UI component
4. Test with real workflow

**Option B: Design Full System**
1. Answer storage preference
2. Design complete UI mockups
3. Plan GitHub integration
4. Implement all phases

**Option C: Prototype**
1. Create simple task recorder
2. Test with current workflow
3. Iterate based on usage
4. Expand to full system

Which approach would you prefer?
