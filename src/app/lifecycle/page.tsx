'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LifecycleProgress, CompactLifecycle } from "@/components/lifecycle/lifecycle-progress"
import { MetricsDashboard } from "@/components/lifecycle/metrics-dashboard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, Filter, Search, ExternalLink } from "lucide-react"
import { LifecycleProject, ProjectMetrics } from "@/lib/lifecycle-types"

export default function LifecyclePage() {
  const [projects, setProjects] = useState<LifecycleProject[]>([])
  const [metrics, setMetrics] = useState<ProjectMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  useEffect(() => {
    fetchLifecycleData()
    const interval = setInterval(fetchLifecycleData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  async function fetchLifecycleData() {
    try {
      setLoading(true)
      const [projectsRes, metricsRes] = await Promise.all([
        fetch('/api/lifecycle/active'),
        fetch('/api/lifecycle/metrics')
      ])

      const projectsData = await projectsRes.json()
      const metricsData = await metricsRes.json()

      setProjects(projectsData.projects || [])
      setMetrics(metricsData.metrics || [])
    } catch (error) {
      console.error('Error fetching lifecycle data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    if (filter === 'active') return project.progress < 100
    if (filter === 'completed') return project.progress === 100
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Lifecycle</h1>
          <p className="text-muted-foreground">
            Track projects from initiation to deployment
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SummaryCard
            title="Active Projects"
            value={projects.filter(p => p.progress < 100).length}
            icon={Activity}
          />
          <SummaryCard
            title="Completed"
            value={projects.filter(p => p.progress === 100).length}
            icon={Activity}
          />
          <SummaryCard
            title="Avg Cycle Time"
            value={formatAvgDuration(metrics)}
            icon={Activity}
          />
          <SummaryCard
            title="Success Rate"
            value={calculateSuccessRate(metrics)}
            icon={Activity}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="metrics">Metrics Dashboard</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>

          {/* Active Projects Tab */}
          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="border rounded-md px-3 py-1.5 text-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No projects found</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.issueId} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Metrics Dashboard Tab */}
          <TabsContent value="metrics">
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <MetricsDashboard metrics={metrics} />
            )}
          </TabsContent>

          {/* All Projects Tab */}
          <TabsContent value="all">
            <ProjectListTable projects={projects} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

function ProjectCard({ project }: { project: LifecycleProject }) {
  const elapsed = Date.now() - new Date(project.started).getTime()
  const elapsedMinutes = Math.floor(elapsed / 60000)

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <Badge variant="outline">#{project.issueId}</Badge>
                <Badge>{project.projectId}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Started {elapsedMinutes} minutes ago • {project.agent}
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <a href={project.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Lifecycle Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current Phase: {project.phase}</span>
              <span className="font-semibold">{project.progress}%</span>
            </div>
            <CompactLifecycle currentPhase={project.phase} progress={project.progress} />
          </div>

          {/* Labels */}
          <div className="flex items-center gap-2 flex-wrap">
            {project.labels.slice(0, 5).map(label => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button size="sm" variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SummaryCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <Icon className="h-8 w-8 text-muted-foreground opacity-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectListTable({ projects }: { projects: LifecycleProject[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Projects</CardTitle>
        <CardDescription>Complete project history and status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Issue</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Project</th>
                <th className="text-left p-3">Phase</th>
                <th className="text-left p-3">Progress</th>
                <th className="text-left p-3">Agent</th>
                <th className="text-left p-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr key={project.issueId} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <Badge variant="outline">#{project.issueId}</Badge>
                  </td>
                  <td className="p-3 font-medium">{project.title}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{project.projectId}</Badge>
                  </td>
                  <td className="p-3">{project.phase}</td>
                  <td className="p-3">{project.progress}%</td>
                  <td className="p-3">{project.agent}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(project.started).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions

function formatAvgDuration(metrics: ProjectMetrics[]): string {
  if (metrics.length === 0) return '-'
  const avg = metrics.reduce((sum, m) => sum + m.cycleTime, 0) / metrics.length
  const minutes = Math.floor(avg / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function calculateSuccessRate(metrics: ProjectMetrics[]): string {
  if (metrics.length === 0) return '-'
  const successful = metrics.filter(m => m.status === 'success').length
  const rate = (successful / metrics.length) * 100
  return `${rate.toFixed(1)}%`
}
