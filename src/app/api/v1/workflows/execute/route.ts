/**
 * Workflow Execution API
 *
 * POST /api/v1/workflows/execute - Trigger UltraPilot workflow
 *
 * This is the BRIDGE between the dashboard and UltraPilot skills.
 * When user submits a feature request from the dashboard, this API:
 * 1. Creates a GitHub issue with the request details
 * 2. Triggers the appropriate GitHub Actions workflow
 * 3. Returns the run URL for tracking
 */

import { NextRequest, NextResponse } from 'next/server'
import { fetchGitHubAPI, fetchGitHubAPIRoot } from '@/lib/github-auth'

interface ExecuteRequest {
  workflow: 'quick' | 'full-ultrapilot' | 'ultra-ralph' | 'autoloop'
  task: string
  metadata?: {
    type: string
    priority: string
    repository: string
  }
}

/**
 * POST /api/v1/workflows/execute
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteRequest = await request.json()
    const { workflow, task, metadata } = body

    // Validate request
    if (!workflow || !task) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required fields: workflow and task are required'
        },
        { status: 400 }
      )
    }

    // Map workflow types to GitHub Actions workflows
    const workflowMap = {
      'quick': '.github/workflows/skill-executor.yml',
      'full-ultrapilot': '.github/workflows/ultrapilot-tracked.yml',
      'ultra-ralph': '.github/workflows/ultra-ralph.yml',
      'autoloop': '.github/workflows/ultra-autoloop.yml'
    }

    const workflowFile = workflowMap[workflow]
    if (!workflowFile) {
      return NextResponse.json(
        {
          error: 'Invalid workflow',
          message: `Unknown workflow type: ${workflow}`
        },
        { status: 400 }
      )
    }

    // Create GitHub issue first (for tracking)
    const issue = await fetchGitHubAPIRoot('/repos/hscheema1979/control-room/issues', {
      method: 'POST',
      body: JSON.stringify({
        title: `[${metadata?.type?.toUpperCase() || 'WORKFLOW'}] ${task.split('\n')[0]}`,
        body: task,
        labels: [
          'workflow',
          workflow,
          `type:${metadata?.type || 'general'}`,
          `priority:${metadata?.priority || 'medium'}`
        ]
      })
    })

    // Trigger GitHub Actions workflow
    await fetchGitHubAPIRoot(`/repos/hscheema1979/control-room/actions/workflows/${workflowFile.replace('.github/workflows/', '')}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          task: task,
          issue_number: issue.number,
          ...metadata
        }
      })
    })

    if (!workflowResponse.ok) {
      const error = await workflowResponse.text()
      throw new Error(`Failed to trigger workflow: ${error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Workflow triggered successfully',
      workflow,
      issueUrl: issue.html_url,
      issueNumber: issue.number,
      runId: `pending-${Date.now()}`, // Will be updated when workflow run starts
      traceUrl: `/dashboard/traces`
    })
  } catch (error) {
    console.error('[API] Error executing workflow:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to execute workflow'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/workflows/execute
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}
