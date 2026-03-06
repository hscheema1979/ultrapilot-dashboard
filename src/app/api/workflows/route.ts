import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schema
const WorkflowSubmitSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  type: z.enum(['feature-request', 'bug-report', 'code-review']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  projectId: z.string().optional(),
  workflowType: z.enum(['quick', 'full', 'queue']),
})

type WorkflowSubmitData = z.infer<typeof WorkflowSubmitSchema>

// Intent detection function
async function detectIntent(data: WorkflowSubmitData) {
  const text = `${data.title} ${data.description}`.toLowerCase()

  // Simple keyword-based detection
  const keywords = {
    'feature-request': ['add', 'implement', 'create', 'build', 'feature', 'new', 'want', 'need'],
    'bug-report': ['bug', 'fix', 'broken', 'error', 'issue', 'not working', 'crash'],
    'code-review': ['review', 'refactor', 'optimize', 'improve', 'clean up'],
  }

  const scores = {
    'feature-request': 0,
    'bug-report': 0,
    'code-review': 0,
  }

  for (const [type, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        scores[type as keyof typeof scores]++
      }
    }
  }

  // Determine intent with highest score
  const detectedType = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]
  const maxScore = Math.max(...Object.values(scores))
  const confidence = maxScore > 0 ? Math.min(0.9, 0.5 + (maxScore * 0.1)) : 0.5

  // Suggest workflow type based on complexity
  let suggestedType: 'quick' | 'full' | 'queue' = 'quick'
  if (data.description.length > 500 || text.includes('multiple') || text.includes('system')) {
    suggestedType = 'full'
  } else if (text.includes('and') && text.split('and').length > 2) {
    suggestedType = 'queue'
  }

  return {
    intent: detectedType,
    confidence,
    suggestedType,
  }
}

// Generate GitHub issue body
function generateIssueBody(data: WorkflowSubmitData, intent: any): string {
  const typeEmoji = {
    'feature-request': '✨',
    'bug-report': '🐛',
    'code-review': '🔍',
  }

  const workflowLabels = {
    quick: 'workflow:quick',
    full: 'workflow:full-ultrapilot',
    queue: 'workflow:task-queue',
  }

  return `## [${data.type.toUpperCase()}] ${data.title}

**Type:** ${data.type}
**Priority:** ${data.priority}
**Workflow:** ${data.workflowType}
**Detected Intent:** ${intent.intent} (${Math.round(intent.confidence * 100)}% confidence)

### Description

${data.description}

### Acceptance Criteria

- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed

### Workflow Details

- **Workflow Type:** ${data.workflowType}
- **Submitted:** ${new Date().toISOString()}
- **Status:** 📋 Pending

---

*This workflow was created via GitHub Mission Control Dashboard*
*UltraPilot will process this according to the ${data.workflowType} workflow*

Labels: ${typeEmoji[data.type]}, ${data.priority}, ${workflowLabels[data.workflowType]}, status:pending``

// POST /api/workflows
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = WorkflowSubmitSchema.parse(body)

    // Use workflow engine to create workflow
    const { workflowEngine } = await import('@/lib/services/workflow-engine')
    const workflow = await workflowEngine.create(validatedData)

    return NextResponse.json(workflow, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.errors,
      }, { status: 400 })
    }

    console.error('Error creating workflow:', error)
    return NextResponse.json({
      error: 'Failed to create workflow',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// GET /api/workflows - list workflows
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner') || 'hscheema1979'
    const repo = searchParams.get('repo') || 'ultrapilot-dashboard'

    const { fetchGitHubAPI } = await import('@/lib/github-auth')

    // Fetch issues with workflow labels
    const data = await fetchGitHubAPI(
      '/issues?labels=workflow:quick,workflow:full-ultrapilot,workflow:task-queue&state=open&sort=created&direction=desc&per_page=20',
      {},
      owner,
      repo
    )

    const workflows = data.map((issue: any) => ({
      id: issue.id,
      title: issue.title.replace(/^\[[A-Z]+\]\s*/, ''),
      type: issue.labels.find((l: any) => l.name.includes('feature-request' || 'bug-report' || 'code-review'))?.name || 'unknown',
      priority: issue.labels.find((l: any) => ['low', 'medium', 'high', 'critical'].includes(l.name))?.name || 'medium',
      workflowType: issue.labels.find((l: any) => l.name.startsWith('workflow:'))?.name.replace('workflow:', '') || 'quick',
      status: issue.labels.find((l: any) => l.name.startsWith('status:'))?.name.replace('status:', '') || 'pending',
      githubIssue: issue.number,
      url: issue.html_url,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
    }))

    return NextResponse.json({ workflows })

  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json({
      error: 'Failed to fetch workflows',
      workflows: [],
    }, { status: 500 })
  }
}
