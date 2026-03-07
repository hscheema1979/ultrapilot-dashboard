/**
 * List Workflows API
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubAPI } from '@/lib/github-auth'

interface WorkflowRun {
  id: string
  type: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  phase: number
  startedAt: string
  issueUrl: string
  issueNumber: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner') || 'hscheema1979'
    const repo = searchParams.get('repo') || 'control-room'

    const issues = await fetchGitHubAPI(
      `/issues?labels=workflow&state=all&per_page=50&sort=created&direction=desc`,
      {},
           owner,
      repo
    )

    const workflows: WorkflowRun[] = issues.map((issue: any) => {
      const workflowLabel = issue.labels.find((l: any) => l.name.startsWith('workflow:'))
      const type = workflowLabel ? workflowLabel.name.replace('workflow:', '') : 'general'

      const statusLabel = issue.labels.find((l: any) => l.name.startsWith('status:'))
      let status: WorkflowRun['status'] = 'pending'
      if (statusLabel) {
        const statusValue = statusLabel.name.replace('status:', '')
        status = ['pending', 'in_progress', 'completed', 'failed'].includes(statusValue)
          ? statusValue as any
          : 'pending'
      } else if (issue.state === 'closed') {
        status = 'completed'
      }

      const phaseLabel = issue.labels.find((l: any) => l.name.startsWith('phase:'))
      let phase = 0
      if (phaseLabel) {
        phase = parseInt(phaseLabel.name.replace('phase:', '')) || 0
      }

      return {
        id: `workflow-${issue.number}`,
        type,
        title: issue.title,
        status,
        phase,
        startedAt: issue.created_at,
        issueUrl: issue.html_url,
        issueNumber: issue.number
      }
    })

    return NextResponse.json({
      workflows,
      total: workflows.length,
      owner,
      repo
    })
  } catch (error) {
    console.error('[API] Error fetching workflows:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch workflows',
        workflows: [],
        total: 0,
        owner,
        repo
      },
      { status: 500 }
    )
  }
}
