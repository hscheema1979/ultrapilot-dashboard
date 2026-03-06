/**
 * GitHub Projects API Integration
 *
 * Provides functionality to fetch GitHub Projects (classic) with columns and cards.
 * Supports both organization-level and repository-level projects.
 *
 * GitHub Projects API requires preview header: application/vnd.github.inertia-preview+json
 */

import { getOctokit } from '../github-auth'
import {
  ListProjectsRequest,
  ListProjectsResponse,
  ProjectWithColumns,
  ProjectColumn,
  ProjectCard,
} from '@/types/api'
import { ProjectCache } from '../cache'
import { coalesce } from '../coalescing'

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default TTL for projects cache (10 minutes - projects change less frequently)
 */
const DEFAULT_CACHE_TTL = 600

/**
 * GitHub Projects API preview header
 */
const PROJECTS_PREVIEW_HEADER = {
  'Accept': 'application/vnd.github.inertia-preview+json',
}

// ============================================================================
// Types
// ============================================================================

/**
 * GitHub API Project Response
 */
interface GitHubProjectResponse {
  id: number
  node_id: string
  name: string
  body: string | null
  number: number
  state: string
  created_at: string
  updated_at: string
  url: string
  html_url: string
  columns_url: string
  owner: {
    login: string
    id: number
    type: string
    avatar_url: string
  }
}

/**
 * GitHub API Column Response
 */
interface GitHubColumnResponse {
  id: number
  node_id: string
  name: string
  created_at: string
  updated_at: string
  url: string
  project_url: string
}

/**
 * GitHub API Card Response
 */
