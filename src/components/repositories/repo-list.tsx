/**
 * Repository List Component
 *
 * Displays a list of repositories with:
 * - Search and filter functionality
 * - Sorting options
 * - Pagination controls
 * - Repository cards with key metrics
 * - Loading and error states
 *
 * Uses SWR for data fetching and caching.
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Star,
  GitFork,
  AlertCircle,
  Clock,
  Code2,
} from 'lucide-react'
import type { EnrichedRepository, ListReposRequest } from '@/types/api'

// ============================================================================
// Fetcher
// ============================================================================

/**
 * SWR fetcher for repository API
 */
async function fetchRepos(params: ListReposRequest): Promise<{
  repositories: EnrichedRepository[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}> {
  const queryParams = new URLSearchParams()

  if (params.org) queryParams.set('org', params.org)
  if (params.page) queryParams.set('page', params.page.toString())
  if (params.per_page) queryParams.set('per_page', params.per_page.toString())
  if (params.sort) queryParams.set('sort', params.sort)
  if (params.direction) queryParams.set('direction', params.direction)
  if (params.search) queryParams.set('search', params.search)

  const response = await fetch(`/api/v1/repos?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch repositories')
  }

  return response.json()
}

// ============================================================================
// Repository Card Component
// ============================================================================

interface RepositoryCardProps {
  repository: EnrichedRepository
}

function RepositoryCard({ repository }: RepositoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold hover:text-blue-600 transition-colors truncate"
            >
              {repository.owner.login}/{repository.name}
            </a>
            {repository.private && (
              <Badge variant="secondary" className="shrink-0">
                Private
              </Badge>
            )}
            {repository.isFork && (
              <Badge variant="outline" className="shrink-0">
                Fork
              </Badge>
            )}
            {!repository.isActive && (
              <Badge variant="destructive" className="shrink-0">
                Inactive
              </Badge>
            )}
          </div>

          {repository.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {repository.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {repository.language && (
              <div className="flex items-center gap-1">
                <Code2 className="h-3.5 w-3.5" />
                <span>{repository.language}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5" />
              <span>{repository.stargazers_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              <span>{repository.forks_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{repository.open_issues_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {formatDate(repository.pushed_at)}</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs">
                {repository.ageInDays} days old
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function RepositoryCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface RepositoryListProps {
  /** Initial organization filter */
  initialOrg?: string
  /** Initial search query */
  initialSearch?: string
}

export function RepositoryList({
  initialOrg,
  initialSearch = '',
}: RepositoryListProps) {
  const [search, setSearch] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const [org, setOrg] = useState(initialOrg || '')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(30)
  const [sort, setSort] = useState<'name' | 'created' | 'updated' | 'pushed'>('updated')
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc')

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setTimeout(() => setDebouncedSearch(value), 300)
    setPage(1) // Reset to first page on search
  }

  // Build request params
  const params: ListReposRequest = {
    org: org || undefined,
    page,
    per_page: perPage,
    sort,
    direction,
    search: debouncedSearch || undefined,
  }

  // Fetch repositories
  const { data, error, isLoading } = useSWR(
    ['/api/v1/repos', params],
    () => fetchRepos(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  )

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Repositories</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'Failed to load repositories. Please try again.'}
        </p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={sort} onValueChange={(value: any) => setSort(value)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="pushed">Pushed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={direction} onValueChange={(value: any) => setDirection(value)}>
          <SelectTrigger className="w-full sm:w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Desc</SelectItem>
            <SelectItem value="asc">Asc</SelectItem>
          </SelectContent>
        </Select>

        <Select value={perPage.toString()} onValueChange={(value) => setPerPage(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="30">30</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {data && (
        <div className="text-sm text-muted-foreground">
          Showing {data.repositories.length} of {data.pagination.total} repositories
        </div>
      )}

      {/* Repository list */}
      <div className="space-y-3">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <RepositoryCardSkeleton key={i} />)
          : data?.repositories.map((repo) => <RepositoryCard key={repo.id} repository={repo} />)}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.pagination.hasPrev || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNext || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data && data.repositories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium mb-2">No repositories found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  )
}
