/**
 * Request Coalescing & Cache Coherence
 *
 * Provides:
 * - Request coalescing to prevent thundering herd
 * - Cache coherence with version tags
 * - Event ID extraction from webhooks
 * - Out-of-order update detection
 * - Stale data rejection
 * - Cache invalidation strategies
 */

import {
  getDatabase,
  coalescingGet,
  coalescingSet,
  coalescingIncrement,
  coalescingDelete,
  coalescingGetAll,
  type CoalescingRow,
} from './db'

import {
  get,
  set,
  delete_,
  isStale,
  getVersion,
  incrementVersion,
  type CachedData,
  type CacheOptions,
} from './cache'

// ============================================================================
// Types
// ============================================================================

/**
 * Pending request in the coalescing queue
 */
interface PendingRequest<T> {
  /** Promise that resolves when request completes */
  promise: Promise<T>
  /** Timestamp when request was initiated */
  timestamp: number
  /** Number of consumers waiting for this request */
  consumers: number
}

/**
 * Coalescing queue for in-flight requests
 *
 * Now uses SQLite for persistence across restarts
 */
const localCoalescingQueue = new Map<string, PendingRequest<unknown>>()

/**
 * Coalescing options
 */
export interface CoalescingOptions {
  /** Maximum time to wait for coalesced request (default: 30s) */
  timeout?: number
  /** Event ID for cache coherence */
  eventId?: string
  /** Cache TTL (default: 5 minutes) */
  ttl?: number
}

/**
 * Cache invalidation strategy
 */
export type InvalidationStrategy =
  | 'immediate' // Invalidate immediately
  | 'delayed' // Delay invalidation (for batch updates)
  | 'versioned' // Use version tags
  | 'event-based' // Use event IDs for ordering

/**
 * Invalidation strategy configuration
 */
export interface InvalidationConfig {
  /** Strategy to use */
  strategy: InvalidationStrategy
  /** Delay in ms (for 'delayed' strategy) */
  delay?: number
  /** Event ID (for 'event-based' strategy) */
  eventId?: string
}

/**
 * Webhook event data
 */
export interface WebhookEvent {
  /** Event type (e.g., 'issues', 'pull_request') */
  action: string
  /** GitHub delivery ID (monotonically increasing) */
  deliveryId: string
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Associated issue/PR number (if applicable) */
  number?: number
  /** Timestamp when event occurred */
  timestamp: number
}

/**
 * Cache invalidation plan
 */
export interface InvalidationPlan {
  /** Keys to invalidate */
  keys: string[]
  /** Strategy to use */
  strategy: InvalidationStrategy
  /** Event ID for ordering */
  eventId?: string
  /** Delay before execution (ms) */
  delay?: number
}

// ============================================================================
// Request Coalescing
// ============================================================================

/**
 * Initialize coalescing queue from persistent storage
 *
 * Loads any pending requests from SQLite into memory.
 */
function initializeCoalescingQueue(): void {
  try {
    const allRows = coalescingGetAll()

    for (const row of allRows) {
      // Only load recent entries (within last 5 minutes)
      const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300
      if (row.created_at > fiveMinutesAgo) {
        // Create a placeholder pending request
        // The actual request will be re-created when needed
        localCoalescingQueue.set(row.request_key, {
          promise: Promise.reject(new Error('Stale coalescing entry')),
          timestamp: row.created_at * 1000,
          consumers: row.consumers,
        })
      }
    }

    console.debug(`[Coalescing] Loaded ${allRows.length} entries from persistent queue`)
  } catch (error) {
    console.error('[Coalescing] Error initializing queue:', error)
  }
}

/**
 * Coalesce concurrent identical requests
 *
 * When multiple requests for the same key are made simultaneously,
 * only one actual request is made and all consumers share the result.
 *
 * @param key - Cache key
 * @param fetchFn - Function to fetch data if not cached
 * @param options - Coalescing options
 * @returns Fetched or cached data
 *
 * @example
 * ```ts
 * const data = await coalesce('repo:owner:name', async () => {
 *   return await fetchRepository()
 * }, { ttl: 600 })
 * ```
 */
