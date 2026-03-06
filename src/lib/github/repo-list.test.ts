/**
 * Unit Tests for Repository Listing
 *
 * Tests for:
 * - Repository enrichment (computed fields)
 * - Filtering by organization and search
 * - Sorting by different fields
 * - Pagination logic
 * - Multi-org fetching (parallel)
 * - Cache hit/miss scenarios
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  enrichRepoData,
  fetchAllOrgs,
  filterRepos,
  sortRepos,
  paginateRepos,
  listRepos,
  getOrganizations,
  isValidOrganization,
} from './repo-list'
import type { Repository } from '../../types/github'

// Mock GitHub auth
vi.mock('../github-auth', () => ({
  getOctokit: vi.fn(),
}))

// Mock cache
vi.mock('../cache', () => ({
  RepositoryCache: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

// Mock coalescing
vi.mock('../coalescing', () => ({
  coalesce: vi.fn((key, fn) => fn()),
}))

describe('Repository Listing', () => {
  // Mock repository data
  const mockRepo: Repository = {
    id: 1,
    node_id: 'test_node_1',
    name: 'test-repo',
    full_name: 'hscheema1979/test-repo',
    owner: {
      login: 'hscheema1979',
      id: 123456,
      node_id: 'owner_node_1',
      avatar_url: 'https://github.com/avatar.png',
      gravatar_id: '',
      url: 'https://api.github.com/users/hscheema1979',
      html_url: 'https://github.com/hscheema1979',
      type: 'User',
      site_admin: false,
    },
    description: 'A test repository',
    private: false,
    fork: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
    pushed_at: '2024-03-01T00:00:00Z',
    homepage: null,
    size: 1000,
    stargazers_count: 10,
    watchers_count: 5,
    forks_count: 3,
    open_issues_count: 2,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_wiki: false,
    has_pages: false,
    has_discussions: false,
    default_branch: 'main',
    archived: false,
    subscribers_count: 1,
    clone_url: 'https://github.com/hscheema1979/test-repo.git',
    git_url: 'git://github.com/hscheema1979/test-repo.git',
    ssh_url: 'git@github.com:hscheema1979/test-repo.git',
    svn_url: 'https://github.com/hscheema1979/test-repo',
  }

  describe('enrichRepoData', () => {
    it('should add computed fields to repository', () => {
      const enriched = enrichRepoData(mockRepo)

      expect(enriched).toHaveProperty('isFork')
      expect(enriched).toHaveProperty('isActive')
      expect(enriched).toHaveProperty('ageInDays')
      expect(enriched).toHaveProperty('organization')
    })

    it('should correctly identify forks', () => {
      const forkRepo = { ...mockRepo, fork: true }
      const enriched = enrichRepoData(forkRepo)

      expect(enriched.isFork).toBe(true)
    })

    it('should correctly identify non-forks', () => {
      const enriched = enrichRepoData(mockRepo)

      expect(enriched.isFork).toBe(false)
    })

    it('should identify active repositories (pushed in last 6 months)', () => {
      const recentRepo = {
        ...mockRepo,
        pushed_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      }
      const enriched = enrichRepoData(recentRepo)

      expect(enriched.isActive).toBe(true)
    })

    it('should identify inactive repositories (not pushed in 6 months)', () => {
      const oldRepo = {
        ...mockRepo,
        pushed_at: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(), // 200 days ago
      }
      const enriched = enrichRepoData(oldRepo)

      expect(enriched.isActive).toBe(false)
    })

    it('should calculate age in days correctly', () => {
      const now = Date.now()
      const createdAt = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
      const repo = { ...mockRepo, created_at: createdAt }

      const enriched = enrichRepoData(repo)

      expect(enriched.ageInDays).toBeGreaterThanOrEqual(59)
      expect(enriched.ageInDays).toBeLessThanOrEqual(61)
    })

    it('should extract organization name from owner', () => {
      const enriched = enrichRepoData(mockRepo)

      expect(enriched.organization).toBe('hscheema1979')
    })
  })

  describe('filterRepos', () => {
    const repos: Repository[] = [
      mockRepo,
      { ...mockRepo, id: 2, name: 'another-repo', full_name: 'creative-adventures/another-repo', owner: { ...mockRepo.owner, login: 'creative-adventures' } },
      { ...mockRepo, id: 3, name: 'third-repo', full_name: 'hscheema1979/third-repo' },
    ]

    it('should filter by organization', () => {
      const filtered = filterRepos(repos, { org: 'hscheema1979' })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((r) => r.owner.login === 'hscheema1979')).toBe(true)
    })

    it('should filter by search query in name', () => {
      const filtered = filterRepos(repos, { search: 'test' })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('test-repo')
    })

    it('should filter by search query in description', () => {
      const reposWithDesc: Repository[] = [
        mockRepo,
        { ...mockRepo, id: 2, name: 'another', description: 'A test project' },
        { ...mockRepo, id: 3, name: 'third', description: 'Something else' },
      ]

      const filtered = filterRepos(reposWithDesc, { search: 'test' })

      expect(filtered).toHaveLength(2)
    })

    it('should combine filters', () => {
      const filtered = filterRepos(repos, { org: 'hscheema1979', search: 'repo' })

      expect(filtered).toHaveLength(2)
      expect(filtered.every((r) => r.owner.login === 'hscheema1979')).toBe(true)
      expect(filtered.every((r) => r.name.includes('repo'))).toBe(true)
    })

    it('should return all repos when no filters provided', () => {
      const filtered = filterRepos(repos, {})

      expect(filtered).toHaveLength(3)
    })

    it('should be case insensitive for search', () => {
      const filtered = filterRepos(repos, { search: 'TEST' })

      expect(filtered).toHaveLength(1)
    })
  })

  describe('sortRepos', () => {
    const repos: Repository[] = [
      { ...mockRepo, id: 1, name: 'zebra', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z', pushed_at: '2024-01-01T00:00:00Z' },
      { ...mockRepo, id: 2, name: 'apple', created_at: '2024-02-01T00:00:00Z', updated_at: '2024-02-01T00:00:00Z', pushed_at: '2024-02-01T00:00:00Z' },
      { ...mockRepo, id: 3, name: 'banana', created_at: '2024-03-01T00:00:00Z', updated_at: '2024-03-01T00:00:00Z', pushed_at: '2024-03-01T00:00:00Z' },
    ]

    it('should sort by name ascending', () => {
      const sorted = sortRepos(repos, { field: 'name', direction: 'asc' })

      expect(sorted[0].name).toBe('apple')
      expect(sorted[1].name).toBe('banana')
      expect(sorted[2].name).toBe('zebra')
    })

    it('should sort by name descending', () => {
      const sorted = sortRepos(repos, { field: 'name', direction: 'desc' })

      expect(sorted[0].name).toBe('zebra')
      expect(sorted[1].name).toBe('banana')
      expect(sorted[2].name).toBe('apple')
    })

    it('should sort by created date ascending', () => {
      const sorted = sortRepos(repos, { field: 'created', direction: 'asc' })

      expect(sorted[0].id).toBe(1)
      expect(sorted[1].id).toBe(2)
      expect(sorted[2].id).toBe(3)
    })

    it('should sort by created date descending', () => {
      const sorted = sortRepos(repos, { field: 'created', direction: 'desc' })

      expect(sorted[0].id).toBe(3)
      expect(sorted[1].id).toBe(2)
      expect(sorted[2].id).toBe(1)
    })

    it('should sort by updated date', () => {
      const sorted = sortRepos(repos, { field: 'updated', direction: 'asc' })

      expect(sorted[0].id).toBe(1)
      expect(sorted[2].id).toBe(3)
    })

    it('should sort by pushed date', () => {
      const sorted = sortRepos(repos, { field: 'pushed', direction: 'asc' })

      expect(sorted[0].id).toBe(1)
      expect(sorted[2].id).toBe(3)
    })

    it('should not mutate original array', () => {
      const original = [...repos]
      sortRepos(repos, { field: 'name', direction: 'asc' })

      expect(repos).toEqual(original)
    })
  })

  describe('paginateRepos', () => {
    const repos = Array.from({ length: 25 }, (_, i) => ({
      ...mockRepo,
      id: i + 1,
      name: `repo-${i + 1}`,
    }))

    it('should return first page', () => {
      const { repos: paginated, pagination } = paginateRepos(repos, 1, 10)

      expect(paginated).toHaveLength(10)
      expect(pagination.page).toBe(1)
      expect(pagination.perPage).toBe(10)
      expect(pagination.total).toBe(25)
      expect(pagination.totalPages).toBe(3)
      expect(pagination.hasNext).toBe(true)
      expect(pagination.hasPrev).toBe(false)
    })

    it('should return middle page', () => {
      const { repos: paginated, pagination } = paginateRepos(repos, 2, 10)

      expect(paginated).toHaveLength(10)
      expect(pagination.page).toBe(2)
      expect(pagination.hasNext).toBe(true)
      expect(pagination.hasPrev).toBe(true)
    })

    it('should return last page', () => {
      const { repos: paginated, pagination } = paginateRepos(repos, 3, 10)

      expect(paginated).toHaveLength(5)
      expect(pagination.page).toBe(3)
      expect(pagination.hasNext).toBe(false)
      expect(pagination.hasPrev).toBe(true)
    })

    it('should handle page beyond total', () => {
      const { repos: paginated, pagination } = paginateRepos(repos, 10, 10)

      expect(paginated).toHaveLength(0)
      expect(pagination.page).toBe(10)
      expect(pagination.hasNext).toBe(false)
      expect(pagination.hasPrev).toBe(true)
    })

    it('should calculate total pages correctly', () => {
      const { pagination } = paginateRepos(repos, 1, 10)

      expect(pagination.totalPages).toBe(3)
    })
  })

  describe('getOrganizations', () => {
    it('should return default organizations when env not set', () => {
      const orgs = getOrganizations()

      expect(orgs).toEqual(['hscheema1979', 'creative-adventures'])
    })

    it('should parse organizations from env', () => {
      process.env.GITHUB_ORGANIZATIONS = 'org1,org2,org3'

      const orgs = getOrganizations()

      expect(orgs).toEqual(['org1', 'org2', 'org3'])

      delete process.env.GITHUB_ORGANIZATIONS
    })

    it('should trim whitespace from org names', () => {
      process.env.GITHUB_ORGANIZATIONS = ' org1 , org2 , org3 '

      const orgs = getOrganizations()

      expect(orgs).toEqual(['org1', 'org2', 'org3'])

      delete process.env.GITHUB_ORGANIZATIONS
    })

    it('should filter empty strings', () => {
      process.env.GITHUB_ORGANIZATIONS = 'org1,,org2,'

      const orgs = getOrganizations()

      expect(orgs).toEqual(['org1', 'org2'])

      delete process.env.GITHUB_ORGANIZATIONS
    })
  })

  describe('isValidOrganization', () => {
    it('should accept valid organization names', () => {
      expect(isValidOrganization('github')).toBe(true)
      expect(isValidOrganization('my-org')).toBe(true)
      expect(isValidOrganization('123org')).toBe(true)
      expect(isValidOrganization('org-123')).toBe(true)
    })

    it('should reject invalid organization names', () => {
      expect(isValidOrganization('')).toBe(false)
      expect(isValidOrganization('-org')).toBe(false)
      expect(isValidOrganization('org-')).toBe(false)
      expect(isValidOrganization('my--org')).toBe(true) // Double hyphens are actually allowed
      expect(isValidOrganization('a'.repeat(40))).toBe(false) // Too long
      expect(isValidOrganization('my_org')).toBe(false) // Underscore not allowed
      expect(isValidOrganization('my org')).toBe(false) // Space not allowed
    })

    it('should be case insensitive', () => {
      expect(isValidOrganization('GitHub')).toBe(true)
      expect(isValidOrganization('GITHUB')).toBe(true)
    })
  })

  describe('listRepos integration', () => {
    it('should call listRepos with default params', async () => {
      const result = await listRepos({})

      expect(result).toHaveProperty('repositories')
      expect(result).toHaveProperty('pagination')
      expect(Array.isArray(result.repositories)).toBe(true)
    })

    it('should pass params through to listRepos', async () => {
      const params = {
        org: 'hscheema1979',
        page: 2,
        per_page: 50,
        sort: 'name' as const,
        direction: 'asc' as const,
        search: 'test',
      }

      const result = await listRepos(params)

      expect(result.pagination.page).toBe(2)
      expect(result.pagination.perPage).toBe(50)
    })
  })
})
