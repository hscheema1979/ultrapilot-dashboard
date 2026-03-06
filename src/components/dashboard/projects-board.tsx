'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Users, ExternalLink, AlertCircle } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { useProjects } from "@/hooks/use-dashboard-data"
import { ErrorBoundary } from "@/components/error-boundary"

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "In Progress":
    case "Active":
      return "default"
    case "Planning":
      return "secondary"
    case "On Hold":
      return "outline"
    case "Completed":
      return "default"
    default:
      return "outline"
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "High":
      return "text-status-error bg-status-error/10"
    case "Medium":
      return "text-status-warning bg-status-warning/10"
    case "Low":
      return "text-status-success bg-status-success/10"
    default:
      return "text-muted-foreground bg-muted"
  }
}

function ProjectCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
      </div>
    </div>
  )
}

function ProjectsBoardContent() {
  const { isLoading, currentProject } = useProject()
  const { data: projects, loading, error } = useProjects()

  // Prevent API calls and show skeleton while project context is loading
  if (isLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects Board</CardTitle>
          <CardDescription>Track GitHub Projects and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProjectCardSkeleton />
            <ProjectCardSkeleton />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show message if no project selected
  if (!currentProject) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Projects Board</CardTitle>
          <CardDescription>Track GitHub Projects and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No project selected. Please select a project to view GitHub Projects.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // GitHub Projects API is not critical - show empty state on error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Projects Board</CardTitle>
              <CardDescription>
                Track GitHub Projects and progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              GitHub Projects are not available for this repository or could not be loaded.
            </p>
            <p className="text-sm text-muted-foreground">
              This is optional - you can still use workflows and tasks.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const githubProjectsUrl = `https://github.com/${currentProject.owner}/${currentProject.repo}/projects`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Projects Board</CardTitle>
            <CardDescription>
              Track GitHub Projects and progress
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => window.open(githubProjectsUrl, '_blank')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              No GitHub Projects found. Create a project to track your work.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(githubProjectsUrl, '_blank')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => window.open(project.url, '_blank')}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                      <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(project.url, '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                {project.totalTasks > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {project.completedTasks} of {project.totalTasks} tasks
                      </span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Due: {project.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProjectsBoard() {
  return (
    <ErrorBoundary>
      <ProjectsBoardContent />
    </ErrorBoundary>
  )
}