export async function coalesce<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CoalescingOptions = {}
): Promise<T> {
  const timeout = options.timeout ?? 30000 // 30 seconds default
  const startTime = Date.now()

  // Initialize queue if needed
  if (localCoalescingQueue.size === 0) {
    initializeCoalescingQueue()
  }

  // Check if there's already a pending request for this key (in-memory)
  const pending = localCoalescingQueue.get(key) as PendingRequest<T> | undefined

  if (pending) {
    // Check if the pending request is still valid
    const thirtySecondsAgo = Date.now() - 30000
    if (pending.timestamp > thirtySecondsAgo) {
      // Join the existing request
      pending.consumers++
      console.debug(`[Coalescing] Joining pending request for "${key}" (${pending.consumers} consumers)`)

      try {
        return await pending.promise
      } catch (error) {
        // If the shared request fails, all consumers get the error
        throw error
      }
    } else {
      // Stale entry, remove it
      localCoalescingQueue.delete(key)
      coalescingDelete(key)
    }
  }

  // Check persistent queue
  const persistentRow = coalescingGet(key)
  if (persistentRow) {
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300
    if (persistentRow.created_at > fiveMinutesAgo) {
      // There's a pending request in the persistent queue
      // Wait a bit and retry to allow coalescing
      console.debug(`[Coalescing] Found pending request in persistent queue for "${key}"`)
      await new Promise(resolve => setTimeout(resolve, 100))
      return coalesce(key, fetchFn, options)
    }
  }

  // No pending request, create a new one
  console.debug(`[Coalescing] Initiating new request for "${key}"`)

  const promise = (async () => {
    try {
      // Check cache first
      const cached = await get<T>(key)

      if (cached) {
        // Check if cache is stale based on event ID
        if (options.eventId && isStale(cached, options.eventId)) {
          console.debug(`[Coalescing] Cache stale for "${key}", fetching fresh data`)
        } else {
          console.debug(`[Coalescing] Cache hit for "${key}"`)
          return cached.data
        }
      } else {
        console.debug(`[Coalescing] Cache miss for "${key}"`)
      }

      // Fetch fresh data
      const data = await fetchFn()

      // Cache the result
      const cacheOptions: CacheOptions = {
        ttl: options.ttl,
        eventId: options.eventId,
      }

      // If we had cached data, increment version for coherence
      if (cached) {
        cacheOptions.version = cached.version + 1
      }

      await set(key, data, cacheOptions)

      return data
    } finally {
      // Clean up the queue entry
      const pending = localCoalescingQueue.get(key)
      if (pending) {
        // Keep the entry in queue briefly to allow very rapid subsequent requests
        // to still coalesce, but remove it after a short delay
        setTimeout(() => {
          const entry = localCoalescingQueue.get(key)
          if (entry && entry.timestamp === pending.timestamp) {
            localCoalescingQueue.delete(key)
            coalescingDelete(key)
          }
        }, 100) // 100ms grace period
      }
    }
  })()

  // Add to local queue
  const requestEntry: PendingRequest<T> = {
    promise,
    timestamp: startTime,
    consumers: 1,
  }

  localCoalescingQueue.set(key, requestEntry as PendingRequest<unknown>)

  // Add to persistent queue
  coalescingSet(key, 1)

  // Add timeout to prevent stuck requests
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request coalescing timeout for "${key}" after ${timeout}ms`))
    }, timeout)
  })

  // Race between the actual promise and timeout
  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    // Clean up on completion or error
    const elapsed = Date.now() - startTime
    console.debug(`[Coalescing] Request for "${key}" completed in ${elapsed}ms`)
  }
}

/**
 * Get coalescing queue statistics
 */
export function getCoalescingStats(): {
  queueSize: number
  pendingRequests: Array<{ key: string; consumers: number; age: number }>
} {
  const pendingRequests = Array.from(localCoalescingQueue.entries()).map(
    ([key, request]) => ({
      key,
      consumers: request.consumers,
      age: Date.now() - request.timestamp,
    })
  )

  return {
    queueSize: localCoalescingQueue.size,
    pendingRequests,
  }
}

/**
 * Clear the coalescing queue (use with caution)
 *
 * This will cause all pending requests to be removed from the queue,
 * but will not cancel the actual fetch operations.
 */
export function clearCoalescingQueue(): void {
  localCoalescingQueue.clear()
  coalescingDelete('*')
}

// ============================================================================
// Cache Coherence
// ============================================================================

/**
 * Extract event ID from a webhook payload
 *
 * @param webhook - Webhook payload
 * @returns Event ID or undefined
 *
 * @example
 * ```ts
 * const eventId = extractEventId({
 *   'X-GitHub-Delivery': '12345-67890',
 *   action: 'opened'
 * })
 * // Returns: '12345-67890'
 * ```
 */
export function extractEventId(webhook: {
  'X-GitHub-Delivery'?: string
  delivery_id?: string
  deliveryId?: string
}): string | undefined {
  return (
    webhook['X-GitHub-Delivery'] ||
    webhook.delivery_id ||
    webhook.deliveryId
  )
}

/**
 * Parse webhook event from payload
 *
 * @param payload - Webhook payload
 * @returns Parsed webhook event or null
 *
 * @example
 * ```ts
 * const event = parseWebhookEvent({
 *   'X-GitHub-Event': 'issues',
 *   'X-GitHub-Delivery': '12345-67890',
 *   repository: { owner: { login: 'owner' }, name: 'repo' },
 *   action: 'opened',
 *   issue: { number: 123 }
 * })
 * ```
 */
export function parseWebhookEvent(payload: {
  'X-GitHub-Event'?: string
  event?: string
  'X-GitHub-Delivery'?: string
  delivery_id?: string
  deliveryId?: string
  repository?: {
    owner?: { login?: string }
    name?: string
  }
  organization?: {
    login?: string
  }
  action?: string
  issue?: { number?: number }
  pull_request?: { number?: number }
  number?: number
}): WebhookEvent | null {
  const eventType = payload['X-GitHub-Event'] || payload.event
  const deliveryId = extractEventId(payload)

  if (!eventType || !deliveryId) {
    return null
  }

  const owner =
    payload.repository?.owner?.login || payload.organization?.login || ''
  const repo = payload.repository?.name || ''
  const number =
    payload.issue?.number ||
    payload.pull_request?.number ||
    payload.number

  return {
    action: payload.action || eventType,
    deliveryId,
    owner,
    repo,
    number,
    timestamp: Date.now(),
  }
}

/**
 * Detect out-of-order updates
 *
 * @param cached - Existing cached data
 * @param newEventId - New event ID
 * @returns true if update is out of order (should be rejected)
 *
 * @example
 * ```ts
 * if (isOutOfOrder(cachedData, newEventId)) {
 *   console.warn('Rejecting out-of-order update')
 *   return
 * }
 * ```
 */
export function isOutOfOrder<T>(
  cached: CachedData<T>,
  newEventId: string
): boolean {
  if (!cached.eventId || !newEventId) {
    return false
  }

  const cachedId = parseInt(cached.eventId.split('-')[0], 10)
  const newId = parseInt(newEventId.split('-')[0], 10)

  if (isNaN(cachedId) || isNaN(newId)) {
    return false
  }

  return newId <= cachedId
}

/**
 * Check if cached data should be rejected due to staleness
 *
 * @param cached - Cached data
 * @param currentEventId - Current event ID from webhook
 * @returns true if data should be rejected
 *
 * @example
 * ```ts
 * const cached = await cache.get('issue:123')
 * if (shouldRejectStale(cached, webhookEventId)) {
 *   // Reject cached data
 * }
 * ```
 */
export function shouldRejectStale<T>(
  cached: CachedData<T> | null,
  currentEventId: string
): boolean {
  if (!cached) {
    return false // No cached data, not stale
  }

  return isOutOfOrder(cached, currentEventId)
}

/**
 * Update cache with coherence checking
 *
 * @param key - Cache key
 * @param data - New data to cache
 * @param eventId - Event ID for ordering
 * @param options - Cache options
 * @returns true if cache was updated, false if rejected
 *
 * @example
 * ```ts
 * const updated = await updateWithCoherence(
 *   'issue:123',
 *   issueData,
 *   webhookEventId,
 *   { ttl: 600 }
 * )
 * if (!updated) {
 *   console.warn('Update rejected due to staleness')
 * }
 * ```
 */
export async function updateWithCoherence<T>(
  key: string,
  data: T,
  eventId: string,
  options: CacheOptions = {}
): Promise<boolean> {
  // Get existing cached data
  const cached = await get<T>(key)

  // Check if update would be out of order
  if (cached && isOutOfOrder(cached, eventId)) {
    console.warn(
      `[Coherence] Rejecting stale update for "${key}" ` +
        `(cached event: ${cached.eventId}, new event: ${eventId})`
    )
    return false
  }

  // Increment version for coherence tracking
  const newVersion = cached ? cached.version + 1 : 1

  // Update cache
  await set(key, data, {
    ...options,
    eventId,
    version: newVersion,
  })

  console.debug(
    `[Coherence] Updated cache for "${key}" ` +
      `(version: ${newVersion}, event: ${eventId})`
  )

  return true
}

// ============================================================================
// Cache Invalidation Strategies
// ============================================================================

/**
 * Build invalidation plan from webhook event
 *
 * @param event - Webhook event
 * @returns Invalidation plan
 *
 * @example
 * ```ts
 * const event = parseWebhookEvent(webhookPayload)
 * if (event) {
 *   const plan = buildInvalidationPlan(event)
 *   await executeInvalidation(plan)
 * }
 * ```
 */
export function buildInvalidationPlan(event: WebhookEvent): InvalidationPlan {
  const keys: string[] = []

  // Build base key prefix
  const basePrefix = `${event.owner}/${event.repo}`

  switch (event.action) {
    case 'opened':
    case 'edited':
    case 'closed':
    case 'reopened':
      // Issue/PR events
      if (event.number) {
        keys.push(`issue:${basePrefix}:${event.number}`)
        keys.push(`issues:${basePrefix}:open`)
        keys.push(`issues:${basePrefix}:all`)
      }
      break

    case 'created':
    case 'updated':
    case 'deleted':
      // Comment events
      if (event.number) {
        keys.push(`issue:${basePrefix}:${event.number}`)
      }
      break

    case 'synchronize':
    case 'opened':
    case 'reopened':
      // PR events
      if (event.number) {
        keys.push(`pr:${basePrefix}:${event.number}`)
        keys.push(`prs:${basePrefix}:open`)
        keys.push(`prs:${basePrefix}:all`)
      }
      break

    case 'completed':
    case 'in_progress':
    case 'queued':
      // Workflow run events
      keys.push(`workflows:${basePrefix}`)
      break

    case 'created':
    case 'edited':
    case 'deleted':
    case 'closed':
      // Project events
      if (event.number) {
        keys.push(`project:${basePrefix}:${event.number}`)
      }
      keys.push(`projects:${basePrefix}`)
      break

    default:
      console.warn(`[Invalidation] Unknown event action: ${event.action}`)
  }

  // Always invalidate repo-level cache on any event
  keys.push(`repo:${basePrefix}`)

  return {
    keys,
    strategy: 'event-based',
    eventId: event.deliveryId,
  }
}

/**
 * Execute invalidation plan
 *
 * @param plan - Invalidation plan to execute
 * @param strategy - Override strategy (optional)
 *
 * @example
 * ```ts
 * const plan = buildInvalidationPlan(event)
 * await executeInvalidation(plan, 'immediate')
 * ```
 */
export async function executeInvalidation(
  plan: InvalidationPlan,
  strategy?: InvalidationStrategy
): Promise<void> {
  const effectiveStrategy = strategy ?? plan.strategy

  switch (effectiveStrategy) {
    case 'immediate':
      await invalidateImmediate(plan.keys)
      break

    case 'delayed':
      await invalidateDelayed(plan.keys, plan.delay ?? 1000)
      break

    case 'versioned':
      await invalidateVersioned(plan.keys)
      break

    case 'event-based':
      await invalidateEventBased(plan.keys, plan.eventId)
      break

    default:
      console.warn(`[Invalidation] Unknown strategy: ${effectiveStrategy}`)
  }
}

/**
 * Immediate invalidation
 */
async function invalidateImmediate(keys: string[]): Promise<void> {
  console.debug(`[Invalidation] Immediate invalidation of ${keys.length} keys`)

  await Promise.all(
    keys.map(async (key) => {
      try {
        await delete_(key)
      } catch (error) {
        console.error(`[Invalidation] Error invalidating "${key}":`, error)
      }
    })
  )
}

/**
 * Delayed invalidation (for batch updates)
 */
async function invalidateDelayed(
  keys: string[],
  delay: number
): Promise<void> {
  console.debug(
    `[Invalidation] Delayed invalidation of ${keys.length} keys (${delay}ms)`
  )

  setTimeout(async () => {
    await invalidateImmediate(keys)
  }, delay)
}

/**
 * Versioned invalidation (increment version tags)
 */
async function invalidateVersioned(keys: string[]): Promise<void> {
  console.debug(`[Invalidation] Versioned invalidation of ${keys.length} keys`)

  await Promise.all(
    keys.map(async (key) => {
      try {
        const newVersion = await incrementVersion(key)
        console.debug(`[Invalidation] Incremented version for "${key}" to ${newVersion}`)
      } catch (error) {
        console.error(`[Invalidation] Error incrementing version for "${key}":`, error)
      }
    })
  )
}

/**
 * Event-based invalidation (with ordering check)
 */
async function invalidateEventBased(
  keys: string[],
  eventId?: string
): Promise<void> {
  if (!eventId) {
    console.warn('[Invalidation] No event ID provided, falling back to immediate')
    return invalidateImmediate(keys)
  }

  console.debug(
    `[Invalidation] Event-based invalidation of ${keys.length} keys (event: ${eventId})`
  )

  await Promise.all(
    keys.map(async (key) => {
      try {
        const cached = await get(key)

        if (cached && isOutOfOrder(cached, eventId)) {
          console.debug(
            `[Invalidation] Skipping stale invalidation for "${key}" ` +
              `(cached: ${cached.eventId}, new: ${eventId})`
          )
          return
        }

        await delete_(key)
      } catch (error) {
        console.error(`[Invalidation] Error invalidating "${key}":`, error)
      }
    })
  )
}

/**
 * Invalidate cache based on webhook event
 *
 * This is a convenience function that combines parsing and invalidation.
 *
 * @param webhookPayload - Webhook payload from GitHub
 * @param strategy - Invalidation strategy to use
 *
 * @example
 * ```ts
 * // API route handler
 * export async function POST(request: Request) {
 *   const payload = await request.json()
 *   await invalidateFromWebhook(payload, 'immediate')
 *   return Response.json({ success: true })
 * }
 * ```
 */
export async function invalidateFromWebhook(
  webhookPayload: Record<string, unknown>,
  strategy: InvalidationStrategy = 'immediate'
): Promise<void> {
  const event = parseWebhookEvent(webhookPayload)

  if (!event) {
    console.warn('[Invalidation] Could not parse webhook event')
    return
  }

  const plan = buildInvalidationPlan(event)
  await executeInvalidation(plan, strategy)
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a cache-aware fetch wrapper
 *
 * Wraps a fetch function with caching and coalescing.
 *
 * @param fetchFn - Function to fetch data
 * @param options - Cache and coalescing options
 * @returns Wrapped function with caching
 *
 * @example
 * ```ts
 * const fetchRepository = createCachedFetch(
 *   async (owner: string, repo: string) => {
 *     return await githubAPI.getRepository(owner, repo)
 *   },
 *   { ttl: 600 }
 * )
 *
 * // First call fetches from API
 * const repo1 = await fetchRepository('owner', 'repo')
 *
 * // Second call returns cached data
 * const repo2 = await fetchRepository('owner', 'repo')
 * ```
 */
export function createCachedFetch<T extends (...args: unknown[]) => Promise<unknown>>(
  fetchFn: T,
  options: {
    /** Function to generate cache key from arguments */
    keyFn?: (...args: Parameters<T>) => string
    /** Cache TTL */
    ttl?: number
    /** Enable coalescing */
    coalesce?: boolean
  } = {}
): T {
  return (async (...args: Parameters<T>) => {
    const key = options.keyFn
      ? options.keyFn(...args)
      : JSON.stringify(args)

    if (options.coalesce !== false) {
      return coalesce(key, () => fetchFn(...args) as Promise<unknown>, {
        ttl: options.ttl,
      })
    }

    const cached = await get(key)
    if (cached) {
      return cached.data
    }

    const data = await fetchFn(...args)
    await set(key, data, { ttl: options.ttl })
    return data
  }) as T
}

/**
 * Batch cache operations
 *
 * Execute multiple cache operations in a batch for efficiency.
 *
 * @param operations - Array of operations to execute
 * @returns Array of results
 *
 * @example
 * ```ts
 * const results = await batch([
 *   { type: 'get', key: 'repo:owner:repo' },
 *   { type: 'set', key: 'issue:123', data: issueData },
 *   { type: 'delete', key: 'pr:456' }
 * ])
 * ```
 */
export async function batch<T>(
  operations: Array<
    | { type: 'get'; key: string }
    | { type: 'set'; key: string; data: T; options?: CacheOptions }
    | { type: 'delete'; key: string }
  >
): Promise<Array<unknown>> {
  const results = await Promise.all(
    operations.map(async (op) => {
      switch (op.type) {
        case 'get':
          return await get(op.key)
        case 'set':
          return await set(op.key, op.data, op.options)
        case 'delete':
          return await delete_(op.key)
        default:
          throw new Error(`Unknown operation type: ${(op as { type: string }).type}`)
      }
    })
  )

  return results
}

/**
 * Warm cache with data
 *
 * Pre-populate cache with frequently accessed data.
 *
 * @param entries - Array of cache entries to warm
 *
 * @example
 * ```ts
 * await warmCache([
 *   { key: 'repo:owner:repo', data: repositoryData, ttl: 600 },
 *   { key: 'issues:owner:repo:open', data: issuesData, ttl: 300 }
 * ])
 * ```
 */
export async function warmCache<T>(
  entries: Array<{ key: string; data: T; options?: CacheOptions }>
): Promise<void> {
  await Promise.all(
    entries.map(async (entry) => {
      await set(entry.key, entry.data, entry.options)
    })
  )
}
