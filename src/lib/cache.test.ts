/**
 * Unit tests for cache.ts
 * Tests distributed cache layer with Vercel KV
 */

import {
  get,
  set,
  delete_,
  isStale,
  getVersion,
  incrementVersion,
  clear,
  CacheKeys,
  RepositoryCache,
  IssueCache,
  WorkflowCache,
  ProjectCache,
  getStats,
  resetStats,
} from './cache'

// Mock Vercel KV
jest.mock('@vercel/kv', () => ({
  KV: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    keys: jest.fn(),
  })),
}))

describe('cache.ts', () => {
  beforeEach(() => {
    // Reset module state to get fresh KV client
    jest.resetModules()
    resetStats()
    jest.clearAllMocks()
  })

  describe('Basic Cache Operations', () => {
    it('should set and get data successfully', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(
          JSON.stringify({
            data: { id: 1, name: 'test' },
            version: 1,
            cachedAt: Date.now(),
          })
        ),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      // Re-import to get fresh instance
      const cacheModule = await import('./cache')
      const { set: cacheSet, get: cacheGet } = cacheModule

      const testData = { id: 1, name: 'test' }
      await cacheSet('test-key', testData, { ttl: 300 })

      expect(mockKV.set).toHaveBeenCalledWith(
        'ultrapilot:test-key',
        expect.stringContaining('"id":1'),
        { ex: 300 }
      )

      const result = await cacheGet('test-key')
      expect(result?.data).toEqual(testData)
    })

    it('should return null for non-existent keys', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(0),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { get: cacheGet } = cacheModule

      const result = await cacheGet('non-existent')
      expect(result).toBeNull()
    })

    it('should delete keys successfully', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { delete_: cacheDelete } = cacheModule

      const result = await cacheDelete('test-key')
      expect(result).toBe(true)
      expect(mockKV.delete).toHaveBeenCalledWith('ultrapilot:test-key')
    })

    it('should handle errors gracefully', async () => {
      const mockKV = {
        get: jest.fn().mockRejectedValue(new Error('Connection error')),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { get: cacheGet } = cacheModule

      const result = await cacheGet('test-key')
      expect(result).toBeNull()
    })
  })

  describe('Cache Versioning', () => {
    it('should track version numbers', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(
          JSON.stringify({
            data: { id: 1 },
            version: 3,
            cachedAt: Date.now(),
          })
        ),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { getVersion: cacheGetVersion } = cacheModule

      const version = await cacheGetVersion('test-key')
      expect(version).toBe(3)
    })

    it('should return 0 for non-existent keys', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(0),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { getVersion: cacheGetVersion } = cacheModule

      const version = await cacheGetVersion('non-existent')
      expect(version).toBe(0)
    })

    it('should increment version correctly', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(
          JSON.stringify({
            data: { id: 1 },
            version: 2,
            cachedAt: Date.now(),
          })
        ),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { incrementVersion: cacheIncrementVersion } = cacheModule

      const newVersion = await cacheIncrementVersion('test-key')
      expect(newVersion).toBe(3)
    })
  })

  describe('Event ID and Staleness Detection', () => {
    it('should detect stale data based on event IDs', () => {
      const cached: CachedData<unknown> = {
        data: {},
        version: 1,
        eventId: '12345-67890',
        cachedAt: Date.now(),
      }

      expect(isStale(cached, '12346-67890')).toBe(true)
      expect(isStale(cached, '12344-67890')).toBe(false)
    })

    it('should handle non-numeric event IDs gracefully', () => {
      const cached: CachedData<unknown> = {
        data: {},
        version: 1,
        eventId: 'abc-def',
        cachedAt: Date.now(),
      }

      expect(isStale(cached, 'xyz-uvw')).toBe(false)
    })

    it('should handle missing event IDs', () => {
      const cached: CachedData<unknown> = {
        data: {},
        version: 1,
        eventId: undefined,
        cachedAt: Date.now(),
      }

      expect(isStale(cached, '12345-67890')).toBe(false)
    })
  })

  describe('Cache Key Builders', () => {
    it('should build correct repository keys', () => {
      expect(CacheKeys.repository('owner', 'repo')).toBe('repo:owner:repo')
    })

    it('should build correct issue keys', () => {
      expect(CacheKeys.issue('owner', 'repo', 123)).toBe('issue:owner:repo:123')
    })

    it('should build correct issues list keys', () => {
      expect(CacheKeys.issuesList('owner', 'repo', 'open')).toBe('issues:owner:repo:open')
      expect(CacheKeys.issuesList('owner', 'repo', 'closed')).toBe('issues:owner:repo:closed')
      expect(CacheKeys.issuesList('owner', 'repo')).toBe('issues:owner:repo:open')
    })

    it('should build correct workflow keys', () => {
      expect(CacheKeys.workflowRun('owner', 'repo', 456)).toBe('workflow:owner:repo:456')
      expect(CacheKeys.workflowRuns('owner', 'repo')).toBe('workflows:owner:repo')
    })

    it('should build correct project keys', () => {
      expect(CacheKeys.project('owner', 'repo', 789)).toBe('project:owner:repo:789')
      expect(CacheKeys.projectsList('owner', 'repo')).toBe('projects:owner:repo')
    })
  })

  describe('Repository Cache', () => {
    it('should cache and retrieve repositories', async () => {
      const mockKV = {
        get: jest.fn()
          .mockResolvedValueOnce(null) // First call - miss
          .mockResolvedValueOnce(JSON.stringify({ // Second call - hit
            data: {
              id: 1,
              name: 'test-repo',
              full_name: 'owner/test-repo',
              description: 'Test repository',
              private: false,
              fork: false,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              pushed_at: '2024-01-02T00:00:00Z',
              homepage: null,
              size: 1000,
              stargazers_count: 10,
              watchers_count: 10,
              language: 'TypeScript',
              has_issues: true,
              has_projects: true,
              has_wiki: false,
              has_pages: false,
              has_discussions: false,
              forks_count: 5,
              open_issues_count: 3,
              default_branch: 'main',
            },
            version: 1,
            cachedAt: Date.now(),
          })),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { RepositoryCache: RepoCache } = cacheModule

      const repoData: RepositoryData = {
        id: 1,
        name: 'test-repo',
        full_name: 'owner/test-repo',
        description: 'Test repository',
        private: false,
        fork: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        pushed_at: '2024-01-02T00:00:00Z',
        homepage: null,
        size: 1000,
        stargazers_count: 10,
        watchers_count: 10,
        language: 'TypeScript',
        has_issues: true,
        has_projects: true,
        has_wiki: false,
        has_pages: false,
        has_discussions: false,
        forks_count: 5,
        open_issues_count: 3,
        default_branch: 'main',
      }

      // Cache miss
      const miss = await RepoCache.get('owner', 'test-repo')
      expect(miss).toBeNull()

      // Set data
      await RepoCache.set('owner', 'test-repo', repoData)
      expect(mockKV.set).toHaveBeenCalled()

      // Cache hit
      const hit = await RepoCache.get('owner', 'test-repo')
      expect(hit).toEqual(repoData)
    })

    it('should invalidate repository cache', async () => {
      const mockKV = {
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { RepositoryCache: RepoCache } = cacheModule

      const result = await RepoCache.invalidate('owner', 'test-repo')
      expect(result).toBe(true)
      expect(mockKV.delete).toHaveBeenCalledWith('ultrapilot:repo:owner:test-repo')
    })
  })

  describe('Issue Cache', () => {
    it('should cache and retrieve issues', async () => {
      const mockKV = {
        get: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(JSON.stringify({
            data: {
              id: 1,
              node_id: 'node1',
              url: 'https://api.github.com/repos/owner/repo/issues/1',
              number: 1,
              state: 'open',
              title: 'Test Issue',
              body: 'Test body',
              user: {
                login: 'user',
                id: 1,
                node_id: 'usernode',
                avatar_url: 'https://example.com/avatar.png',
                gravatar_id: '',
                url: 'https://api.github.com/users/user',
                html_url: 'https://github.com/user',
                type: 'User',
                site_admin: false,
              },
              labels: [],
              assignee: null,
              assignees: [],
              milestone: null,
              locked: false,
              comments: 0,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              closed_at: null,
              author_association: 'OWNER',
              repository_url: '',
              labels_url: '',
              comments_url: '',
              events_url: '',
              html_url: '',
            },
            version: 1,
            cachedAt: Date.now(),
          })),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { IssueCache: IC } = cacheModule

      const issueData: IssueData = {
        id: 1,
        node_id: 'node1',
        url: 'https://api.github.com/repos/owner/repo/issues/1',
        number: 1,
        state: 'open',
        title: 'Test Issue',
        body: 'Test body',
        user: {
          login: 'user',
          id: 1,
          node_id: 'usernode',
          avatar_url: 'https://example.com/avatar.png',
          gravatar_id: '',
          url: 'https://api.github.com/users/user',
          html_url: 'https://github.com/user',
          type: 'User',
          site_admin: false,
        },
        labels: [],
        assignee: null,
        assignees: [],
        milestone: null,
        locked: false,
        comments: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        closed_at: null,
        author_association: 'OWNER',
        repository_url: '',
        labels_url: '',
        comments_url: '',
        events_url: '',
        html_url: '',
      }

      await IC.set('owner', 'repo', 1, issueData)
      const result = await IC.get('owner', 'repo', 1)
      expect(result).toEqual(issueData)
    })

    it('should cache and retrieve issues lists', async () => {
      const mockKV = {
        get: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(JSON.stringify({
            data: [
              {
                id: 1,
                number: 1,
                state: 'open',
                title: 'Issue 1',
                user: {} as any,
                labels: [],
                assignee: null,
                assignees: [],
                milestone: null,
                locked: false,
                comments: 0,
                created_at: '',
                updated_at: '',
                closed_at: null,
                author_association: '',
                node_id: '',
                url: '',
                repository_url: '',
                labels_url: '',
                comments_url: '',
                events_url: '',
                html_url: '',
                body: null,
              },
            ],
            version: 1,
            cachedAt: Date.now(),
          })),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { IssueCache: IC } = cacheModule

      const issues: IssueData[] = [
        {
          id: 1,
          number: 1,
          state: 'open',
          title: 'Issue 1',
          user: {} as any,
          labels: [],
          assignee: null,
          assignees: [],
          milestone: null,
          locked: false,
          comments: 0,
          created_at: '',
          updated_at: '',
          closed_at: null,
          author_association: '',
          node_id: '',
          url: '',
          repository_url: '',
          labels_url: '',
          comments_url: '',
          events_url: '',
          html_url: '',
          body: null,
        },
      ]

      await IC.setList('owner', 'repo', 'open', issues)
      const result = await IC.getList('owner', 'repo', 'open')
      expect(result).toEqual(issues)
    })
  })

  describe('Workflow Cache', () => {
    it('should cache and retrieve workflow runs', async () => {
      const mockKV = {
        get: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(JSON.stringify({
            data: {
              id: 1,
              name: 'Test Workflow',
              node_id: 'node1',
              head_branch: 'main',
              head_sha: 'abc123',
              run_number: 1,
              event: 'push',
              status: 'completed',
              conclusion: 'success',
              workflow_id: 1,
              check_suite_id: 1,
              check_suite_node_id: '',
              url: '',
              html_url: '',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
              run_started_at: '2024-01-01T00:00:00Z',
              jobs_url: '',
              logs_url: '',
              check_suite_url: '',
              artifacts_url: '',
              cancel_url: '',
              rerun_url: '',
              previous_attempt_url: null,
              run_attempt: 1,
              triggering_actor: null,
              repository: null,
              head_commit: null,
            },
            version: 1,
            cachedAt: Date.now(),
          })),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { WorkflowCache: WC } = cacheModule

      const workflowData: WorkflowRunData = {
        id: 1,
        name: 'Test Workflow',
        node_id: 'node1',
        head_branch: 'main',
        head_sha: 'abc123',
        run_number: 1,
        event: 'push',
        status: 'completed',
        conclusion: 'success',
        workflow_id: 1,
        check_suite_id: 1,
        check_suite_node_id: '',
        url: '',
        html_url: '',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        run_started_at: '2024-01-01T00:00:00Z',
        jobs_url: '',
        logs_url: '',
        check_suite_url: '',
        artifacts_url: '',
        cancel_url: '',
        rerun_url: '',
        previous_attempt_url: null,
        run_attempt: 1,
        triggering_actor: null,
        repository: null,
        head_commit: null,
      }

      await WC.set('owner', 'repo', 1, workflowData)
      const result = await WC.get('owner', 'repo', 1)
      expect(result).toEqual(workflowData)
    })
  })

  describe('Project Cache', () => {
    it('should cache and retrieve projects', async () => {
      const mockKV = {
        get: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(JSON.stringify({
            data: {
              id: 1,
              node_id: 'node1',
              name: 'Test Project',
              body: 'Project description',
              number: 1,
              state: 'open',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
              url: '',
              html_url: '',
              columns_url: '',
              owner: null,
            },
            version: 1,
            cachedAt: Date.now(),
          })),
        set: jest.fn().mockResolvedValue('OK'),
        delete: jest.fn().mockResolvedValue(1),
        keys: jest.fn().mockResolvedValue([]),
      }

      const { KV } = require('@vercel/kv')
      KV.mockImplementation(() => mockKV)

      const cacheModule = await import('./cache')
      const { ProjectCache: PC } = cacheModule

      const projectData: ProjectData = {
        id: 1,
        node_id: 'node1',
        name: 'Test Project',
        body: 'Project description',
        number: 1,
        state: 'open',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
        url: '',
        html_url: '',
        columns_url: '',
        owner: null,
      }

      await PC.set('owner', 'repo', 1, projectData)
      const result = await PC.get('owner', 'repo', 1)
      expect(result).toEqual(projectData)
    })
  })

  describe('Cache Statistics', () => {
    it('should track statistics', () => {
      const stats = getStats()
      expect(stats).toHaveProperty('hits')
      expect(stats).toHaveProperty('misses')
      expect(stats).toHaveProperty('sets')
      expect(stats).toHaveProperty('deletes')
      expect(stats).toHaveProperty('errors')
    })

    it('should reset statistics', () => {
      resetStats()
      const stats = getStats()
      expect(stats.hits).toBe(0)
      expect(stats.misses).toBe(0)
      expect(stats.sets).toBe(0)
      expect(stats.deletes).toBe(0)
      expect(stats.errors).toBe(0)
    })
  })

  describe('Mock KV Fallback', () => {
    it('should use mock KV when no environment variables are set', async () => {
      // Clear environment variables
      const originalEnv = process.env
      process.env = { ...process.env, KV_URL: undefined, REDIS_URL: undefined }

      const cacheModule = await import('./cache')
      const { set: cacheSet, get: cacheGet } = cacheModule

      await cacheSet('test-key', { data: 'test' })
      const result = await cacheGet('test-key')

      expect(result).not.toBeNull()
      expect(result?.data).toEqual({ data: 'test' })

      // Restore environment
      process.env = originalEnv
    })
  })
})
