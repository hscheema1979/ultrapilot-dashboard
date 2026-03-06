/**
 * API Types for UltraPilot Dashboard
 *
 * This file contains TypeScript types for all API endpoints, including GitHub Projects API integration.
 */

// ============================================================================
// GitHub Projects API Types
// ============================================================================

/**
 * List Projects Request Parameters
 */
export interface ListProjectsRequest {
  /** Filter by organization (optional) */
  org?: string
  /** Filter by repository (optional) */
  repo?: string
  /** Project state: open, closed, or all (default: open) */
  state?: 'open' | 'closed' | 'all'
  /** Page number for pagination (default: 1) */
  page?: number
  /** Number of results per page (default: 30, max: 100) */
  per_page?: number
}

/**
 * List Projects Response
 */
export interface ListProjectsResponse {
  /** Array of projects with columns and cards */
  projects: ProjectWithColumns[]
  /** Total count (if paginated) */
  total_count?: number
  /** Current page (if paginated) */
  page?: number
  /** Total pages (if paginated) */
  total_pages?: number
}

/**
 * Project with nested columns and cards
 */
export interface ProjectWithColumns {
  /** Project ID */
  id: number
  /** Project node ID */
  node_id: string
  /** Project name */
  name: string
  /** Project description */
  body: string | null
  /** Project number */
  number: number
  /** Project state */
  state: 'open' | 'closed'
  /** Project creator */
  creator: {
    login: string
    id: number
    avatar_url: string
    type: string
  }
  /** Creation date */
  created_at: string
  /** Last updated date */
  updated_at: string
  /** Project URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Columns URL */
  columns_url: string
  /** Owner (organization or repository) */
  owner: {
    login: string
    id: number
    type: 'Organization' | 'Repository'
    avatar_url: string
  }
  /** Repository (if repo-level project) */
  repository?: {
    id: number
    name: string
    full_name: string
    private: boolean
  }
  /** Project columns */
  columns: ProjectColumn[]
  /** Computed: total card count */
  cardCount: number
  /** Computed: last updated timestamp */
  lastUpdated: string
  /** Computed: completion percentage */
  progress?: number
}

/**
 * Project Column with cards
 */
export interface ProjectColumn {
  /** Column ID */
  id: number
  /** Column node ID */
  node_id: string
  /** Column name */
  name: string
  /** Creation date */
  created_at: string
  /** Update date */
  updated_at: string
  /** Column URL */
  url: string
  /** Project URL */
  project_url: string
  /** Cards in this column */
  cards: ProjectCard[]
  /** Computed: card count */
  cardCount: number
}

/**
 * Project Card (issue or PR reference)
 */
export interface ProjectCard {
  /** Card ID */
  id: number
  /** Card node ID */
  node_id: string
  /** Column ID */
  column_id: number
  /** Card URL */
  url: string
  /** Project URL */
  project_url: string
  /** Column URL */
  column_url: string
  /** Creation date */
  created_at: string
  /** Update date */
  updated_at: string
  /** Card note (if not associated with issue/PR) */
  note: string | null
  /** Associated issue or PR */
  content?: {
    /** Content type (Issue or PullRequest) */
    type: 'Issue' | 'PullRequest'
    /** Issue/PR ID */
    id: number
    /** Issue/PR number */
    number: number
    /** Issue/PR title */
    title: string
    /** Issue/PR state */
    state: 'open' | 'closed'
    /** Issue/PR URL */
    html_url: string
    /** Issue/PR API URL */
    url: string
    /** Repository information */
    repository: {
      id: number
      name: string
      full_name: string
      owner: {
        login: string
        id: number
        avatar_url: string
      }
    }
    /** Assignees */
    assignees: Array<{
      login: string
      id: number
      avatar_url: string
      type: string
    }>
    /** Labels */
    labels: Array<{
      id: number
      name: string
      color: string
      description: string | null
    }>
    /** Milestone */
    milestone?: {
      id: number
      number: number
      title: string
      state: 'open' | 'closed'
    }
    /** Closed date */
    closed_at: string | null
    /** Created date */
    created_at: string
    /** Updated date */
    updated_at: string
  }
  /** Archived status */
  archived: boolean
  /** Computed: card type (issue, pull_request, note) */
  contentType: 'issue' | 'pull_request' | 'note'
  /** Computed: is closed (for issues/PRs) */
  isClosed: boolean
  /** Computed: assignee avatars */
  assigneeAvatars: string[]
  /** Computed: priority (based on labels) */
  priority?: 'high' | 'medium' | 'low'
}

// ============================================================================
// GitHub API Error Types
// ============================================================================

/**
 * GitHub API Error Response
 */
export interface GitHubAPIError {
  /** Error message */
  message: string
  /** Documentation URL */
  documentation_url?: string
  /** Error code */
  code?: string
  /** Error status */
  status?: number
}

