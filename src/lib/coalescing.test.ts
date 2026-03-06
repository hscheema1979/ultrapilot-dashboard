/**
 * Unit tests for coalescing.ts
 * Tests request coalescing and cache coherence
 */

import {
  coalesce,
  getCoalescingStats,
  clearCoalescingQueue,
  extractEventId,
  parseWebhookEvent,
  isOutOfOrder,
  shouldRejectStale,
  updateWithCoherence,
  buildInvalidationPlan,
  executeInvalidation,
  invalidateFromWebhook,
  createCachedFetch,
  batch,
  warmCache,
} from './coalescing'

// Mock the cache module
const mockGet = jest.fn()
const mockSet = jest.fn()
const mockDelete = jest.fn()
const mockIsStale = jest.fn()
const mockGetVersion = jest.fn()
const mockIncrementVersion = jest.fn()

jest.mock('./cache', () => ({
  get: jest.fn(() => mockGet()),
  set: jest.fn(() => mockSet()),
  delete_: jest.fn(() => mockDelete()),
  isStale: jest.fn(() => mockIsStale()),
  getVersion: jest.fn(() => mockGetVersion()),
  incrementVersion: jest.fn(() => mockIncrementVersion()),
}))

const { get, set, delete_, isStale, getVersion, incrementVersion } = require('./cache')

