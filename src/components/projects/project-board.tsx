/**
 * Project Board Component
 *
 * Displays a Kanban-style board with:
 * - Project title and description
 * - Columns as vertical swimlanes
 * - Cards showing issue/PR details
 * - Real-time updates (polling every 60s)
 * - Project progress indicator
 * - Filter by project, repo, org
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, RefreshCw, ExternalLink, Filter, LayoutGrid } from 'lucide-react'
import { ProjectWithColumns, ListProjectsRequest } from '@/types/api'
import { ProjectCard } from './project-card'

interface ProjectBoardProps {
  initialOrg?: string
  initialRepo?: string
  initialProject?: number
  autoRefresh?: boolean // Enable auto-refresh every 60s
  refreshInterval?: number // Refresh interval in seconds (default: 60)
}

export function ProjectBoard({
  initialOrg = 'hscheema1979',
  initialRepo,
  initialProject,
  autoRefresh = true,
  refreshInterval = 60,
}: ProjectBoardProps) {
  const [projects, setProjects] = useState<ProjectWithColumns[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<number | undefined>(initialProject)
  const [filterOrg, setFilterOrg] = useState(initialOrg)
  const [filterRepo, setFilterRepo] = useState<string | undefined>(initialRepo)
  const [filterState, setFilterState] = useState<'open' | 'closed' | 'all'>('open')
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true)
    setError(null)

    try {
      const params: ListProjectsRequest = {
        org: filterOrg,
        repo: filterRepo,
        state: filterState,
      }

      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
      ).toString()

      const response = await fetch(`/api/v1/projects?${queryString}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch projects')
      }

      const data = await response.json()
      setProjects(data.projects || [])

      // Auto-select first project if none selected
      if (!selectedProject && data.projects?.length > 0) {
        setSelectedProject(data.projects[0].id)
      }

      setLastRefresh(new Date())
    } catch (err: any) {
      console.error('Error fetching projects:', err)
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchProjects()
  }, [filterOrg, filterRepo, filterState])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.debug('[ProjectBoard] Auto-refreshing projects')
      fetchProjects()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, filterOrg, filterRepo, filterState])

  // Get selected project data
  const currentProject = projects.find((p) => p.id === selectedProject)

  // Handle card click
  const handleCardClick = (card: any) => {
    if (card.content?.html_url) {
      window.open(card.content.html_url, '_blank')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            Projects Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Track progress across all GitHub projects
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Last refresh time */}
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            {/* Organization Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Organization</label>
              <Input
                placeholder="hscheema1979"
                value={filterOrg}
                onChange={(e) => setFilterOrg(e.target.value)}
              />
            </div>

            {/* Repository Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-1 block">Repository (optional)</label>
              <Input
                placeholder="ultrapilot-dashboard"
                value={filterRepo || ''}
                onChange={(e) => setFilterRepo(e.target.value || undefined)}
              />
            </div>

            {/* State Filter */}
            <div className="w-[150px]">
              <label className="text-sm font-medium mb-1 block">State</label>
              <Select value={filterState} onValueChange={(v: any) => setFilterState(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && projects.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading projects</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && projects.length === 0 && (
        <Card>
          <CardContent className="pt-4 text-center py-12">
            <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or check your GitHub connection.
            </p>
            <Button onClick={fetchProjects}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      {!loading && !error && projects.length > 0 && (
        <div className="space-y-6">
          {/* Project Selector */}
          {projects.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => (
                <Button
                  key={project.id}
                  variant={selectedProject === project.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedProject(project.id)}
                >
                  {project.name}
                  {project.progress !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {project.progress}%
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          )}

          {/* Selected Project Board */}
          {currentProject && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {currentProject.name}
                      <Badge variant={currentProject.state === 'open' ? 'default' : 'secondary'}>
                        {currentProject.state}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {currentProject.body || 'No description'}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{currentProject.cardCount} cards</span>
                      <span>•</span>
                      <span>Updated {new Date(currentProject.updated_at).toLocaleDateString()}</span>
                      {currentProject.html_url && (
                        <>
                          <span>•</span>
                          <a
                            href={currentProject.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            View on GitHub <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {currentProject.progress !== undefined && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">{currentProject.progress}%</span>
                    </div>
                    <Progress value={currentProject.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {/* Kanban Board */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {currentProject.columns.map((column) => (
                    <div
                      key={column.id}
                      className="flex-shrink-0 w-80 space-y-2"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <h3 className="font-medium text-sm">{column.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {column.cardCount}
                        </Badge>
                      </div>

                      {/* Cards */}
                      <div className="space-y-2">
                        {column.cards.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                            No cards
                          </div>
                        ) : (
                          column.cards.map((card) => (
                            <ProjectCard
                              key={card.id}
                              card={card}
                              onCardClick={handleCardClick}
                            />
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
