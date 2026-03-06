import { Octokit } from '@octokit/rest'

export interface Workflow {
  id: string
  type: 'feature-request' | 'bug-report' | 'code-review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  workflowType: 'quick' | 'full' | 'queue'
  title: string
  description: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  currentPhase?: string
  progress: number
  githubIssue?: {
    number: number
    url: string
    id: number
  }
  intent?: {
    detected: string
    confidence: number
    suggested: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateWorkflowInput {
  title: string
  description: string
  type: 'feature-request' | 'bug-report' | 'code-review'
  priority: 'low' | 'medium' | 'high' | 'critical'
  workflowType: 'quick' | 'full' | 'queue'
}

class WorkflowEngine {
  private octokit: Octokit

  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    })
  }

  async create(input: CreateWorkflowInput): Promise<Workflow> {
    // Detect intent
    const intent = await this.detectIntent(input)

    // Create GitHub issue
    const issueNumber = await this.createGitHubIssue(input, intent)

    // Initialize workflow
    const workflow: Workflow = {
      id: `WF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: input.type,
      priority: input.priority,
      workflowType: input.workflowType,
      title: input.title,
      description: input.description,
      status: 'pending',
      progress: 0,
      githubIssue: issueNumber,
      intent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Trigger agent based on workflow type
    await this.triggerAgent(workflow)

    return workflow
  }

  private async detectIntent(input: CreateWorkflowInput) {
    const text = `${input.title} ${input.description}`.toLowerCase()

    const keywords = {
      'feature-request': ['add', 'implement', 'create', 'build', 'feature', 'new', 'want', 'need'],
      'bug-report': ['bug', 'fix', 'broken', 'error', 'issue', 'not working', 'crash'],
      'code-review': ['review', 'refactor', 'optimize', 'improve', 'clean up'],
    }

    const scores: Record<string, number> = {
      'feature-request': 0,
      'bug-report': 0,
      'code-review': 0,
    }

    for (const [type, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (text.includes(word)) {
          scores[type]++
        }
      }
    }

    const detectedType = Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0]
    const maxScore = Math.max(...Object.values(scores))
    const confidence = maxScore > 0 ? Math.min(0.9, 0.5 + (maxScore * 0.1)) : 0.5

    let suggestedType: 'quick' | 'full' | 'queue' = 'quick'
    if (input.description.length > 500 || text.includes('multiple') || text.includes('system')) {
      suggestedType = 'full'
    }

    return {
      detected: detectedType,
      confidence,
      suggested: suggestedType,
    }
  }

  private async createGitHubIssue(input: CreateWorkflowInput, intent: any) {
    const owner = process.env.GITHUB_REPO_OWNER || 'hscheema1979'
    const repo = process.env.GITHUB_REPO_NAME || 'ultrapilot-dashboard'

    const typeEmoji = {
      'feature-request': '✨',
      'bug-report': '🐛',
      'code-review': '🔍',
    }

    const body = `## [${input.type.toUpperCase()}] ${input.title}

**Type:** ${input.type}
**Priority:** ${input.priority}
**Workflow:** ${input.workflowType}
**Detected Intent:** ${intent.detected} (${Math.round(intent.confidence * 100)}% confidence)

### Description

${input.description}

### Acceptance Criteria

- [ ] Implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Code reviewed

---

*Submitted via GitHub Mission Control Dashboard*
*UltraPilot will process this as a **${input.workflowType}** workflow*
`

**Labels:** ${typeEmoji[input.type]}, ${input.priority}, workflow:${input.workflowType}, status:pending
`

    try {
      const response = await this.octokit.rest.issues.create({
        owner,
        repo,
        title: `[${input.type.toUpperCase()}] ${input.title}`,
        body,
        labels: [input.type, input.priority, `workflow:${input.workflowType}`, 'status:pending'],
      })

      return {
        number: response.data.number,
        url: response.data.html_url,
        id: response.data.id,
      }
    } catch (error) {
      console.error('Error creating GitHub issue:', error)
      throw error
    }
  }

  private async triggerAgent(workflow: Workflow) {
    // Update workflow status to running
    workflow.status = 'running'
    workflow.progress = 5

    // Add comment to GitHub issue
    await this.addComment(workflow, '🚀 **Workflow Started**\n\nUltraPilot is now processing this workflow...')

    // Based on workflow type, trigger appropriate agent
    switch (workflow.workflowType) {
      case 'quick':
        await this.triggerQuickWorkflow(workflow)
        break
      case 'full':
        await this.triggerFullUltrapilotWorkflow(workflow)
        break
      case 'queue':
        await this.addToTaskQueue(workflow)
        break
    }
  }

  private async triggerQuickWorkflow(workflow: Workflow) {
    await this.addComment(workflow, '⚡ **Quick Workflow**\n\nSingle agent (ultra:architect) has been assigned to this task.')
    // TODO: Spawn ultra:architect agent
  }

  private async triggerFullUltrapilotWorkflow(workflow: Workflow) {
    await this.addComment(workflow, '🔄 **Full Ultrapilot Workflow**\n\nStarting 5-phase process:\n1. Requirements\n2. Architecture\n3. Planning\n4. Execution\n5. Verification\n\nultra:team-lead will coordinate all phases.')
    // TODO: Spawn ultra:team-lead agent
  }

  private async addToTaskQueue(workflow: Workflow) {
    await this.addComment(workflow, '📋 **Task Queue**\n\nAdded to task queue. ultra:team-lead will prioritize and schedule this workflow along with other pending tasks.')
    // TODO: Add to queue database
  }

  private async addComment(workflow: Workflow, message: string) {
    try {
      const owner = process.env.GITHUB_REPO_OWNER || 'hscheema1979'
      const repo = process.env.GITHUB_REPO_NAME || 'ultrapilot-dashboard'

      if (workflow.githubIssue) {
        await this.octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: workflow.githubIssue.number,
          body: message,
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  async advancePhase(workflowId: string, phase: string) {
    // TODO: Implement phase advancement logic
  }

  async updateProgress(workflowId: string, progress: number) {
    // TODO: Implement progress update logic
  }
}

export const workflowEngine = new WorkflowEngine()
