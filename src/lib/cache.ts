/**
 * Distributed Cache Layer using SQLite with WAL Mode
 *
 * Provides a unified caching interface with:
 * - SQLite integration for persistent caching
 * - WAL mode for concurrent reads/writes
 * - TTL support with configurable defaults
 * - Cache versioning for coherence
 * - Event ID tracking for out-of-order detection
 * - Comprehensive error handling
 */

import {
  getDatabase,
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheClear,
  cacheKeys,
  type CacheRow,
  startPeriodicCleanup,
  setupGracefulShutdown,
} from './db'

// ============================================================================
// Types
// ============================================================================

/**
 * Cached data with version metadata
 */
export interface CachedData<T> {
  /** The cached data */
  data: T
  /** Cache version for coherence */
  version: number
  /** Event ID for ordering (if applicable) */
  eventId?: string
  /** Timestamp when cached */
  cachedAt: number
}

/**
 * Cache entry with metadata
 */
export interface CacheEntry<T> {
  /** Versioned cached data */
  value: CachedData<T>
  /** TTL in seconds */
  ttl?: number
}

/**
 * Cache options
 */
export interface CacheOptions {
  /** TTL in seconds (default: 300 = 5 minutes) */
  ttl?: number
  /** Cache version tag */
  version?: number
  /** Event ID for ordering */
  eventId?: string
}

/**
 * Repository data structure
 */
export interface RepositoryData {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  open_issues_count: number
  default_branch: string
}

/**
 * Issue data structure
 */