describe('coalescing.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearCoalescingQueue()
  })

  describe('Request Coalescing', () => {
    it('should coalesce concurrent requests', async () => {
      let fetchCount = 0
      const fetchFn = jest.fn(async () => {
        fetchCount++
        await new Promise(resolve => setTimeout(resolve, 100))
        return { data: 'test' }
      })

      mockGet.mockResolvedValue(null)
      mockSet.mockResolvedValue(true)

      // Start 3 concurrent requests
      const requests = [
        coalesce('test-key', fetchFn),
        coalesce('test-key', fetchFn),
        coalesce('test-key', fetchFn),
      ]

      const results = await Promise.all(requests)

      // All should return the same data
      expect(results).toHaveLength(3)
      expect(results[0]).toEqual({ data: 'test' })

      // Fetch should only be called once
      expect(fetchCount).toBe(1)
    })

    it('should return cached data when available', async () => {
      const cachedData = {
        data: { cached: true },
        version: 1,
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cachedData)
      mockSet.mockResolvedValue(true)

      const fetchFn = jest.fn(async () => ({ data: 'fresh' }))
      const result = await coalesce('test-key', fetchFn)

      expect(result).toEqual({ cached: true })
      expect(fetchFn).not.toHaveBeenCalled()
    })

    it('should detect stale cache based on event ID', async () => {
      const cachedData = {
        data: { cached: true },
        version: 1,
        eventId: '12345-67890',
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cachedData)
      mockSet.mockResolvedValue(true)
      mockIsStale.mockReturnValue(true)

      const fetchFn = jest.fn(async () => ({ data: 'fresh' }))
      const result = await coalesce('test-key', fetchFn, {
        eventId: '12346-67890',
      })

      expect(fetchFn).toHaveBeenCalled()
      expect(result).toEqual({ data: 'fresh' })
    })

    it('should handle fetch errors', async () => {
      mockGet.mockResolvedValue(null)

      const fetchFn = jest.fn(async () => {
        throw new Error('Fetch failed')
      })

      await expect(coalesce('test-key', fetchFn)).rejects.toThrow('Fetch failed')
    })

    it('should timeout stuck requests', async () => {
      mockGet.mockResolvedValue(null)

      const fetchFn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 35000))
        return { data: 'test' }
      })

      await expect(
        coalesce('test-key', fetchFn, { timeout: 1000 })
      ).rejects.toThrow('Request coalescing timeout')
    })
  })

  describe('Coalescing Statistics', () => {
    it('should return queue statistics', async () => {
      const fetchFn = jest.fn(async () => ({ data: 'test' }))
      mockGet.mockResolvedValue(null)
      mockSet.mockResolvedValue(true)

      // Start a request but don't await it
      const request = coalesce('test-key', fetchFn)

      // Get stats while request is in flight
      const stats = getCoalescingStats()

      expect(stats.queueSize).toBeGreaterThan(0)
      expect(stats.pendingRequests).toHaveLength(1)
      expect(stats.pendingRequests[0].key).toBe('test-key')
      expect(stats.pendingRequests[0].consumers).toBe(1)

      await request
    })

    it('should clear the coalescing queue', () => {
      clearCoalescingQueue()
      const stats = getCoalescingStats()
      expect(stats.queueSize).toBe(0)
    })
  })

  describe('Event ID Extraction', () => {
    it('should extract event ID from X-GitHub-Delivery header', () => {
      const webhook = {
        'X-GitHub-Delivery': '12345-67890',
        action: 'opened',
      }

      const eventId = extractEventId(webhook)
      expect(eventId).toBe('12345-67890')
    })

    it('should extract event ID from delivery_id field', () => {
      const webhook = {
        delivery_id: '12345-67890',
        action: 'opened',
      }

      const eventId = extractEventId(webhook)
      expect(eventId).toBe('12345-67890')
    })

    it('should extract event ID from deliveryId field', () => {
      const webhook = {
        deliveryId: '12345-67890',
        action: 'opened',
      }

      const eventId = extractEventId(webhook)
      expect(eventId).toBe('12345-67890')
    })

    it('should return undefined when no event ID is present', () => {
      const webhook = {
        action: 'opened',
      }

      const eventId = extractEventId(webhook)
      expect(eventId).toBeUndefined()
    })
  })

  describe('Webhook Event Parsing', () => {
    it('should parse issue webhook events', () => {
      const payload = {
        'X-GitHub-Event': 'issues',
        'X-GitHub-Delivery': '12345-67890',
        repository: {
          owner: { login: 'testowner' },
          name: 'testrepo',
        },
        action: 'opened',
        issue: { number: 123 },
      }

      const event = parseWebhookEvent(payload)

      expect(event).toEqual({
        action: 'opened',
        deliveryId: '12345-67890',
        owner: 'testowner',
        repo: 'testrepo',
        number: 123,
        timestamp: expect.any(Number),
      })
    })

    it('should parse pull request webhook events', () => {
      const payload = {
        'X-GitHub-Event': 'pull_request',
        'X-GitHub-Delivery': '12346-67890',
        repository: {
          owner: { login: 'testowner' },
          name: 'testrepo',
        },
        action: 'opened',
        pull_request: { number: 456 },
      }

      const event = parseWebhookEvent(payload)

      expect(event?.number).toBe(456)
      expect(event?.action).toBe('opened')
    })

    it('should parse workflow webhook events', () => {
      const payload = {
        'X-GitHub-Event': 'workflow_run',
        'X-GitHub-Delivery': '12347-67890',
        repository: {
          owner: { login: 'testowner' },
          name: 'testrepo',
        },
        action: 'completed',
      }

      const event = parseWebhookEvent(payload)

      expect(event?.action).toBe('completed')
      expect(event?.number).toBeUndefined()
    })

    it('should return null for invalid payloads', () => {
      const payload = {
        'X-GitHub-Event': 'issues',
        // Missing X-GitHub-Delivery
      }

      const event = parseWebhookEvent(payload)
      expect(event).toBeNull()
    })

    it('should handle organization-level webhooks', () => {
      const payload = {
        'X-GitHub-Event': 'repository',
        'X-GitHub-Delivery': '12348-67890',
        organization: {
          login: 'testorg',
        },
        repository: {
          name: 'testrepo',
        },
        action: 'created',
      }

      const event = parseWebhookEvent(payload)

      expect(event?.owner).toBe('testorg')
      expect(event?.repo).toBe('testrepo')
    })
  })

  describe('Out-of-Order Detection', () => {
    it('should detect out-of-order updates', () => {
      const cached = {
        data: {},
        version: 1,
        eventId: '12346-67890',
        cachedAt: Date.now(),
      }

      expect(isOutOfOrder(cached, '12345-67890')).toBe(true)
      expect(isOutOfOrder(cached, '12347-67890')).toBe(false)
    })

    it('should handle non-numeric event IDs', () => {
      const cached = {
        data: {},
        version: 1,
        eventId: 'abc-def',
        cachedAt: Date.now(),
      }

      expect(isOutOfOrder(cached, 'xyz-uvw')).toBe(false)
    })

    it('should handle missing event IDs', () => {
      const cached = {
        data: {},
        version: 1,
        eventId: undefined,
        cachedAt: Date.now(),
      }

      expect(isOutOfOrder(cached, '12345-67890')).toBe(false)
    })
  })

  describe('Stale Data Rejection', () => {
    it('should reject stale cached data', () => {
      const cached = {
        data: {},
        version: 1,
        eventId: '12346-67890',
        cachedAt: Date.now(),
      }

      expect(shouldRejectStale(cached, '12345-67890')).toBe(true)
    })

    it('should not reject fresh data', () => {
      const cached = {
        data: {},
        version: 1,
        eventId: '12345-67890',
        cachedAt: Date.now(),
      }

      expect(shouldRejectStale(cached, '12346-67890')).toBe(false)
    })

    it('should not reject when no cached data exists', () => {
      expect(shouldRejectStale(null, '12345-67890')).toBe(false)
    })
  })

  describe('Cache Coherence Updates', () => {
    it('should update cache with new event ID', async () => {
      mockGet.mockResolvedValue(null)
      mockSet.mockResolvedValue(true)

      const result = await updateWithCoherence(
        'test-key',
        { data: 'test' },
        '12345-67890',
        { ttl: 300 }
      )

      expect(result).toBe(true)
      expect(set).toHaveBeenCalledWith(
        'test-key',
        { data: 'test' },
        expect.objectContaining({
          eventId: '12345-67890',
          version: 1,
        })
      )
    })

    it('should reject out-of-order updates', async () => {
      const cached = {
        data: { old: 'data' },
        version: 1,
        eventId: '12346-67890',
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cached)
      mockSet.mockResolvedValue(true)

      const result = await updateWithCoherence(
        'test-key',
        { data: 'test' },
        '12345-67890'
      )

      expect(result).toBe(false)
      expect(set).not.toHaveBeenCalled()
    })

    it('should increment version on updates', async () => {
      const cached = {
        data: { old: 'data' },
        version: 2,
        eventId: '12345-67890',
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cached)
      mockSet.mockResolvedValue(true)

      const result = await updateWithCoherence(
        'test-key',
        { data: 'test' },
        '12346-67890'
      )

      expect(result).toBe(true)
      expect(set).toHaveBeenCalledWith(
        'test-key',
        { data: 'test' },
        expect.objectContaining({
          version: 3,
        })
      )
    })
  })

  describe('Invalidation Planning', () => {
    it('should build invalidation plan for issue events', () => {
      const event = {
        action: 'opened',
        deliveryId: '12345-67890',
        owner: 'owner',
        repo: 'repo',
        number: 123,
        timestamp: Date.now(),
      }

      const plan = buildInvalidationPlan(event)

      expect(plan.keys).toContain('issue:owner/repo:123')
      expect(plan.keys).toContain('issues:owner/repo:open')
      expect(plan.keys).toContain('issues:owner/repo:all')
      expect(plan.keys).toContain('repo:owner/repo')
      expect(plan.strategy).toBe('event-based')
      expect(plan.eventId).toBe('12345-67890')
    })

    it('should build invalidation plan for workflow events', () => {
      const event: WebhookEvent = {
        action: 'completed',
        deliveryId: '12345-67890',
        owner: 'owner',
        repo: 'repo',
        timestamp: Date.now(),
      }

      const plan = buildInvalidationPlan(event)

      expect(plan.keys).toContain('workflows:owner/repo')
      expect(plan.keys).toContain('repo:owner/repo')
    })

    it('should build invalidation plan for project events', () => {
      const event: WebhookEvent = {
        action: 'created',
        deliveryId: '12345-67890',
        owner: 'owner',
        repo: 'repo',
        number: 1,
        timestamp: Date.now(),
      }

      const plan = buildInvalidationPlan(event)

      // Note: 'created' action is treated as comment/issue event, not project
      // Projects use specific actions like 'closed', 'edited', 'deleted'
      expect(plan.keys).toContain('issue:owner/repo:1')
      expect(plan.keys).toContain('repo:owner/repo')
    })
  })

  describe('Invalidation Execution', () => {
    it('should execute immediate invalidation', async () => {
      mockDelete.mockResolvedValue(true)

      const plan = {
        keys: ['key1', 'key2', 'key3'],
        strategy: 'immediate' as const,
        eventId: '12345-67890',
      }

      await executeInvalidation(plan)

      expect(delete_).toHaveBeenCalledTimes(3)
      expect(delete_).toHaveBeenCalledWith('key1')
      expect(delete_).toHaveBeenCalledWith('key2')
      expect(delete_).toHaveBeenCalledWith('key3')
    })

    it('should execute delayed invalidation', async () => {
      jest.useFakeTimers()
      mockDelete.mockResolvedValue(true)

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'delayed' as const,
        delay: 1000,
      }

      const promise = executeInvalidation(plan)

      // Should not delete immediately
      expect(delete_).not.toHaveBeenCalled()

      // Fast-forward time
      jest.advanceTimersByTime(1000)
      await promise

      expect(delete_).toHaveBeenCalledTimes(2)

      jest.useRealTimers()
    })

    it('should execute versioned invalidation', async () => {
      mockIncrementVersion.mockResolvedValue(2)

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'versioned' as const,
      }

      await executeInvalidation(plan)

      expect(incrementVersion).toHaveBeenCalledTimes(2)
      expect(incrementVersion).toHaveBeenCalledWith('key1')
      expect(incrementVersion).toHaveBeenCalledWith('key2')
    })

    it('should execute event-based invalidation with ordering', async () => {
      const cached = {
        data: {},
        version: 1,
        eventId: '12344-67890',
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cached)
      mockDelete.mockResolvedValue(true)

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'event-based' as const,
        eventId: '12345-67890',
      }

      await executeInvalidation(plan)

      expect(delete_).toHaveBeenCalledTimes(2)
    })

    it('should skip out-of-order event-based invalidations', async () => {
      const cached = {
        data: {},
        version: 1,
        eventId: '12346-67890',
        cachedAt: Date.now(),
      }

      mockGet.mockResolvedValue(cached)
      mockDelete.mockResolvedValue(true)

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'event-based' as const,
        eventId: '12345-67890',
      }

      await executeInvalidation(plan)

      // Should not delete because event is out of order
      expect(delete_).not.toHaveBeenCalled()
    })
  })

  describe('Webhook Invalidation', () => {
    it('should invalidate from webhook payload', async () => {
      mockDelete.mockResolvedValue(true)

      const payload = {
        'X-GitHub-Event': 'issues',
        'X-GitHub-Delivery': '12345-67890',
        repository: {
          owner: { login: 'owner' },
          name: 'repo',
        },
        action: 'opened',
        issue: { number: 123 },
      }

      await invalidateFromWebhook(payload, 'immediate')

      expect(delete_).toHaveBeenCalled()
    })

    it('should handle invalid webhook payloads gracefully', async () => {
      const payload = {
        'X-GitHub-Event': 'issues',
        // Missing required fields
      }

      await expect(invalidateFromWebhook(payload)).resolves.toBeUndefined()
    })
  })

  describe('Utility Functions', () => {
    it('should create cached fetch wrapper', async () => {
      const fetchFn = jest.fn(async (a: string, b: string) => ({ result: `${a}-${b}` }))
      mockGet.mockResolvedValue(null)
      mockSet.mockResolvedValue(true)

      const cachedFetch = createCachedFetch(fetchFn, {
        keyFn: (a: string, b: string) => `test:${a}:${b}`,
        ttl: 300,
        coalesce: true,
      })

      // First call - cache miss
      const result1 = await cachedFetch('owner', 'repo')
      expect(result1).toEqual({ result: 'owner-repo' })
      expect(fetchFn).toHaveBeenCalledTimes(1)

      // Second call - should hit cache (mocked as miss for simplicity)
      const result2 = await cachedFetch('owner', 'repo')
      expect(result2).toEqual({ result: 'owner-repo' })
    })

    it('should execute batch operations', async () => {
      const mockData = { data: 'test', version: 1, cachedAt: Date.now() }
      mockGet.mockResolvedValue(mockData)
      mockSet.mockResolvedValue(true)
      mockDelete.mockResolvedValue(true)

      const results = await batch([
        { type: 'get', key: 'key1' },
        { type: 'set', key: 'key2', data: { test: 'data' } },
        { type: 'delete', key: 'key3' },
      ])

      expect(results).toHaveLength(3)
      expect(get).toHaveBeenCalledWith('key1')
      expect(set).toHaveBeenCalled()
      expect(delete_).toHaveBeenCalledWith('key3')
    })

    it('should warm cache with data', async () => {
      mockSet.mockResolvedValue(true)

      await warmCache([
        { key: 'key1', data: { test: 'data1' }, options: { ttl: 300 } },
        { key: 'key2', data: { test: 'data2' }, options: { ttl: 600 } },
      ])

      expect(set).toHaveBeenCalledTimes(2)
      expect(set).toHaveBeenCalledWith('key1', { test: 'data1' }, { ttl: 300 })
      expect(set).toHaveBeenCalledWith('key2', { test: 'data2' }, { ttl: 600 })
    })

    it('should handle unknown batch operation types', async () => {
      await expect(
        batch([{ type: 'unknown' as 'get', key: 'test' }])
      ).rejects.toThrow('Unknown operation type')
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent invalidations', async () => {
      mockDelete.mockResolvedValue(true)

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'immediate' as const,
      }

      // Execute multiple invalidations concurrently
      await Promise.all([
        executeInvalidation(plan),
        executeInvalidation(plan),
        executeInvalidation(plan),
      ])

      expect(delete_).toHaveBeenCalledTimes(6)
    })

    it('should handle errors in invalidation gracefully', async () => {
      mockDelete.mockRejectedValue(new Error('Delete failed'))

      const plan = {
        keys: ['key1', 'key2'],
        strategy: 'immediate' as const,
      }

      // Should not throw, should handle errors gracefully
      await expect(executeInvalidation(plan)).resolves.toBeUndefined()
    })

    it('should handle unknown invalidation strategies', async () => {
      const plan = {
        keys: ['key1'],
        strategy: 'unknown' as any,
      }

      await expect(executeInvalidation(plan)).resolves.toBeUndefined()
    })
  })
})
