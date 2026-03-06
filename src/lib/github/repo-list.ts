/**
 * Multi-Organization Repository Listing
 *
 * Provides repository listing functionality across multiple GitHub organizations:
 * - Parallel fetching from multiple orgs
 * - Filtering, sorting, and pagination
 * - Computed/enriched fields (isFork, isActive, ageInDays)
 * - Caching with request coalescing
 * - Error handling with GitHub API rate limits
 */

import { getOctokit } from '../github-auth'
import { coalesce } from '../coalescing'
import { RepositoryCache } from '../cache'
import type {
  Repository,
  Repository as GitHubRepository,
} from '../../types/github'
import type {
  EnrichedRepository,
  ListReposRequest,
  RepositoryFilters,
  RepositorySort,
  PaginationMeta,
} from '../../types/api'

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default organizations to fetch repositories from
 * Can be overridden by environment variable or request parameter
 */
const DEFAULT_ORGANIZATIONS = ['hscheema1979', 'creative-adventures']

/**
 * Cache TTL for repository listings (5 minutes)
 */
const CACHE_TTL = 300

/**
 * Maximum repositories to fetch per organization
 */
const MAX_REPOS_PER_ORG = 100

// ============================================================================
// Enrichment Functions
// ============================================================================

/**
 * Enrich repository data with computed fields
 *
 * @param repo - Raw repository from GitHub API
 * @returns Enriched repository with computed fields
 */
export function enrichRepoData(repo: GitHubRepository): EnrichedRepository {
  const now = Date.now()
  const pushedAt = new Date(repo.pushed_at).getTime()
  const createdAt = new Date(repo.created_at).getTime()

  // Compute age in days
  const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

  // Check if actively maintained (pushed in last 6 months)
  const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000
  const isActive = pushedAt > sixMonthsAgo

  return {
    ...repo,
    isFork: repo.fork,
    isActive,
    ageInDays,
    organization: repo.owner.login,
  }
}

// ============================================================================
// Fetching Functions
// ============================================================================

/**
 * Fetch repositories for a single organization
 *
 * @param org - Organization name
 * @param type - Repository type (all, public, private, forks, sources, member)
 * @returns Array of repositories
 */
async function fetchOrgRepos(
  org: string,
  type: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member' = 'all'
): Promise<GitHubRepository[]> {
  try {
    const octokit = await getOctokit()

    // Note: Not using cache for org listings since they can change frequently
    // The coalescing layer will prevent duplicate concurrent requests

    console.log(`[RepoList] Fetching repositories for ${org}`)

    // For GitHub App installations, use installation repositories endpoint
    // This returns ALL repos the app has access to, regardless of org/user
    const response = await octokit.request('GET /installation/repositories', {
      per_page: 100,
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (response.status === 200) {
      const repos = response.data.repositories as GitHubRepository[]
      console.log(`[RepoList] Found ${repos.length} total repositories`)
      return repos
    }

    return []
  } catch (error) {
    console.error(`[RepoList] Error fetching repos for ${org}:`, error)
    throw error
  }
}

/**
 * Fetch repositories from multiple organizations in parallel
 *
 * @param orgs - Array of organization names
 * @param signal - Optional AbortSignal for cancellation
 * @returns Array of repositories from all organizations
 */
export async function fetchAllOrgs(
  orgs: string[],
  signal?: AbortSignal
): Promise<GitHubRepository[]> {
  if (orgs.length === 0) {
    return []
  }

  console.debug(`[RepoList] Fetching repos from ${orgs.length} organizations in parallel`)

  // Fetch from all organizations in parallel
  const fetchPromises = orgs.map((org) =>
    fetchOrgRepos(org).catch((error) => {
      console.error(`[RepoList] Failed to fetch repos for ${org}:`, error)
      return [] // Return empty array on error to not fail entire request
    })
  )

  const results = await Promise.all(fetchPromises)

  // Flatten and merge results
  const allRepos = results.flat()

  console.debug(`[RepoList] Fetched ${allRepos.length} total repositories`)

  return allRepos
}

// ============================================================================
// Filtering & Sorting
// ============================================================================

/**
 * Filter repositories based on criteria
 *
 * @param repos - Array of repositories
 * @param filters - Filter criteria
 * @returns Filtered array of repositories
 */
export function filterRepos(
  repos: GitHubRepository[],
  filters: RepositoryFilters
): GitHubRepository[] {
  let filtered = [...repos]

  // Filter by organization
  if (filters.org) {
    const orgLower = filters.org.toLowerCase()
    filtered = filtered.filter((repo) =>
      repo.owner.login.toLowerCase() === orgLower
    )
  }

  // Filter by search query (name or description)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filtered = filtered.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchLower) ||
        (repo.description?.toLowerCase() ?? '').includes(searchLower)
    )
  }

  return filtered
}