export interface IssueData {
  id: number
  node_id: string
  url: string
  repository_url: string
  labels_url: string
  comments_url: string
  events_url: string
  html_url: string
  number: number
  state: string
  title: string
  body: string | null
  user: {
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
  labels: Array<{
    id: number
    node_id: string
    url: string
    name: string
    color: string
    default: boolean
    description: string | null
  }>
  assignee: any
  assignees: any[]
  milestone: any
  locked: boolean
  comments: number
  created_at: string
  updated_at: string
  closed_at: string | null
  author_association: string
}

/**
 * Workflow run data structure
 */
export interface WorkflowRunData {
  id: number
  name: string
  node_id: string
  head_branch: string
  head_sha: string
  run_number: number
  event: string
  status: string
  conclusion: string | null
  workflow_id: number
  check_suite_id: number
  check_suite_node_id: string
  url: string
  html_url: string
  created_at: string
  updated_at: string
  run_started_at: string
  jobs_url: string
  logs_url: string
  check_suite_url: string
  artifacts_url: string
  cancel_url: string
  rerun_url: string
  previous_attempt_url: string | null
  run_attempt: number
  triggering_actor: any
  repository: any
  head_commit: any
}

/**
 * Project data structure
 */
export interface ProjectData {
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
  owner: any
}

// ============================================================================
// Cache Implementation
// ============================================================================

/**
 * Initialize database and setup periodic cleanup
 */
let initialized = false

function initializeCache(): void {
  if (initialized) {
    return
  }

  try {
    // Initialize database
    getDatabase()

    // Start periodic cleanup (every 5 minutes)
    startPeriodicCleanup(300000)

    // Setup graceful shutdown
    setupGracefulShutdown()

    initialized = true
    console.debug('[Cache] SQLite cache initialized with WAL mode')
  } catch (error) {
    console.error('[Cache] Failed to initialize cache:', error)
    throw error
  }
}

/**
 * Default TTL in seconds (5 minutes)
 */
const DEFAULT_TTL = 300

/**
 * Cache key prefix
 */
const CACHE_PREFIX = 'ultrapilot:'

/**
 * Build cache key with prefix
 */
function buildKey(key: string): string {
  return `${CACHE_PREFIX}${key}`
}

/**
 * Serialize data for storage
 */
function serialize<T>(data: CachedData<T>): string {
  return JSON.stringify(data)
}

/**
 * Deserialize data from storage
 */
function deserialize<T>(value: string): CachedData<T> | null {
  try {
    return JSON.parse(value) as CachedData<T>
  } catch {
    return null
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Get data from cache
 *
 * @param key - Cache key
 * @returns Cached data or null if not found/expired
 *
 * @example
 * ```ts
 * const cached = await cache.get<RepositoryData>('repo:owner:name')
 * if (cached) {
 *   console.log('Cache hit:', cached.data)
 * }
 * ```
 */
export async function get<T>(key: string): Promise<CachedData<T> | null> {
  try {
    initializeCache()

    const row = cacheGet(buildKey(key))

    if (!row) {
      return null
    }

    const deserialized = deserialize<T>(row.value)
    if (!deserialized) {
      return null
    }

    return deserialized
  } catch (error) {
    console.error(`[Cache] Error getting key "${key}":`, error)
    return null
  }
}

/**
 * Set data in cache
 *
 * @param key - Cache key
 * @param data - Data to cache
 * @param options - Cache options (TTL, version, eventId)
 *
 * @example
 * ```ts
 * await cache.set('repo:owner:name', repositoryData, {
 *   ttl: 600, // 10 minutes
 *   version: 1,
 *   eventId: '12345'
 * })
 * ```
 */
export async function set<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    initializeCache()

    const ttl = options.ttl ?? DEFAULT_TTL

    const cachedData: CachedData<T> = {
      data,
      version: options.version ?? 1,
      eventId: options.eventId,
      cachedAt: Date.now(),
    }

    const serialized = serialize(cachedData)
    cacheSet(
      buildKey(key),
      serialized,
      ttl,
      options.version ?? 1,
      options.eventId || null
    )

    return true
  } catch (error) {
    console.error(`[Cache] Error setting key "${key}":`, error)
    return false
  }
}

/**
 * Delete data from cache
 *
 * @param key - Cache key to delete
 * @returns true if deleted, false otherwise
 *
 * @example
 * ```ts
 * await cache.delete('repo:owner:name')
 * ```
 */
export async function delete_(key: string): Promise<boolean> {
  try {
    initializeCache()
    return cacheDelete(buildKey(key))
  } catch (error) {
    console.error(`[Cache] Error deleting key "${key}":`, error)
    return false
  }
}

/**
 * Check if cached data is stale based on event ID ordering
 *
 * @param cached - Cached data to check
 * @param newEventId - New event ID to compare against
 * @returns true if cached data is stale (newer event exists)
 *
 * @example
 * ```ts
 * const cached = await cache.get<IssueData>('issue:123')
 * if (cached && isStale(cached, newEventId)) {
 *   // Cache is stale, fetch fresh data
 * }
 * ```
 */
export function isStale<T>(cached: CachedData<T>, newEventId: string): boolean {
  if (!cached.eventId || !newEventId) {
    return false
  }

  // Compare event IDs (GitHub webhook delivery IDs are monotonically increasing)
  const cachedId = parseInt(cached.eventId, 10)
  const newId = parseInt(newEventId, 10)

  if (isNaN(cachedId) || isNaN(newId)) {
    return false
  }

  return newId > cachedId
}

/**
 * Get cache version for coherence checking
 *
 * @param key - Cache key
 * @returns Current version or 0 if not cached
 *
 * @example
 * ```ts
 * const version = await cache.getVersion('repo:owner:name')
 * console.log('Current version:', version)
 * ```
 */
export async function getVersion(key: string): Promise<number> {
  const cached = await get(key)
  return cached?.version ?? 0
}

/**
 * Increment cache version (for manual version control)
 *
 * @param key - Cache key
 * @returns New version number
 *
 * @example
 * ```ts
 * const newVersion = await cache.incrementVersion('repo:owner:name')
 * await cache.set('repo:owner:name', data, { version: newVersion })
 * ```
 */
export async function incrementVersion(key: string): Promise<number> {
  const currentVersion = await getVersion(key)
  return currentVersion + 1
}

/**
 * Clear all cache entries (use with caution)
 *
 * @returns true if successful, false otherwise
 *
 * @example
 * ```ts
 * await cache.clear()
 * ```
 */
export async function clear(): Promise<boolean> {
  try {
    initializeCache()
    return cacheClear()
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error)
    return false
  }
}

