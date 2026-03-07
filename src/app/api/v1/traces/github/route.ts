/**
 * GitHub-Based Traceability API
 *
 * Uses GitHub repo activity as source of truth:
 * - Commits = Agent actions
 * - PRs = Phase deliverables
 * - Issues = Task queue
 * - Actions = Workflow runs
 */

import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from 'octokit'
import { getOctokit as getGitHubOctokit } from '@/lib/github-auth'

interface GitHubTrace {
  traceId: string
  type: 'commit' | 'pr' | 'issue' | 'workflow'
  title: string
  description?: string
  author: string
  createdAt: string
  updatedAt: string
  url: string
  agent?: string
  phase?: number
  status: string
  metadata: any
}

/**
 * GET /api/v1/traces/github - Get traceability from GitHub repo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const owner = searchParams.get('owner') || 'hscheema1979'
    const repo = searchParams.get('repo') || 'control-room'
    const type = searchParams.get('type') // 'commits', 'prs', 'issues', 'workflows', 'all'

    const octokit = await getGitHubOctokit()
    const traces: GitHubTrace[] = []

    // Fetch commits (agent actions)
    if (!type || type === 'all' || type === 'commits') {
      const commits = await octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 50,
        author: searchParams.get('agent') || undefined
      })

      for (const commit of commits.data) {
        const agent = extractAgentFromCommit(commit.commit.message)
        const phase = extractPhaseFromCommit(commit.commit.message)

        traces.push({
          traceId: commit.sha,
          type: 'commit',
          title: commit.commit.message.split('\n')[0],
          description: 'Commit',
          author: commit.author?.login || 'unknown',
          createdAt: commit.commit.author?.date || commit.commit.committer?.date || '',
          updatedAt: commit.commit.committer?.date || '',
          url: commit.html_url,
          agent,
          phase,
          status: 'completed',
          metadata: {
            sha: commit.sha,
          }
        })
      }
    }

    // Fetch PRs (phase deliverables)
    if (!type || type === 'all' || type === 'prs') {
      const pulls = await octokit.rest.pulls.list({
        owner,
        repo,
        state: 'all',
        per_page: 50
      })

      for (const pr of pulls.data) {
        const phase = extractPhaseFromPR(pr.title)
        const agent = extractAgentFromPR(pr.title)

        traces.push({
          traceId: `pr-${pr.number}`,
          type: 'pr',
          title: pr.title,
          description: pr.body?.substring(0, 200),
          author: pr.user.login,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          url: pr.html_url,
          agent,
          phase,
          status: pr.state === 'open' ? 'open' : pr.merged_at ? 'merged' : 'closed',
          metadata: {
            number: pr.number,
            mergeable: pr.mergeable,
            merged: pr.merged,
            reviews: pr.requested_reviewers || []
          }
        })
      }
    }

    // Fetch Issues (task queue)
    if (!type || type === 'all' || type === 'issues') {
      const issues = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        per_page: 50,
        labels: searchParams.get('label') || undefined
      })

      for (const issue of issues.data) {
        const phase = extractPhaseFromIssue(issue.labels)
        const agent = extractAgentFromIssue(issue.labels)
        const status = extractStatusFromIssue(issue.labels)

        traces.push({
          traceId: `issue-${issue.number}`,
          type: 'issue',
          title: issue.title,
          description: issue.body?.substring(0, 200),
          author: issue.user.login,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          url: issue.html_url,
          agent,
          phase,
          status,
          metadata: {
            number: issue.number,
            labels: issue.labels.map(l => l.name),
            assignees: issue.assignees?.map(a => a.login) || []
          }
        })
      }
    }

    // Fetch workflow runs (orchestration)
    if (!type || type === 'all' || type === 'workflows') {
      const runs = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        per_page: 50
      })

      for (const run of runs.data.workflow_runs) {
        const agent = extractAgentFromWorkflow(run.name)
        const phase = extractPhaseFromWorkflow(run.name)

        traces.push({
          traceId: `run-${run.id}`,
          type: 'workflow',
          title: run.name,
          description: `Event: ${run.event}`,
          author: run.triggering_actor.login,
          createdAt: run.created_at,
          updatedAt: run.updated_at,
          url: run.html_url,
          agent,
          phase,
          status: run.status === 'completed' ?
            (run.conclusion === 'success' ? 'success' : 'failed') :
            run.status,
          metadata: {
            id: run.id,
            run_number: run.run_number,
            event: run.event,
            conclusion: run.conclusion,
            jobs_url: run.jobs_url,
            logs_url: run.logs_url
          }
        })
      }
    }

    // Sort by date (newest first)
    traces.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      traces,
      total: traces.length,
      owner,
      repo
    })
  } catch (error) {
    console.error('[API] Error fetching GitHub traces:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch traces',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Extract agent name from commit message
 */
function extractAgentFromCommit(message: string): string | undefined {
  const match = message.match(/ultra:(\w+)|(\w+)-agent/)
  return match ? `ultra:${match[1] || match[2]}` : undefined
}

/**
 * Extract phase from commit message
 */
function extractPhaseFromCommit(message: string): number | undefined {
  const match = message.match(/Phase (\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Extract phase from PR title
 */
function extractPhaseFromPR(title: string): number | undefined {
  const match = title.match(/Phase (\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Extract agent from PR title
 */
function extractAgentFromPR(title: string): string | undefined {
  const match = title.match(/ultra:(\w+)/)
  return match ? `ultra:${match[1]}` : undefined
}

/**
 * Extract phase from issue labels
 */
function extractPhaseFromIssue(labels: any[]): number | undefined {
  const phaseLabel = labels.find(l => l.name.startsWith('phase:'))
  if (phaseLabel) {
    const phase = parseInt(phaseLabel.name.replace('phase:', ''))
    return !isNaN(phase) ? phase : undefined
  }
  return undefined
}

/**
 * Extract agent from issue labels
 */
function extractAgentFromIssue(labels: any[]): string | undefined {
  const agentLabel = labels.find(l => l.name.startsWith('agent:'))
  if (agentLabel) {
    return agentLabel.name.replace('agent:', '')
  }
  return undefined
}

/**
 * Extract status from issue labels
 */
function extractStatusFromIssue(labels: any[]): string {
  if (labels.find(l => l.name === 'status:completed')) return 'completed'
  if (labels.find(l => l.name === 'status:in-progress')) return 'in-progress'
  if (labels.find(l => l.name === 'status:pending')) return 'pending'
  return 'open'
}

/**
 * Extract phase from workflow name
 */
function extractPhaseFromWorkflow(name: string): number | undefined {
  const match = name.match(/Phase (\d+)/)
  return match ? parseInt(match[1]) : undefined
}

/**
 * Extract agent from workflow name
 */
function extractAgentFromWorkflow(name: string): string | undefined {
  const match = name.match(/ultra:(\w+)/)
  return match ? `ultra:${match[1]}` : undefined
}
