/**
 * Workflow Trace API
 *
 * GET /api/v1/traces - List all workflow traces
 * GET /api/v1/traces/:id - Get detailed trace by ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'
import { existsSync, readdirSync, readFileSync } from 'fs'

interface WorkflowTrace {
  traceId: string
  task: string
  startedAt: string
  completedAt?: string
  status: 'running' | 'completed' | 'failed'
  phases: PhaseTrace[]
  agents: AgentInvocation[]
  artifactUrl?: string
}

interface PhaseTrace {
  phase: number
  name: string
  startedAt: string
  completedAt?: string
  agents: string[]
  cycles?: number
  status: string
}

interface AgentInvocation {
  agent: string
  invokedAt: string
  completedAt?: string
  model: string
  task: string
  status: 'running' | 'completed' | 'failed'
  outputFile?: string
}

/**
 * GET /api/v1/traces - List all traces from GitHub Actions
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const traceId = searchParams.get('id')

  try {
    // Fetch GitHub Actions workflow runs
    const response = await fetch(
      'https://api.github.com/repos/hscheema1979/hscheema1979/actions/workflows/ultrapilot-tracked.yml/runs?per_page=10',
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch workflow runs')
    }

    const data = await response.json()
    const traces: WorkflowTrace[] = []

    for (const run of data.workflow_runs || []) {
      traces.push({
        traceId: String(run.id),
        task: run.name || 'Unknown task',
        startedAt: run.created_at,
        completedAt: run.updated_at,
        status: run.conclusion === 'success' ? 'completed' : run.conclusion === 'failure' ? 'failed' : 'running',
        phases: [],
        agents: [],
        artifactUrl: run.artifacts_url
      })
    }

    if (traceId) {
      const trace = traces.find(t => t.traceId === traceId)
      if (!trace) {
        return NextResponse.json({ error: 'Trace not found' }, { status: 404 })
      }

      // Fetch detailed artifacts for this trace
      const artifactsResponse = await fetch(
        `https://api.github.com/repos/hscheema1979/hscheema1979/actions/runs/${traceId}/artifacts`,
        {
          headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
          }
        }
      )

      if (artifactsResponse.ok) {
        const artifacts = await artifactsResponse.json()
        // Parse trace artifacts to get phases, agents, etc.
        // This would download and parse the trace archive
      }

      return NextResponse.json(trace)
    }

    return NextResponse.json({
      traces,
      total: traces.length
    })
  } catch (error) {
    console.error('[API] Error fetching traces:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch traces'
      },
      { status: 500 }
    )
  }
}