/**
 * Get all cache keys matching a pattern
 *
 * @param pattern - Pattern to match (use * for wildcard)
 * @returns Array of matching keys
 *
 * @example
 * ```ts
 * const keys = await cache.getKeys('repo:owner:*')
 * ```
 */
export async function getKeys(pattern?: string): Promise<string[]> {
  try {
    initializeCache()

    const sqlPattern = pattern ? `${CACHE_PREFIX}${pattern}` : `${CACHE_PREFIX}%`
    const keys = cacheKeys(sqlPattern)

    // Remove prefix from returned keys
    return keys.map(key => key.slice(CACHE_PREFIX.length))
  } catch (error) {
    console.error('[Cache] Error getting keys:', error)
    return []
  }
}

// ============================================================================
// Specialized Cache Helpers
// ============================================================================

/**
 * Cache key builders for different data types
 */
export const CacheKeys = {
  /** Repository cache key */
  repository: (owner: string, repo: string) => `repo:${owner}:${repo}`,

  /** Issue cache key */
  issue: (owner: string, repo: string, issueNumber: number) =>
    `issue:${owner}:${repo}:${issueNumber}`,

  /** Issues list cache key */
  issuesList: (owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') =>
    `issues:${owner}:${repo}:${state}`,

  /** Workflow run cache key */
  workflowRun: (owner: string, repo: string, runId: number) =>
    `workflow:${owner}:${repo}:${runId}`,

  /** Workflow runs list cache key */
  workflowRuns: (owner: string, repo: string) =>
    `workflows:${owner}:${repo}`,

  /** Project cache key */
  project: (owner: string, repo: string, projectNumber: number) =>
    `project:${owner}:${repo}:${projectNumber}`,

  /** Projects list cache key */
  projectsList: (owner: string, repo: string) =>
    `projects:${owner}:${repo}`,
}

/**
 * Cache helpers for repositories
 */
export const RepositoryCache = {
  /**
   * Get repository from cache
   */
  async get(owner: string, repo: string): Promise<RepositoryData | null> {
    const cached = await get<RepositoryData>(CacheKeys.repository(owner, repo))
    return cached?.data ?? null
  },

  /**
   * Set repository in cache
   */
  async set(
    owner: string,
    repo: string,
    data: RepositoryData,
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.repository(owner, repo), data, options)
  },

  /**
   * Invalidate repository cache
   */
  async invalidate(owner: string, repo: string): Promise<boolean> {
    return delete_(CacheKeys.repository(owner, repo))
  },
}

/**
 * Cache helpers for issues
 */
export const IssueCache = {
  /**
   * Get issue from cache
   */
  async get(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<IssueData | null> {
    const cached = await get<IssueData>(
      CacheKeys.issue(owner, repo, issueNumber)
    )
    return cached?.data ?? null
  },

  /**
   * Set issue in cache
   */
  async set(
    owner: string,
    repo: string,
    issueNumber: number,
    data: IssueData,
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.issue(owner, repo, issueNumber), data, options)
  },

  /**
   * Get issues list from cache
   */
  async getList(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all' = 'open'
  ): Promise<IssueData[] | null> {
    const cached = await get<IssueData[]>(
      CacheKeys.issuesList(owner, repo, state)
    )
    return cached?.data ?? null
  },

  /**
   * Set issues list in cache
   */
  async setList(
    owner: string,
    repo: string,
    state: 'open' | 'closed' | 'all',
    data: IssueData[],
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.issuesList(owner, repo, state), data, options)
  },

  /**
   * Invalidate issue cache
   */
  async invalidate(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<boolean> {
    return delete_(CacheKeys.issue(owner, repo, issueNumber))
  },

  /**
   * Invalidate issues list cache
   */
  async invalidateList(
    owner: string,
    repo: string,
    state?: 'open' | 'closed' | 'all'
  ): Promise<boolean> {
    if (state) {
      return delete_(CacheKeys.issuesList(owner, repo, state))
    }
    // Invalidate all states
    await delete_(CacheKeys.issuesList(owner, repo, 'open'))
    await delete_(CacheKeys.issuesList(owner, repo, 'closed'))
    await delete_(CacheKeys.issuesList(owner, repo, 'all'))
    return true
  },
}

