import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github-auth'

/**
 * POST /api/v1/playbooks/execute
 *
 * Execute an UltraPilot workflow by invoking the corresponding skill
 * and creating a GitHub issue to track progress.
 *
 * Body:
 * {
 *   "playbookId": "ultrapilot" | "ultra-lead" | "ultra-autoloop",
 *   "playbookName": "UltraPilot - Strategic Orchestration",
 *   "task": "optional task description",
 *   "workspace": "optional workspace path"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "workflowUrl": "https://github.com/hscheema1979/control-room/issues/71",
 *   "issueNumber": 71,
 *   "skill": "ultrapilot"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playbookId, playbookName, task, workspace } = body

    // Map playbook IDs to skill files
    const skillMap: Record<string, { skill: string; file: string; description: string }> = {
      'ultrapilot': {
        skill: 'ultrapilot',
        file: '~/.claude/skills/ultrapilot/SKILL.md',
        description: 'Strategic orchestration system'
      },
      'ultra-lead': {
        skill: 'ultra-lead',
        file: '~/.claude/skills/ultra-lead/SKILL.md',
        description: 'Planning & execution orchestrator'
      },
      'ultra-autoloop': {
        skill: 'ultra-autoloop',
        file: '~/.claude/skills/ultra-autoloop/SKILL.md',
        description: 'Continuous heartbeat daemon'
      }
    }

    const skillInfo = skillMap[playbookId]
    if (!skillInfo) {
      return NextResponse.json(
        { error: 'Unknown playbook ID' },
        { status: 400 }
      )
    }

    // Get Octokit instance
    const octokit = await getOctokit() as any

    // Create GitHub issue for workflow tracking
    const issueTitle = `🤖 ${playbookName}`
    const issueBody = `## UltraPilot Workflow Execution

**Skill**: \`${skillInfo.skill}\`
**Description**: ${skillInfo.description}

${task ? `**Task**: ${task}\n` : ''}${workspace ? `**Workspace**: ${workspace}\n` : ''}

### Execution Details

This workflow is managed by the UltraPilot skill system.

**Skill File**: \`${skillInfo.file}\`

### Progress

The workflow will execute according to the skill's orchestration logic.
Progress updates will be posted as comments on this issue.

### Configuration

- **Playbook ID**: ${playbookId}
- **Skill**: ${skillInfo.skill}
- **Started**: ${new Date().toISOString()}

---

*This issue was created automatically by the UltraPilot Dashboard playbook execution system.*
`

    // Create the issue
    const { data: issue } = await octokit.rest.issues.create({
      owner: 'hscheema1979',
      repo: 'control-room',
      title: issueTitle,
      body: issueBody,
      labels: ['workflow', 'skill', skillInfo.skill, 'playbook']
    })

    // Add initial comment with execution instructions
    await octokit.rest.issues.createComment({
      owner: 'hscheema1979',
      repo: 'control-room',
      issue_number: issue.number,
      body: `## 🚀 Workflow Started

The **${skillInfo.skill}** skill has been invoked.

### To Execute Manually

If you want to execute this skill manually in Claude Code:

\`\`\`bash
cd ${workspace || '/home/ubuntu/hscheema1979/ultrapilot-dashboard'}
${task ? `# Task: ${task}` : ''}
# Invoke skill: /${skillInfo.skill}
\`\`\`

### Monitoring

- This issue will be updated with progress
- Check the dashboard: /dashboard/workflows
- Skill documentation: ${skillInfo.file}

### Next Steps

1. Review the task description
2. Invoke the skill in your workspace
3. Post progress updates as comments
4. Mark as complete when done

**Status**: ⏳ Pending manual execution
**Created**: ${new Date().toISOString()}
`
    })

    return NextResponse.json({
      success: true,
      workflowUrl: issue.html_url,
      issueNumber: issue.number,
      skill: skillInfo.skill,
      skillFile: skillInfo.file
    })

  } catch (error) {
    console.error('[API] Error executing playbook:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to execute playbook'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/playbooks/execute - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}
