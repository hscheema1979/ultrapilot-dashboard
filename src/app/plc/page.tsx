'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, CheckCircle, Clock, Play, Pause, MessageSquare, Settings, ExternalLink } from "lucide-react"
import { LIFECYCLE_PHASES } from "@/lib/lifecycle-types"

export default function PLCManagerPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [])

  async function fetchProjects() {
    try {
      setLoading(true)
      const res = await fetch('/api/projects/active')
      const data = await res.json()
      setProjects(data.projects || [])
      if (data.projects?.length > 0 && !selectedProject) {
        setSelectedProject(data.projects[0])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Lifecycle Controller</h1>
          <p className="text-muted-foreground">
            Manage and monitor project phases with ultra:architect and ultra:team-lead
          </p>
        </div>

        {/* Project Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Project</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value)
                  setSelectedProject(project)
                }}
                className="w-full border rounded-md px-3 py-2"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.title} ({project.projectId})
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>

        {/* Selected Project PLC */}
        {selectedProject && (
          <>
            {/* Phase Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle>Phase Pipeline</CardTitle>
                <CardDescription>
                  {selectedProject.title} • {selectedProject.projectId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-4">
                  {LIFECYCLE_PHASES.map((phase, index) => {
                    const isCompleted = index < getCurrentPhaseIndex(selectedProject)
                    const isCurrent = index === getCurrentPhaseIndex(selectedProject)
                    const isPending = index > getCurrentPhaseIndex(selectedProject)

                    return (
                      <div key={phase.id} className="flex items-center">
                        <div
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 whitespace-nowrap ${
                            isCompleted
                              ? 'bg-green-100 border-green-500 dark:bg-green-900/20'
                              : isCurrent
                              ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/20 animate-pulse'
                              : 'bg-gray-50 border-gray-300 dark:bg-gray-900'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : isCurrent ? (
                            <Play className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium">{phase.name}</span>
                        </div>
                        {index < LIFECYCLE_PHASES.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground mx-1" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Current Phase Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Phase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Phase</span>
                      <Badge>{LIFECYCLE_PHASES[getCurrentPhaseIndex(selectedProject)]?.name}</Badge>
                    </div>
                    <Progress value={selectedProject.progress || 0} />
                    <span className="text-xs text-muted-foreground mt-1">
                      {selectedProject.progress || 0}% complete
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Lead Agent</span>
                      <span className="font-medium">{selectedProject.agent}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Started</span>
                      <span className="font-medium">
                        {formatDuration(selectedProject.started)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-medium">
                        {selectedProject.completedTasks || 0}/{selectedProject.totalTasks || 0} complete
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ETA</span>
                      <span className="font-medium">
                        {selectedProject.eta || 'Calculating...'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">
                      Active Agents on This Phase:
                    </p>
                    <div className="space-y-2">
                      {(selectedProject.activeAgents || []).map((agent: any) => (
                        <div key={agent.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant="outline">{agent.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Phase Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Advance to Next Phase
                  </Button>
                  <Button className="w-full" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Request Review
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause Project
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Spawn Additional Agent
                  </Button>
                  <Button className="w-full" variant="outline" asChild>
                    <a href={selectedProject.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on GitHub
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>From GitHub comments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(selectedProject.activity || []).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{activity.agent}</span>
                          <span className="text-muted-foreground">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{activity.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

function getCurrentPhaseIndex(project: any): number {
  if (!project.currentPhase) return 0
  return LIFECYCLE_PHASES.findIndex(p => p.id === project.currentPhase)
}

function formatDuration(timestamp: string): string {
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
