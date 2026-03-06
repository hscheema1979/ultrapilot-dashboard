/**
 * GitHub Actions Runs API Route
 *
 * GET /api/v1/actions/runs
 *
 * Query Parameters:
 * - owner: Repository owner (required)
 * - repo: Repository name (required)
 * - status: Filter by status (queued, in_progress, completed, failed) - optional, default: completed
 * - branch: Filter by branch - optional
 * - page: Page number - default: 1
 * - per_page: Results per page - default: 30, max: 100
 *
 * Response:
 * ```json
 * {
 *   "runs": [
 *     {
 *       "id": 123456789,
 *       "name": "ci.yml",
 *       "runNumber": 42,
 *       "runAttempt": 1,
 *       "event": "push",
 *       "status": "completed",
 *       "conclusion": "success",
 *       "headBranch": "main",
 *       "headSha": "abc123...",
 *       "headCommitMessage": "Add new feature",
 *       "actor": {
 *         "login": "username",
 *         "avatarUrl": "https://...",
 *         "htmlUrl": "https://github.com/username"
 *       },
 *       "repository": {
 *         "owner": "owner",
 *         "name": "repo",
 *         "fullName": "owner/repo",
 *         "htmlUrl": "https://github.com/owner/repo"
 *       },
 *       "createdAt": "2026-03-06T12:00:00Z",
 *       "updatedAt": "2026-03-06T12:05:00Z",
 *       "runStartedAt": "2026-03-06T12:00:00Z",
 *       "htmlUrl": "https://github.com/owner/repo/actions/runs/123456789",
 *       "logsUrl": "https://...",
 *       "jobsUrl": "https://...",
 *       "duration": 300
 *     }
 *   ],
 *   "totalCount": 100,
 *   "page": 1,
 *   "perPage": 30,
 *   "totalPages": 4
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { getOctokit } from '@/lib/github-auth'
import { listActionRuns } from '@/lib/github/workflows'
import type { ActionRunFilters, ActionRunStatus } from '@/types/api'

/**
 * GET /api/v1/actions/runs - List GitHub Actions workflow runs
 *
 * Fetches GitHub Actions workflow runs across all workflows in a repository.
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
          documentation_url: '/api/v1/actions/runs',
        },
        { status: 400 }
      )
    }

    // Parse optional filter parameters
    const filters: ActionRunFilters = {
      owner,
      repo,
      status: searchParams.get('status') as ActionRunStatus || 'completed',
      branch: searchParams.get('branch') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: Math.min(parseInt(searchParams.get('per_page') || '30', 10), 100),
    }

    // Validate status if provided
    const validStatuses: ActionRunStatus[] = ['queued', 'in_progress', 'completed', 'failed']
    if (filters.status && !validStatuses.includes(filters.status)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: `Invalid status parameter. Must be one of: ${validStatuses.join(', ')}`,
          documentation_url: '/api/v1/actions/runs',
        },
        { status: 400 }
      )
    }

    // Get Octokit instance
    const octokit = await getOctokit()

    // Fetch action runs
    const { runs, totalCount } = await listActionRuns(octokit, owner, repo, filters)

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / filters.per_page)

    return NextResponse.json({
      runs,
      totalCount,
      page: filters.page,
      perPage: filters.per_page,
      totalPages,
    })
  } catch (error) {
    console.error('[API] Error in /api/v1/actions/runs:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch action runs',
        documentation_url: '/api/v1/actions/runs',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/actions/runs - Describe available methods
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'GET, OPTIONS',
    },
  })
}
