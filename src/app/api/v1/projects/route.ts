/**
 * GitHub Projects API Route
 *
 * GET /api/v1/projects
 *
 * Query Parameters:
 * - org: Organization name (optional, required if repo not specified)
 * - repo: Repository name (optional)
 * - state: Project state (open, closed, all) - default: open
 * - page: Page number - default: 1
 * - per_page: Results per page - default: 30, max: 100
 *
 * Response:
 * ```json
 * {
 *   "projects": [
 *     {
 *       "id": 123456,
 *       "name": "My Project",
 *       "body": "Project description",
 *       "state": "open",
 *       "columns": [...],
 *       "cardCount": 42,
 *       "lastUpdated": "2026-03-06T12:00:00Z",
 *       "progress": 75
 *     }
 *   ],
 *   "total_count": 1,
 *   "page": 1,
 *   "total_pages": 1
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { listProjects, invalidateProjectsCache } from '@/lib/github/projects'
import { ListProjectsRequest } from '@/types/api'

/**
 * GET /api/v1/projects - List GitHub Projects
 *
 * Fetches GitHub Projects (classic) with columns and cards.
 * Supports both organization-level and repository-level projects.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const params: ListProjectsRequest = {
      org: searchParams.get('org') || undefined,
      repo: searchParams.get('repo') || undefined,
      state: (searchParams.get('state') as 'open' | 'closed' | 'all') || 'open',
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: Math.min(
        parseInt(searchParams.get('per_page') || '30', 10),
        100
      ),
    }

    // Validate required parameters
    if (!params.org && !params.repo) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Either org or org+repo must be specified',
          documentation_url: '/api/v1/projects',
        },
        { status: 400 }
      )
    }

    // Validate state parameter
    if (!params.state || !['open', 'closed', 'all'].includes(params.state)) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Invalid state parameter. Must be: open, closed, or all',
          documentation_url: '/api/v1/projects',
        },
        { status: 400 }
      )
    }

    // Validate page number
    const page = params.page || 1
    if (page < 1) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Page number must be >= 1',
          documentation_url: '/api/v1/projects',
        },
        { status: 400 }
      )
    }

    // Validate per_page
    const perPage = params.per_page || 30
    if (perPage < 1 || perPage > 100) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'per_page must be between 1 and 100',
          documentation_url: '/api/v1/projects',
        },
        { status: 400 }
      )
    }

    // Fetch projects
    const response = await listProjects(params)

    // Return response with cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache-Status': 'HIT',
      },
    })
  } catch (error: any) {
    console.error('[API] Error in GET /api/v1/projects:', error)

    // Handle specific error types
    if (error.message?.includes('Failed to fetch')) {
      return NextResponse.json(
        {
          error: 'GitHub API Error',
          message: error.message,
          documentation_url: '/api/v1/projects',
        },
        { status: 502 }
      )
    }

    if (error.message?.includes('authentication') || error.message?.includes('auth')) {
      return NextResponse.json(
        {
          error: 'Authentication Error',
          message: 'Failed to authenticate with GitHub',
          documentation_url: '/api/v1/projects',
        },
        { status: 401 }
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        documentation_url: '/api/v1/projects',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/v1/projects - Invalidate projects cache
 *
 * Request body:
 * ```json
 * {
 *   "org": "organization-name",
 *   "repo": "repository-name" (optional)
 * }
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { org, repo } = body

    // Validate required parameters
    if (!org) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'org parameter is required',
          documentation_url: '/api/v1/projects',
        },
        { status: 400 }
      )
    }

    // Invalidate cache
    await invalidateProjectsCache(org, repo)

    return NextResponse.json(
      {
        success: true,
        message: repo
          ? `Cache invalidated for ${org}/${repo}`
          : `Cache invalidated for ${org}`,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[API] Error in POST /api/v1/projects:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        documentation_url: '/api/v1/projects',
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/v1/projects - Describe API endpoint
 */
export async function OPTIONS() {
  return NextResponse.json(
    {
      endpoint: '/api/v1/projects',
      methods: ['GET', 'POST', 'OPTIONS'],
      description: 'GitHub Projects API - Fetch projects with columns and cards',
      parameters: {
        GET: {
          org: {
            type: 'string',
            required: false,
            description: 'Organization name (required if repo not specified)',
          },
          repo: {
            type: 'string',
            required: false,
            description: 'Repository name (optional)',
          },
          state: {
            type: 'string',
            required: false,
            enum: ['open', 'closed', 'all'],
            default: 'open',
            description: 'Project state filter',
          },
          page: {
            type: 'number',
            required: false,
            default: 1,
            description: 'Page number for pagination',
          },
          per_page: {
            type: 'number',
            required: false,
            default: 30,
            minimum: 1,
            maximum: 100,
            description: 'Results per page',
          },
        },
        POST: {
          org: {
            type: 'string',
            required: true,
            description: 'Organization name',
          },
          repo: {
            type: 'string',
            required: false,
            description: 'Repository name (optional)',
          },
        },
      },
      response: {
        projects: 'Array of ProjectWithColumns objects',
        total_count: 'Total number of projects',
        page: 'Current page number',
        total_pages: 'Total number of pages',
      },
      cache: {
        ttl: '600 seconds (10 minutes)',
        stale_while_revalidate: '1200 seconds (20 minutes)',
      },
    },
    { status: 200 }
  )
}
