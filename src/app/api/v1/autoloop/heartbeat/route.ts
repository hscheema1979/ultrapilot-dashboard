/**
 * Autoloop Heartbeat API Route
 *
 * GET /api/v1/autoloop/heartbeat
 *
 * Query Parameters:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 *
 * Response:
 * ```json
 * {
 *   "lastHeartbeat": "2026-03-06T12:00:00Z",
 *   "health": "healthy",
 *   "activeWorkflows": 3,
 *   "supervision": {
 *     "scanner": {
 *       "name": "WorkflowScanner",
 *       "status": "active",
 *       "lastExecution": "2026-03-06T12:00:00Z",
 *       "executionCount": 42
 *     },
 *     "validator": { ... },
 *     "trigger": { ... },
 *     "intervention": { ... }
 *   },
 *   "cycleCount": 42,
 *   "uptime": 100
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github-auth'
import { getAutoloopHeartbeat } from '@/lib/github/workflows'

/**
 * GET /api/v1/autoloop/heartbeat - Get autoloop status
 *
 * Fetches the current autoloop heartbeat status from GitHub issues.
 * Returns health status, active workflows count, and supervision module status.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse required parameters
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Both owner and repo parameters are required',
          documentation_url: '/api/v1/autoloop/heartbeat',
        },
        { status: 400 }
      )
    }

    // Get Octokit instance
    const octokit = await getOctokit()

    // Fetch heartbeat status
    const heartbeat = await getAutoloopHeartbeat(octokit, owner, repo)

    return NextResponse.json(heartbeat)
  } catch (error) {
    console.error('[API] Error in /api/v1/autoloop/heartbeat:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch autoloop heartbeat',
        documentation_url: '/api/v1/autoloop/heartbeat',
        lastHeartbeat: null,
        health: 'down',
        activeWorkflows: 0,
        supervision: {
          scanner: { name: 'Scanner', status: 'error', lastExecution: null, executionCount: 0 },
          validator: { name: 'Validator', status: 'error', lastExecution: null, executionCount: 0 },
          trigger: { name: 'Trigger', status: 'error', lastExecution: null, executionCount: 0 },
          intervention: { name: 'Intervention', status: 'error', lastExecution: null, executionCount: 0 },
        },
        cycleCount: 0,
        uptime: 0,
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/autoloop/heartbeat - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  })
}