// ============================================================================
// Cache Types
// ============================================================================

/**
 * Cache options for Projects API
 */
export interface ProjectsCacheOptions {
  /** TTL in seconds (default: 600 = 10 minutes) */
  ttl?: number
  /** Cache version */
  version?: number
  /** Event ID for ordering */
  eventId?: string
}

// ============================================================================
// Coalescing Types
// ============================================================================

/**
 * Coalesced request state
 */
export interface CoalescedRequest<T> {
  /** Request key */
  key: string
  /** Request promise */
  promise: Promise<T>
  /** Request timestamp */
  timestamp: number
  /** Request status */
  status: 'pending' | 'resolved' | 'rejected'
}

// ============================================================================
// Repository API Types
// ============================================================================

/**
 * Query parameters for listing repositories
 */
export interface ListReposRequest {
  /** Filter by specific organization (optional) */
  org?: string
  /** Page number (default: 1) */
  page?: number
  /** Results per page (default: 30, max: 100) */
  per_page?: number
  /** Sort field (default: updated) */
  sort?: 'name' | 'created' | 'updated' | 'pushed'
  /** Sort direction (default: desc) */
  direction?: 'asc' | 'desc'
  /** Search query for repo name/description (optional) */
  search?: string
}

/**
 * Repository filters for processing
 */
export interface RepositoryFilters {
  /** Organization to filter by */
  org?: string
  /** Search query string */
  search?: string
}

/**
 * Repository sort options
 */
export interface RepositorySort {
  /** Field to sort by */
  field: 'name' | 'created' | 'updated' | 'pushed'
  /** Sort direction */
  direction: 'asc' | 'desc'
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  /** Current page number */
  page: number
  /** Results per page */
  perPage: number
  /** Total number of results */
  total: number
  /** Total number of pages */
  totalPages: number
  /** Whether there's a next page */
  hasNext: boolean
  /** Whether there's a previous page */
  hasPrev: boolean
}

/**
 * Repository with enriched/computed fields
 */
export interface EnrichedRepository {
  /** Unique repository identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Repository name */
  name: string
  /** Full name including owner (owner/repo) */
  full_name: string
  /** Owner of the repository */
  owner: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    type: string
    site_admin: boolean
  }
  /** Repository description */
  description: string | null
  /** Whether the repository is private */
  private: boolean
  /** Whether the repository is a fork */
  fork: boolean
  /** Repository creation date */
  created_at: string
  /** Repository last update date */
  updated_at: string
  /** Last push date */
  pushed_at: string
  /** Homepage URL */
  homepage: string | null
  /** Repository size in KB */
  size: number
  /** Number of stargazers */
  stargazers_count: number
  /** Number of watchers */
  watchers_count: number
  /** Number of forks */
  forks_count: number
  /** Number of open issues */
  open_issues_count: number
  /** Primary programming language */
  language: string | null
  /** Whether issues are enabled */
  has_issues: boolean
  /** Whether projects are enabled */
  has_projects: boolean
  /** Whether wiki is enabled */
  has_wiki: boolean
  /** Whether pages are enabled */
  has_pages: boolean
  /** Whether discussions are enabled */
  has_discussions: boolean
  /** Default branch name */
  default_branch: string
  /** Repository permissions for current user */
  permissions?: {
    admin: boolean
    maintain?: boolean
    push: boolean
    triage?: boolean
    pull: boolean
  }
  /** Whether the repository is a template */
  is_template?: boolean
  /** License information */
  license?: {
    key: string
    name: string
    url?: string
    spdx_id?: string
    node_id?: string
  } | null
  /** Repository topics */
  topics?: string[]
  /** Clone URLs */
  clone_url: string
  git_url: string
  ssh_url: string
  svn_url: string
  /** Whether the repository is archived */
  archived: boolean
  /** Number of subscribers */
  subscribers_count: number
  /** Computed: Is this a fork? */
  isFork: boolean
  /** Computed: Is repo actively maintained (pushed in last 6 months)? */
  isActive: boolean
  /** Computed: Repo age in days */
  ageInDays: number
  /** Computed: Organization name (from owner) */
  organization: string
}

/**
 * Response for repository listing API
 */
