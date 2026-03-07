/**
 * Execute Skill API
 *
 * POST /api/v1/skills/execute - Trigger skill execution via GitHub Actions
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/v1/skills/execute - Execute a skill
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { skill, task, workspace = '.', model = 'sonnet' } = body

    if (!skill || !task) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Missing required fields: skill and task are required'
        },
        { status: 400 }
      )
    }

    // For now, return the GitHub Actions workflow URL
    // In production, this would use Octokit to trigger the workflow
    const workflowUrl = `https://github.com/hscheema1979/hscheema1979/actions/workflows/skill-executor.yml`

    return NextResponse.json({
      success: true,
      message: 'Skill execution triggered',
      workflowUrl,
      skill,
      task,
      workspace,
      model
    })
  } catch (error) {
    console.error('[API] Error in /api/v1/skills/execute:', error)
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to execute skill'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/skills/execute - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  })
}
