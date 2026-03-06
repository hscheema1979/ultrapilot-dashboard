/**
 * Unit Tests for GitHub Projects API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { listProjects, getProject, invalidateProjectsCache } from './projects'
import { ProjectCache } from '../cache'
import { getOctokit } from '../github-auth'

// Mock dependencies
vi.mock('../github-auth')
vi.mock('../cache')
vi.mock('../coalescing')

describe('GitHub Projects API', () => {
  const mockOctokit = {
    rest: {
      projects: {
        listForOrg: vi.fn(),
        listForRepo: vi.fn(),
        get: vi.fn(),
        listColumns: vi.fn(),
        listCards: vi.fn(),
      },
    },
  }

  const mockProject = {
    id: 123456,
    node_id: 'project_node_id',
    name: 'Test Project',
    body: 'Test project description',
    number: 1,
    state: 'open',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-06T12:00:00Z',
    url: 'https://api.github.com/projects/123456',
    html_url: 'https://github.com/orgs/testorg/projects/1',
    columns_url: 'https://api.github.com/projects/123456/columns',
    owner: {
      login: 'testorg',
      id: 123,
      type: 'Organization',
      avatar_url: 'https://github.com/avatars/testorg',
    },
  }

  const mockColumn = {
    id: 456,
    node_id: 'column_node_id',
    name: 'To Do',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-06T12:00:00Z',
    url: 'https://api.github.com/projects/columns/456',
    project_url: 'https://api.github.com/projects/123456',
  }

  const mockCard = {
    id: 789,
    node_id: 'card_node_id',
    column_id: 456,
    url: 'https://api.github.com/projects/columns/cards/789',
    project_url: 'https://api.github.com/projects/123456',
    column_url: 'https://api.github.com/projects/columns/456',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-06T12:00:00Z',
    note: null,
    content: {
      type: 'Issue',
      id: 1,
      number: 42,
      title: 'Test Issue',
      state: 'open',
      html_url: 'https://github.com/testorg/repo/issues/42',
      url: 'https://api.github.com/repos/testorg/repo/issues/42',
      repository: {
        id: 123,
        name: 'repo',
        full_name: 'testorg/repo',
        owner: {
          login: 'testorg',
          id: 123,
          avatar_url: 'https://github.com/avatars/testorg',
        },
      },
      assignees: [
        {
          login: 'user1',
          id: 1,
          avatar_url: 'https://github.com/avatars/user1',
          type: 'User',
        },
      ],
      labels: [
        {
          id: 1,
          name: 'bug',
          color: 'd73a4a',
          description: 'Something isn\'t working',
        },
        {
          id: 2,
          name: 'priority: high',
          color: 'ff0000',
          description: 'High priority',
        },
      ],
      closed_at: null,
      created_at: '2026-03-01T00:00:00Z',
      updated_at: '2026-03-06T12:00:00Z',
    },
    archived: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getOctokit).mockResolvedValue(mockOctokit as any)
    vi.mocked(ProjectCache.getList).mockResolvedValue(null)
    vi.mocked(ProjectCache.setList).mockResolvedValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('listProjects', () => {
    it('should fetch org-level projects with columns and cards', async () => {
      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await listProjects({
        org: 'testorg',
        state: 'open',
      })

      expect(result).toEqual({
        projects: expect.arrayContaining([
          expect.objectContaining({
            id: mockProject.id,
            name: mockProject.name,
            columns: expect.arrayContaining([
              expect.objectContaining({
                id: mockColumn.id,
                name: mockColumn.name,
                cards: expect.arrayContaining([
                  expect.objectContaining({
                    id: mockCard.id,
                    contentType: 'issue',
                    isClosed: false,
                    priority: 'high',
                  }),
                ]),
                cardCount: 1,
              }),
            ]),
            cardCount: 1,
            progress: undefined, // No "done" column
          }),
        ]),
        total_count: 1,
        page: 1,
        total_pages: 1,
      })

      expect(mockOctokit.rest.projects.listForOrg).toHaveBeenCalledWith({
        org: 'testorg',
        state: 'open',
        page: 1,
        per_page: 30,
        headers: {
          Accept: 'application/vnd.github.inertia-preview+json',
        },
      })
    })

    it('should fetch repo-level projects with columns and cards', async () => {
      mockOctokit.rest.projects.listForRepo.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await listProjects({
        org: 'testorg',
        repo: 'testrepo',
        state: 'open',
      })

      expect(result.projects).toHaveLength(1)
      expect(result.projects[0].repository).toEqual({
        id: 0,
        name: 'testrepo',
        full_name: 'testorg/testrepo',
        private: false,
      })

      expect(mockOctokit.rest.projects.listForRepo).toHaveBeenCalledWith({
        owner: 'testorg',
        repo: 'testrepo',
        state: 'open',
        page: 1,
        per_page: 30,
        headers: {
          Accept: 'application/vnd.github.inertia-preview+json',
        },
      })
    })

    it('should return cached projects when available', async () => {
      const cachedProjects = [mockProject]
      vi.mocked(ProjectCache.getList).mockResolvedValue(
        cachedProjects as any
      )

      const result = await listProjects({
        org: 'testorg',
        state: 'open',
      })

      expect(result.projects).toEqual(cachedProjects)
      expect(mockOctokit.rest.projects.listForOrg).not.toHaveBeenCalled()
    })

    it('should handle missing org and repo parameters', async () => {
      await expect(listProjects({})).rejects.toThrow(
        'Either org or org+repo must be specified'
      )
    })

    it('should handle GitHub API errors gracefully', async () => {
      mockOctokit.rest.projects.listForOrg.mockRejectedValue(
        new Error('GitHub API error')
      )

      await expect(
        listProjects({
          org: 'testorg',
          state: 'open',
        })
      ).rejects.toThrow('Failed to fetch organization projects')
    })

    it('should support pagination', async () => {
      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await listProjects({
        org: 'testorg',
        page: 2,
        per_page: 50,
      })

      expect(result.page).toBe(2)
      expect(mockOctokit.rest.projects.listForOrg).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          per_page: 50,
        })
      )
    })

    it('should compute progress correctly when done column exists', async () => {
      const doneColumn = { ...mockColumn, name: 'Done' }
      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn, doneColumn],
      })
      mockOctokit.rest.projects.listCards
        .mockResolvedValueOnce({ data: [mockCard] }) // First column
        .mockResolvedValueOnce({ data: [mockCard] }) // Done column

      const result = await listProjects({
        org: 'testorg',
        state: 'open',
      })

      expect(result.projects[0].progress).toBe(50) // 1 done out of 2 total
    })
  })

  describe('getProject', () => {
    it('should fetch a single project by ID', async () => {
      mockOctokit.rest.projects.get.mockResolvedValue({
        data: mockProject,
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await getProject(123456, 'testorg')

      expect(result).toEqual(
        expect.objectContaining({
          id: 123456,
          name: 'Test Project',
        })
      )

      expect(mockOctokit.rest.projects.get).toHaveBeenCalledWith({
        org: 'testorg',
        project_id: 123456,
        headers: {
          Accept: 'application/vnd.github.inertia-preview+json',
        },
      })
    })

    it('should fetch repo-level project by ID', async () => {
      mockOctokit.rest.projects.get.mockResolvedValue({
        data: mockProject,
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await getProject(123456, 'testorg', 'testrepo')

      expect(result?.repository).toBeDefined()

      expect(mockOctokit.rest.projects.get).toHaveBeenCalledWith({
        owner: 'testorg',
        repo: 'testrepo',
        project_id: 123456,
        headers: {
          Accept: 'application/vnd.github.inertia-preview+json',
        },
      })
    })

    it('should return null on error', async () => {
      mockOctokit.rest.projects.get.mockRejectedValue(
        new Error('Project not found')
      )

      const result = await getProject(999, 'testorg')

      expect(result).toBeNull()
    })
  })

  describe('invalidateProjectsCache', () => {
    it('should invalidate org-level cache', async () => {
      vi.mocked(ProjectCache.invalidateList).mockResolvedValue(true)

      await invalidateProjectsCache('testorg')

      expect(ProjectCache.invalidateList).toHaveBeenCalledWith('testorg', '')
    })

    it('should invalidate repo-level cache', async () => {
      vi.mocked(ProjectCache.invalidateList).mockResolvedValue(true)

      await invalidateProjectsCache('testorg', 'testrepo')

      expect(ProjectCache.invalidateList).toHaveBeenCalledWith(
        'testorg',
        'testrepo'
      )
    })

    it('should warn when org is not provided', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation()

      await invalidateProjectsCache()

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Projects] Cannot invalidate cache without org parameter'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('card enrichment', () => {
    it('should detect pull request cards', async () => {
      const prCard = {
        ...mockCard,
        content: {
          ...mockCard.content,
          type: 'PullRequest',
        },
      }

      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [prCard],
      })

      const result = await listProjects({
        org: 'testorg',
      })

      expect(result.projects[0].columns[0].cards[0].contentType).toBe(
        'pull_request'
      )
    })

    it('should handle note-only cards', async () => {
      const noteCard = {
        ...mockCard,
        note: 'This is a note',
        content: undefined,
      }

      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [noteCard],
      })

      const result = await listProjects({
        org: 'testorg',
      })

      expect(result.projects[0].columns[0].cards[0].contentType).toBe('note')
    })

    it('should extract assignee avatars', async () => {
      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await listProjects({
        org: 'testorg',
      })

      expect(result.projects[0].columns[0].cards[0].assigneeAvatars).toEqual([
        'https://github.com/avatars/user1',
      ])
    })

    it('should determine priority from labels', async () => {
      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [mockCard],
      })

      const result = await listProjects({
        org: 'testorg',
      })

      expect(result.projects[0].columns[0].cards[0].priority).toBe('high')
    })

    it('should detect closed issues', async () => {
      const closedCard = {
        ...mockCard,
        content: {
          ...mockCard.content,
          state: 'closed',
        },
      }

      mockOctokit.rest.projects.listForOrg.mockResolvedValue({
        data: [mockProject],
      })
      mockOctokit.rest.projects.listColumns.mockResolvedValue({
        data: [mockColumn],
      })
      mockOctokit.rest.projects.listCards.mockResolvedValue({
        data: [closedCard],
      })

      const result = await listProjects({
        org: 'testorg',
      })

      expect(result.projects[0].columns[0].cards[0].isClosed).toBe(true)
    })
  })
})