interface GitHubCardResponse {
  id: number
  node_id: string
  column_id: number
  url: string
  project_url: string
  column_url: string
  created_at: string
  updated_at: string
  note: string | null
  content?: any
  archived: boolean
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * List GitHub Projects with columns and cards
 *
 * @param params - Query parameters for filtering
 * @returns Projects with nested columns and cards
 *
 * @example
 * ```ts
 * const projects = await listProjects({
 *   org: 'hscheema1979',
 *   state: 'open',
 *   page: 1,
 *   per_page: 30
 * })
 * ```
 */
export async function listProjects(
  params: ListProjectsRequest = {}
): Promise<ListProjectsResponse> {
  const {
    org,
    repo,
    state = 'open',
    page = 1,
    per_page = 30,
  } = params

  // Build cache key
  const cacheKey = buildProjectsCacheKey(org, repo, state, page, per_page)

  // Check cache first
  const cached = await ProjectCache.getList(org || '', repo || '')
  if (cached && cached.length > 0) {
    console.debug(`[Projects] Cache hit for ${cacheKey}`)
    return {
      projects: cached as ProjectWithColumns[],
      total_count: cached.length,
      page,
      total_pages: Math.ceil(cached.length / per_page),
    }
  }

  // Coalesce concurrent requests
  return coalesce(
    cacheKey,
    async () => {
      console.debug(`[Projects] Fetching from GitHub: ${cacheKey}`)

      const octokit = await getOctokit()

      let projects: ProjectWithColumns[] = []

      // Fetch org-level or repo-level projects
      if (org && !repo) {
        projects = await fetchOrgProjects(org, state, page, per_page, octokit)
      } else if (org && repo) {
        projects = await fetchRepoProjects(org, repo, state, page, per_page, octokit)
      } else {
        throw new Error('Either org or org+repo must be specified')
      }

      // Cache results
      await ProjectCache.setList(org || '', repo || '', projects, {
        ttl: DEFAULT_CACHE_TTL,
      })

      return {
        projects,
        total_count: projects.length,
        page,
        total_pages: Math.ceil(projects.length / per_page),
      }
    }
  )
}

/**
 * Fetch organization-level projects
 *
 * @param org - Organization name
 * @param state - Project state filter
 * @param page - Page number
 * @param perPage - Results per page
 * @param octokit - Authenticated Octokit instance
 * @returns Projects with columns and cards
 */
async function fetchOrgProjects(
  org: string,
  state: string,
  page: number,
  perPage: number,
  octokit: any
): Promise<ProjectWithColumns[]> {
  try {
    // Fetch org projects
    const { data: projectsData } = await octokit.rest.projects.listForOrg({
      org,
      state,
      page,
      per_page: perPage,
      headers: PROJECTS_PREVIEW_HEADER,
    })

    // Enrich each project with columns and cards
    const enrichedProjects = await Promise.all(
      projectsData.map((project: GitHubProjectResponse) =>
        enrichProjectData(project, org, undefined, octokit)
      )
    )

    return enrichedProjects
  } catch (error: any) {
    console.error(`[Projects] Error fetching org projects for ${org}:`, error)
    throw new Error(`Failed to fetch organization projects: ${error.message}`)
  }
}

/**
 * Fetch repository-level projects
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param state - Project state filter
 * @param page - Page number
 * @param perPage - Results per page
 * @param octokit - Authenticated Octokit instance
 * @returns Projects with columns and cards
 */
async function fetchRepoProjects(
  owner: string,
  repo: string,
  state: string,
  page: number,
  perPage: number,
  octokit: any
): Promise<ProjectWithColumns[]> {
  try {
    // Fetch repo projects
    const { data: projectsData } = await octokit.rest.projects.listForRepo({
      owner,
      repo,
      state,
      page,
      per_page: perPage,
      headers: PROJECTS_PREVIEW_HEADER,
    })

    // Enrich each project with columns and cards
    const enrichedProjects = await Promise.all(
      projectsData.map((project: GitHubProjectResponse) =>
        enrichProjectData(project, owner, repo, octokit)
      )
    )

    return enrichedProjects
  } catch (error: any) {
    console.error(`[Projects] Error fetching repo projects for ${owner}/${repo}:`, error)
    throw new Error(`Failed to fetch repository projects: ${error.message}`)
  }
}

/**
 * Fetch project columns
 *
 * @param projectId - Project ID
 * @param octokit - Authenticated Octokit instance
 * @returns Array of columns
 */
async function fetchProjectColumns(
  projectId: number,
  octokit: any
): Promise<ProjectColumn[]> {
  try {
    const { data: columnsData } = await octokit.rest.projects.listColumns({
      project_id: projectId,
      headers: PROJECTS_PREVIEW_HEADER,
    })

    // Fetch cards for each column
    const columnsWithCards = await Promise.all(
      columnsData.map(async (column: GitHubColumnResponse) => {
        const cards = await fetchProjectCards(column.id, octokit)

        return {
          ...column,
          cards,
          cardCount: cards.length,
        } as ProjectColumn
      })
    )

    return columnsWithCards
  } catch (error: any) {
    console.error(`[Projects] Error fetching columns for project ${projectId}:`, error)
    return []
  }
}

/**
 * Fetch cards in a column
 *
 * @param columnId - Column ID
 * @param octokit - Authenticated Octokit instance
 * @returns Array of cards
 */
async function fetchProjectCards(
  columnId: number,
  octokit: any
): Promise<ProjectCard[]> {
  try {
    const { data: cardsData } = await octokit.rest.projects.listCards({
      column_id: columnId,
      archived_state: 'not_archived',
      headers: PROJECTS_PREVIEW_HEADER,
    })

    // Enrich each card
    return cardsData.map((card: GitHubCardResponse) => enrichCardData(card))
  } catch (error: any) {
    console.error(`[Projects] Error fetching cards for column ${columnId}:`, error)
    return []
  }
}

/**
 * Enrich project data with columns and computed fields
 *
 * @param project - GitHub project response
 * @param owner - Owner name
 * @param repo - Repository name (optional)
 * @param octokit - Authenticated Octokit instance
 * @returns Enriched project with columns and cards
 */
async function enrichProjectData(
  project: GitHubProjectResponse,
  owner: string,
  repo: string | undefined,
  octokit: any
): Promise<ProjectWithColumns> {
  // Fetch columns
  const columns = await fetchProjectColumns(project.id, octokit)

  // Compute card count
  const cardCount = columns.reduce((sum, col) => sum + col.cardCount, 0)

  // Compute last updated
  const lastUpdated = columns.reduce((latest, col) => {
    const colUpdated = new Date(col.updated_at).getTime()
    return colUpdated > latest ? colUpdated : latest
  }, new Date(project.updated_at).getTime())

  // Compute progress (if any column suggests completion)
  const progress = computeProgress(columns)

  return {
    ...project,
    owner: {
      ...project.owner,
      type: project.owner.type as 'Organization' | 'Repository',
    },
    repository: repo ? {
      id: 0, // Will be populated if needed
      name: repo,
      full_name: `${owner}/${repo}`,
      private: false,
    } : undefined,
    columns,
    cardCount,
    lastUpdated: new Date(lastUpdated).toISOString(),
    progress,
  }
}

/**
 * Enrich card data with computed fields
 *
 * @param card - GitHub card response
 * @returns Enriched card
 */
function enrichCardData(card: GitHubCardResponse): ProjectCard {
  const contentType = card.content
    ? card.content.type === 'PullRequest'
      ? 'pull_request'
      : 'issue'
    : 'note'

  const isClosed = card.content?.state === 'closed'

  const assigneeAvatars = card.content?.assignees?.map((a: any) => a.avatar_url) || []

  // Determine priority from labels
  const priority = card.content?.labels?.find((l: any) =>
    l.name.toLowerCase().includes('priority')
  )?.name
    ?.toLowerCase()
    ?.includes('high')
    ? 'high'
    : card.content?.labels?.some((l: any) => l.name.toLowerCase().includes('medium'))
    ? 'medium'
    : 'low'

  return {
    ...card,
    contentType,
    isClosed,
    assigneeAvatars,
    priority,
  }
}

/**
 * Compute project progress based on columns
 *
 * @param columns - Project columns
 * @returns Progress percentage (0-100)
 */
function computeProgress(columns: ProjectColumn[]): number | undefined {
  // Look for columns that suggest completion (e.g., "Done", "Completed", "Closed")
  const doneColumns = columns.filter(col =>
    /done|completed|closed|finished|verified/i.test(col.name)
  )

  if (doneColumns.length === 0) {
    return undefined
  }

  const totalCards = columns.reduce((sum, col) => sum + col.cardCount, 0)
  const doneCards = doneColumns.reduce((sum, col) => sum + col.cardCount, 0)

  if (totalCards === 0) {
    return undefined
  }

  return Math.round((doneCards / totalCards) * 100)
}

/**
 * Build cache key for projects request
 *
 * @param org - Organization name
 * @param repo - Repository name
 * @param state - Project state
 * @param page - Page number
 * @param perPage - Results per page
 * @returns Cache key
 */
function buildProjectsCacheKey(
  org?: string,
  repo?: string,
  state = 'open',
  page = 1,
  perPage = 30
): string {
  const parts = ['projects', org || 'default', repo || 'all', state, page, perPage]
  return parts.filter(Boolean).join(':')
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Invalidate projects cache
 *
 * @param org - Organization name
 * @param repo - Repository name (optional)
 */
export async function invalidateProjectsCache(
  org?: string,
  repo?: string
): Promise<void> {
  if (org && repo) {
    await ProjectCache.invalidateList(org, repo)
  } else if (org) {
    await ProjectCache.invalidateList(org, '')
  } else {
    console.warn('[Projects] Cannot invalidate cache without org parameter')
  }
}

/**
 * Get a single project by ID
 *
 * @param projectId - Project ID
 * @param owner - Owner name
 * @param repo - Repository name (optional)
 * @returns Project with columns and cards
 */
export async function getProject(
  projectId: number,
  owner: string,
  repo?: string
): Promise<ProjectWithColumns | null> {
  try {
    const octokit = await getOctokit()

    let project: GitHubProjectResponse

    if (repo) {
      // Fetch repo project using projects API
      const response = await octokit.request('GET /repos/{owner}/{repo}/projects/{project_id}', {
        owner,
        repo,
        project_id: projectId,
        headers: PROJECTS_PREVIEW_HEADER,
      })
      project = response.data as GitHubProjectResponse
    } else {
      // Fetch org project using projects API
      const response = await octokit.request('GET /orgs/{org}/projects/{project_id}', {
        org: owner,
        project_id: projectId,
        headers: PROJECTS_PREVIEW_HEADER,
      })
      project = response.data as GitHubProjectResponse
    }

    return enrichProjectData(project, owner, repo, octokit)
  } catch (error: any) {
    console.error(`[Projects] Error fetching project ${projectId}:`, error)
    return null
  }
}