export interface ListReposResponse {
  /** Array of repositories */
  repositories: EnrichedRepository[]
  /** Pagination metadata */
  pagination: PaginationMeta
  /** Request parameters used */
  request: ListReposRequest
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate ListReposRequest parameters
 */
export function validateListReposRequest(params: Partial<ListReposRequest>): ListReposRequest {
  const validated: ListReposRequest = {
    page: 1,
    per_page: 30,
    sort: 'updated',
    direction: 'desc',
    ...params,
  }

  // Validate and sanitize page
  if (validated.page !== undefined) {
    const pageNum = Number(validated.page)
    if (isNaN(pageNum) || pageNum < 1) {
      validated.page = 1
    } else {
      validated.page = Math.floor(pageNum)
    }
  }

  // Validate and sanitize per_page
  if (validated.per_page !== undefined) {
    const perPage = Number(validated.per_page)
    if (isNaN(perPage) || perPage < 1) {
      validated.per_page = 30
    } else if (perPage > 100) {
      validated.per_page = 100
    } else {
      validated.per_page = Math.floor(perPage)
    }
  }

  // Validate sort field
  if (validated.sort && !['name', 'created', 'updated', 'pushed'].includes(validated.sort)) {
    validated.sort = 'updated'
  }

  // Validate direction
  if (validated.direction && !['asc', 'desc'].includes(validated.direction)) {
    validated.direction = 'desc'
  }

  // Sanitize search string
  if (validated.search) {
    validated.search = validated.search.trim().slice(0, 100)
  }

  // Sanitize org string
  if (validated.org) {
    validated.org = validated.org.trim().toLowerCase().slice(0, 39)
  }

  return validated
}

/**
 * Parse URL search params into ListReposRequest
 */
export function parseListReposRequest(searchParams: URLSearchParams): ListReposRequest {
  const params: Partial<ListReposRequest> = {}

  const org = searchParams.get('org')
  if (org) params.org = org

  const page = searchParams.get('page')
  if (page) params.page = parseInt(page, 10)

  const perPage = searchParams.get('per_page')
  if (perPage) params.per_page = parseInt(perPage, 10)

  const sort = searchParams.get('sort')
  if (sort) params.sort = sort as ListReposRequest['sort']

  const direction = searchParams.get('direction')
  if (direction) params.direction = direction as ListReposRequest['direction']

  const search = searchParams.get('search')
  if (search) params.search = search

  return validateListReposRequest(params)
}

// ============================================================================
// Workflow Monitoring Types
// ============================================================================

/**
 * Workflow state based on autoloop labels
 */
export type WorkflowState =
  | 'pending'      // queue:intake
  | 'active'       // queue:in-progress
  | 'completed'    // queue:done
  | 'blocked'      // status:blocked
  | 'failed'       // error occurred

/**
 * Workflow phase (UltraPilot phases)
 */
export type WorkflowPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6

/**
 * Agent types that can work on workflows
 */
export type WorkflowAgent =
  | 'ultra:analyst'
  | 'ultra:architect'
  | 'ultra:planner'
  | 'ultra:critic'
  | 'ultra:executor'
  | 'ultra:executor-low'
  | 'ultra:executor-high'
  | 'ultra:test-engineer'
  | 'ultra:verifier'
  | 'ultra:security-reviewer'
  | 'ultra:quality-reviewer'
  | 'ultra:code-reviewer'
  | 'ultra:debugger'
  | 'ultra:scientist'
  | 'ultra:build-fixer'
  | 'ultra:designer'
  | 'ultra:writer'
  | 'ultra:team-lead'
  | 'ultra:team-implementer'
  | 'ultra:team-reviewer'
  | 'ultra:team-debugger'

/**
 * Workflow issue metadata parsed from GitHub issue
 */
export interface WorkflowIssue {
  /** Workflow ID (typically the issue number) */
  id: string
  /** GitHub issue number */
  issueNumber: number
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Workflow title */
  title: string
  /** Current workflow state */
  state: WorkflowState
  /** Current phase (0-6) */
  phase: WorkflowPhase
  /** Agent currently assigned */
  agent: WorkflowAgent | null
  /** All labels attached to the issue */
  labels: string[]
  /** Assignees */
  assignees: string[]
  /** Issue creation date */
  createdAt: string
  /** Last updated date */
  updatedAt: string
  /** HTML URL to the issue */
  htmlUrl: string
  /** API URL to the issue */
  url: string
  /** Project ID (if in project board) */
  projectId?: string
  /** Project item ID */
  itemId?: string
  /** Dependencies (issue numbers) */
  dependencies: number[]
  /** Body content */
  body: string | null
}

/**
 * Workflow filter options
 */
export interface WorkflowFilters {
  /** Filter by state */
  state?: WorkflowState
  /** Filter by phase */
  phase?: WorkflowPhase
  /** Filter by agent type */
  agent?: WorkflowAgent
  /** Filter by repository owner */
  owner?: string
  /** Filter by repository name */
  repo?: string
  /** Search in title */
  search?: string
  /** Page number (for pagination) */
  page?: number
  /** Items per page */
  per_page?: number
}

/**
 * Paginated workflow response
 */
export interface WorkflowListResponse {
  /** Array of workflow issues */
  workflows: WorkflowIssue[]
  /** Total count (for pagination) */
  totalCount: number
  /** Current page */
  page: number
  /** Items per page */
  perPage: number
  /** Total pages */
  totalPages: number
}

/**
 * Workflow statistics
 */
export interface WorkflowStats {
  /** Total workflows */
  total: number
  /** Pending workflows */
  pending: number
  /** Active workflows */
  active: number
  /** Completed workflows */
  completed: number
  /** Blocked workflows */
  blocked: number
  /** Failed workflows */
  failed: number
  /** Workflows by phase */
  byPhase: Record<WorkflowPhase, number>
  /** Workflows by agent */
  byAgent: Record<string, number>
}

// ============================================================================
// Autoloop Types
// ============================================================================

/**
 * Autoloop health status
 */
export type AutoloopHealth = 'healthy' | 'degraded' | 'down'

/**
 * Supervision module status
 */
export interface SupervisionModule {
  /** Module name */
  name: string
  /** Module status */
  status: 'active' | 'idle' | 'error'
  /** Last execution timestamp */
  lastExecution: string | null
  /** Execution count */
  executionCount: number
  /** Error count (if any) */
  errorCount?: number
  /** Additional module-specific data */
  data?: Record<string, unknown>
}

/**
 * Autoloop heartbeat status
 */
export interface AutoloopHeartbeat {
  /** Last heartbeat timestamp */
  lastHeartbeat: string | null
  /** Autoloop health status */
  health: AutoloopHealth
  /** Active workflows count */
  activeWorkflows: number
  /** Supervision module statuses */
  supervision: {
    /** Workflow scanner module */
    scanner: SupervisionModule
    /** Expectation validator module */
    validator: SupervisionModule
    /** Dependency trigger module */
    trigger: SupervisionModule
    /** Agentic intervention module */
    intervention: SupervisionModule
  }
  /** Cycle count (total autoloop cycles) */
  cycleCount: number
  /** Uptime percentage (0-100) */
  uptime: number
  /** Error message (if unhealthy) */
  error?: string | null
}

/**
 * Heartbeat data parsed from GitHub issue comment
 */
export interface HeartbeatData {
  /** Timestamp when heartbeat was created */
  timestamp: string
  /** Cycle number */
  cycle: number
  /** Active workflows */
  activeWorkflows: number
  /** Scanner status */
  scannerStatus: 'active' | 'idle' | 'error'
  /** Validator status */
  validatorStatus: 'active' | 'idle' | 'error'
  /** Trigger status */
  triggerStatus: 'active' | 'idle' | 'error'
  /** Intervention status */
  interventionStatus: 'active' | 'idle' | 'error'
  /** Health status */
  health: AutoloopHealth
}

// ============================================================================
// GitHub Actions Types
// ============================================================================

/**
 * Workflow run status (GitHub Actions)
 */
export type ActionRunStatus = 'queued' | 'in_progress' | 'completed' | 'failed'

/**
 * Workflow run conclusion (GitHub Actions)
 */
export type ActionRunConclusion = 'success' | 'failure' | 'cancelled' | 'timed_out' | 'action_required' | 'neutral' | null

/**
 * Action run with repository context
 */
export interface ActionRun {
  /** Run ID */
  id: number
  /** Run name (workflow filename) */
  name: string
  /** Run number */
  runNumber: number
  /** Run attempt (for re-runs) */
  runAttempt: number
  /** Event that triggered the workflow */
  event: string
  /** Current status */
  status: ActionRunStatus
  /** Conclusion (if completed) */
  conclusion: ActionRunConclusion
  /** Head branch */
  headBranch: string
  /** Head commit SHA */
  headSha: string
  /** Head commit message */
  headCommitMessage: string | null
  /** Actor who triggered the run */
  actor: {
    login: string
    avatarUrl: string
    htmlUrl: string
  }
  /** Repository information */
  repository: {
    owner: string
    name: string
    fullName: string
    htmlUrl: string
  }
  /** Workflow run creation date */
  createdAt: string
  /** Workflow run last update date */
  updatedAt: string
  /** Workflow run start date */
  runStartedAt: string
  /** HTML URL to the run */
  htmlUrl: string
  /** Logs URL */
  logsUrl: string
  /** Jobs URL */
  jobsUrl: string
  /** Workflow run duration in seconds */
  duration?: number
}

/**
 * Action run filters
 */
export interface ActionRunFilters {
  /** Filter by repository owner */
  owner?: string
  /** Filter by repository name */
  repo?: string
  /** Filter by status */
  status?: ActionRunStatus
  /** Filter by branch */
  branch?: string
  /** Page number */
  page?: number
  /** Items per page */
  per_page?: number
}

/**
 * Paginated action runs response
 */
export interface ActionRunListResponse {
  /** Array of workflow runs */
  runs: ActionRun[]
  /** Total count */
  totalCount: number
  /** Current page */
  page: number
  /** Items per page */
  perPage: number
  /** Total pages */
  totalPages: number
}
