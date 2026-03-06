'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GitBranch, ExternalLink, Settings, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface ProjectMetrics {
  totalWorkflows: number
  successfulWorkflows: number
  failedWorkflows: number
  totalTasks: number
  openTasks: number
  inProgressTasks: number
  completedTasks: number
  successRate: number
}

export default function TrackerPage() {
  const { projects } = useProject()
  const [metrics, setMetrics] = useState<Record<string, ProjectMetrics>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAllMetrics() {
      if (projects.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const allMetrics: Record<string, ProjectMetrics> = {}

        for (const project of projects.filter(p => p.enabled)) {
          try {
            const [workflowsRes, tasksRes] = await Promise.all([
              fetch(`/api/workflows?owner=${project.owner}&repo=${project.repo}`),
              fetch(`/api/tasks?owner=${project.owner}&repo=${project.repo}`)
            ])

            if (workflowsRes.ok && tasksRes.ok) {
              const workflowsData = await workflowsRes.json()
              const tasksData = await tasksRes.json()

              const totalWorkflows = workflowsData.total || 0
              const successfulWorkflows = workflowsData.completed || 0
              const failedWorkflows = workflowsData.failed || 0
              const allTasks = tasksData.tasks || []

              allMetrics[project.id] = {
                totalWorkflows,
                successfulWorkflows,
                failedWorkflows,
                totalTasks: allTasks.length,
                openTasks: allTasks.filter((t: any) => t.status === 'Open').length,
                inProgressTasks: allTasks.filter((t: any) => t.status === 'In Progress').length,
                completedTasks: allTasks.filter((t: any) => t.status === 'Completed').length,
                successRate: totalWorkflows > 0
                  ? Math.round((successfulWorkflows / totalWorkflows) * 100)
                  : 0
              }
            }
          } catch (error) {
            console.error(`Error fetching metrics for ${project.name}:`, error)
          }
        }

        setMetrics(allMetrics)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllMetrics()
  }, [projects])

  const getStatusBadge = (projectId: string) => {
    const metric = metrics[projectId]
    if (!metric) return null

    if (metric.failedWorkflows > 0) {
      return <Badge className="bg-red-600">Needs Attention</Badge>
    }
    if (metric.successRate >= 90) {
      return <Badge className="bg-green-600">Healthy</Badge>
    }
    return <Badge className="bg-yellow-600">Warning</Badge>
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-muted-foreground">Loading project metrics...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Tracker</h2>
          <p className="text-muted-foreground">
            Monitor status across all projects
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.filter(p => p.enabled).map((project) => {
            const metric = metrics[project.id]
            if (!metric) return null

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {project.owner}/{project.repo}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(project.id)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Workflows Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Workflows</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {metric.successfulWorkflows}/{metric.totalWorkflows}
                      </span>
                    </div>
                    <Progress value={metric.successRate} className="h-2" />
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {metric.successfulWorkflows} success
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        {metric.failedWorkflows} failed
                      </span>
                    </div>
                  </div>

                  {/* Tasks Section */}
                  <div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Tasks</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{metric.openTasks}</div>
                        <div className="text-xs text-muted-foreground">Open</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{metric.inProgressTasks}</div>
                        <div className="text-xs text-muted-foreground">In Progress</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="text-lg font-bold">{metric.completedTasks}</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        const currentProject = projects.find(p => p.id === project.id)
                        if (currentProject) {
                          // Store selected project and redirect to dashboard
                          localStorage.setItem('selectedProject', project.id)
                          window.location.href = '/dashboard'
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://github.com/${project.owner}/${project.repo}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {projects.filter(p => p.enabled).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No projects enabled. Add projects to start tracking.
              </p>
              <Link href="/projects">
                <Button>Add Projects</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
