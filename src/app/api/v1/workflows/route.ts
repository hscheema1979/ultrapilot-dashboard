/**
 * Workflows API Route
 *
 * GET /api/v1/workflows
 *
 * Query Parameters:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 * - state: Filter by state (pending, active, completed, blocked, failed) - optional
 * - phase: Filter by phase (0-6) - optional
 * - agent: Filter by agent type - optional
 * - search: Search in title - optional
 * - page: Page number - default: 1
 * - per_page: Results per page - default: 30, max: 100
 *
 * Response:
 * ```json
 * {
 *   "workflows": [
 *     {
 *       "id": "owner/repo#123",
 *       "issueNumber": 123,
 *       "title": "Workflow title",
 *       "state": "active",
 *       "phase": 2,
 *       "agent": "ultra:executor",
 *       "labels": ["workflow", "phase:2", "agent:ultra:executor"],
 *       "assignees": ["username"],
 *       "createdAt": "2026-03-06T12:00:00Z",
 *       "updatedAt": "2026-03-06T12:30:00Z",
 *       "htmlUrl": "https://github.com/owner/repo/issues/123",
 *       "dependencies": []
 *     }
 *   ],
 *   "totalCount": 42,
 *   "page": 1,
 *   "perPage": 30,
 *   "totalPages": 2
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github-auth'
import { listWorkflows } from '@/lib/github/workflows'
import type { WorkflowFilters, WorkflowState, WorkflowPhase, WorkflowAgent } from '@/types/api'

/**
 * GET /api/v1/workflows - List workflow issues
 *
 * Fetches GitHub issues marked as workflows with their current state, phase, and agent.
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
          documentation_url: '/api/v1/workflows',
        },
        { status: 400 }
      )
    }

    // Parse optional filter parameters
    const filters: WorkflowFilters = {
      owner,
      repo,
      state: searchParams.get('state') as WorkflowState || undefined,
      phase: searchParams.get('phase') ? parseInt(searchParams.get('phase')!, 10) as WorkflowPhase : undefined,
      agent: searchParams.get('agent') as WorkflowAgent || undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: Math.min(parseInt(searchParams.get('per_page') || '30', 10), 100),
    }

    // Validate phase if provided
    if (filters.phase !== undefined && (filters.phase < 0 || filters.phase > 6)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid phase parameter. Must be between 0 and 6',
          documentation_url: '/api/v1/workflows',
        },
        { status: 400 }
      )
    }

    // Validate state if provided
    const validStates: WorkflowState[] = ['pending', 'active', 'completed', 'blocked', 'failed']
    if (filters.state && !validStates.includes(filters.state)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: `Invalid state parameter. Must be one of: ${validStates.join(', ')}`,
          documentation_url: '/api/v1/workflows',
        },
        { status: 400 }
      )
    }

    // Get Octokit instance
    const octokit = await getOctokit()

    // Fetch workflows
    const { workflows, totalCount } = await listWorkflows(octokit, owner, repo, filters)

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / filters.per_page)

    return NextResponse.json({
      workflows,
      totalCount,
      page: filters.page,
      perPage: filters.per_page,
      totalPages,
    })
  } catch (error) {
    console.error('[API] Error in /api/v1/workflows:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch workflows',
        documentation_url: '/api/v1/workflows',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/workflows - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  })
}