/**
 * Cache helpers for workflows
 */
export const WorkflowCache = {
  /**
   * Get workflow run from cache
   */
  async get(
    owner: string,
    repo: string,
    runId: number
  ): Promise<WorkflowRunData | null> {
    const cached = await get<WorkflowRunData>(
      CacheKeys.workflowRun(owner, repo, runId)
    )
    return cached?.data ?? null
  },

  /**
   * Set workflow run in cache
   */
  async set(
    owner: string,
    repo: string,
    runId: number,
    data: WorkflowRunData,
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.workflowRun(owner, repo, runId), data, options)
  },

  /**
   * Get workflow runs list from cache
   */
  async getList(
    owner: string,
    repo: string
  ): Promise<WorkflowRunData[] | null> {
    const cached = await get<WorkflowRunData[]>(
      CacheKeys.workflowRuns(owner, repo)
    )
    return cached?.data ?? null
  },

  /**
   * Set workflow runs list in cache
   */
  async setList(
    owner: string,
    repo: string,
    data: WorkflowRunData[],
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.workflowRuns(owner, repo), data, options)
  },

  /**
   * Invalidate workflow run cache
   */
  async invalidate(
    owner: string,
    repo: string,
    runId: number
  ): Promise<boolean> {
    return delete_(CacheKeys.workflowRun(owner, repo, runId))
  },

  /**
   * Invalidate workflow runs list cache
   */
  async invalidateList(owner: string, repo: string): Promise<boolean> {
    return delete_(CacheKeys.workflowRuns(owner, repo))
  },
}

/**
 * Cache helpers for projects
 */
export const ProjectCache = {
  /**
   * Get project from cache
   */
  async get(
    owner: string,
    repo: string,
    projectNumber: number
  ): Promise<ProjectData | null> {
    const cached = await get<ProjectData>(
      CacheKeys.project(owner, repo, projectNumber)
    )
    return cached?.data ?? null
  },

  /**
   * Set project in cache
   */
  async set(
    owner: string,
    repo: string,
    projectNumber: number,
    data: ProjectData,
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.project(owner, repo, projectNumber), data, options)
  },

  /**
   * Get projects list from cache
   */
  async getList(
    owner: string,
    repo: string
  ): Promise<ProjectData[] | null> {
    const cached = await get<ProjectData[]>(
      CacheKeys.projectsList(owner, repo)
    )
    return cached?.data ?? null
  },

  /**
   * Set projects list in cache
   */
  async setList(
    owner: string,
    repo: string,
    data: ProjectData[],
    options?: CacheOptions
  ): Promise<boolean> {
    return set(CacheKeys.projectsList(owner, repo), data, options)
  },

  /**
   * Invalidate project cache
   */
  async invalidate(
    owner: string,
    repo: string,
    projectNumber: number
  ): Promise<boolean> {
    return delete_(CacheKeys.project(owner, repo, projectNumber))
  },

  /**
   * Invalidate projects list cache
   */
  async invalidateList(owner: string, repo: string): Promise<boolean> {
    return delete_(CacheKeys.projectsList(owner, repo))
  },
}

// ============================================================================
// Cache Statistics
// ============================================================================

/**
 * Cache statistics for monitoring
 */
export interface CacheStats {
  hits: number
  misses: number
  sets: number
  deletes: number
  errors: number
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  errors: 0,
}

/**
 * Get cache statistics
 */
export function getStats(): CacheStats {
  return { ...stats }
}

/**
 * Reset cache statistics
 */
export function resetStats(): void {
  stats.hits = 0
  stats.misses = 0
  stats.sets = 0
  stats.deletes = 0
  stats.errors = 0
}

/**
 * Update statistics (internal)
 */
function updateStat(stat: keyof CacheStats): void {
  stats[stat]++
}
