/**
 * Multi-Org Repository API Route
 *
 * GET /api/v1/repos
 *
 * Lists repositories across multiple organizations with:
 * - Filtering by organization and search query
 * - Sorting by name, created, updated, or pushed
 * - Pagination support
 * - Caching with request coalescing
 * - Error handling with proper HTTP status codes
 *
 * Query Parameters:
 * - org: Filter by specific organization (optional)
 * - page: Page number (default: 1)
 * - per_page: Results per page (default: 30, max: 100)
 * - sort: Sort field - name, created, updated, pushed (default: updated)
 * - direction: Sort direction - asc, desc (default: desc)
 * - search: Search query for repo name/description (optional)
 *
 * Response Format:
 * {
 *   repositories: EnrichedRepository[],
 *   pagination: PaginationMeta,
 *   request: ListReposRequest
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { listRepos } from '@/lib/github/repo-list'
import { parseListReposRequest, type ListReposResponse } from '@/types/api'

// ============================================================================
// GET Handler
// ============================================================================

/**
 * GET /api/v1/repos
 *
 * List repositories with filtering, sorting, and pagination
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListReposResponse | { error: string }>> {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const params = parseListReposRequest(searchParams)

    console.debug(`[API] Listing repos with params:`, params)

    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    try {
      // Fetch repositories
      const result = await listRepos(params, controller.signal)

      clearTimeout(timeoutId)

      // Build response
      const response: ListReposResponse = {
        repositories: result.repositories,
        pagination: result.pagination,
        request: params,
      }

      // Cache for 5 minutes (public cache)
      const nextResponse = NextResponse.json(response, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          'Content-Type': 'application/json',
        },
      })

      return nextResponse
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[API] Request timeout')
        return NextResponse.json(
          { error: 'Request timeout' },
          { status: 504 }
        )
      }

      throw error
    }
  } catch (error) {
    console.error('[API] Error listing repos:', error)

    // Handle different error types
    if (error instanceof Error) {
      // GitHub API errors
      if (error.message.includes('GitHub API error')) {
        return NextResponse.json(
          { error: 'Failed to fetch repositories from GitHub' },
          { status: 502 }
        )
      }

      // Rate limit errors
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'GitHub API rate limit exceeded' },
          { status: 429 }
        )
      }

      // Authentication errors
      if (error.message.includes('authentication') || error.message.includes('auth')) {
        return NextResponse.json(
          { error: 'GitHub authentication failed' },
          { status: 401 }
        )
      }

      // Validation errors
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: 'Invalid request parameters' },
          { status: 400 }
        )
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// OPTIONS Handler (CORS preflight)
// ============================================================================

/**
 * OPTIONS /api/v1/repos
 *
 * Handle CORS preflight requests
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400', // 24 hours
    },
  })
}

// ============================================================================
// Route Config
// ============================================================================

/**
 * Runtime configuration
 */
export const runtime = 'nodejs'

/**
 * Route segment config
 */
export const dynamic = 'force-dynamic'