/**
 * Sort repositories based on criteria
 *
 * @param repos - Array of repositories
 * @param sort - Sort criteria
 * @returns Sorted array of repositories
 */
export function sortRepos(
  repos: GitHubRepository[],
  sort: RepositorySort
): GitHubRepository[] {
  const sorted = [...repos]

  sorted.sort((a, b) => {
    let comparison = 0

    switch (sort.field) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'created':
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'updated':
        comparison =
          new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        break
      case 'pushed':
        comparison =
          new Date(a.pushed_at).getTime() - new Date(b.pushed_at).getTime()
        break
    }

    // Apply direction
    return sort.direction === 'asc' ? comparison : -comparison
  })

  return sorted
}

/**
 * Paginate repositories
 *
 * @param repos - Array of repositories
 * @param page - Page number (1-indexed)
 * @param perPage - Results per page
 * @returns Paginated result with metadata
 */
export function paginateRepos(
  repos: GitHubRepository[],
  page: number,
  perPage: number
): {
  repos: GitHubRepository[]
  pagination: PaginationMeta
} {
  const total = repos.length
  const totalPages = Math.ceil(total / perPage)
  const startIndex = (page - 1) * perPage
  const endIndex = startIndex + perPage

  const paginatedRepos = repos.slice(startIndex, endIndex)

  const pagination: PaginationMeta = {
    page,
    perPage,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }

  return {
    repos: paginatedRepos,
    pagination,
  }
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * List repositories with filtering, sorting, and pagination
 *
 * This is the main entry point for repository listing.
 * It handles:
 * - Multi-org fetching in parallel
 * - Request coalescing for concurrent requests
 * - Caching to reduce GitHub API calls
 * - Filtering, sorting, and pagination
 *
 * @param params - Request parameters
 * @param signal - Optional AbortSignal for cancellation
 * @returns ListReposResponse with enriched repositories
 */
export async function listRepos(
  params: ListReposRequest,
  signal?: AbortSignal
): Promise<{
  repositories: EnrichedRepository[]
  pagination: PaginationMeta
}> {
  // Determine organizations to fetch from
  const orgs = params.org
    ? [params.org]
    : process.env.GITHUB_ORGANIZATIONS?.split(',').map((o) => o.trim()) ||
      DEFAULT_ORGANIZATIONS

  console.debug(`[RepoList] Listing repos for orgs: ${orgs.join(', ')}`)

  // Build cache key
  const cacheKey = `repos:list:${JSON.stringify(params)}`

  // Use coalescing to prevent duplicate concurrent requests
  const allRepos = await coalesce(
    cacheKey,
    async () => {
      // Fetch all repositories from all organizations
      return await fetchAllOrgs(orgs, signal)
    },
    {
      ttl: CACHE_TTL,
      timeout: 60000, // 60 second timeout
    }
  )

  // Apply filters
  const filtered = filterRepos(allRepos, {
    org: params.org,
    search: params.search,
  })

  // Apply sorting
  const sorted = sortRepos(filtered, {
    field: params.sort || 'updated',
    direction: params.direction || 'desc',
  })

  // Apply pagination
  const { repos: paginated, pagination } = paginateRepos(
    sorted,
    params.page || 1,
    params.per_page || 30
  )

  // Enrich repositories with computed fields
  const enriched = paginated.map(enrichRepoData)

  console.debug(
    `[RepoList] Returning ${enriched.length} repos (page ${pagination.page}/${pagination.totalPages})`
  )

  return {
    repositories: enriched,
    pagination,
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get organizations from environment or defaults
 *
 * @returns Array of organization names
 */
export function getOrganizations(): string[] {
  const envOrgs = process.env.GITHUB_ORGANIZATIONS
  if (envOrgs) {
    return envOrgs.split(',').map((o) => o.trim()).filter(Boolean)
  }
  return DEFAULT_ORGANIZATIONS
}

/**
 * Validate organization name
 *
 * @param org - Organization name to validate
 * @returns true if valid
 */
export function isValidOrganization(org: string): boolean {
  // GitHub organization names:
  // - Max 39 characters
  // - Alphanumeric and hyphens only
  // - Cannot start or end with hyphen
  const orgRegex = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i
  return org.length > 0 && org.length <= 39 && orgRegex.test(org)
}
