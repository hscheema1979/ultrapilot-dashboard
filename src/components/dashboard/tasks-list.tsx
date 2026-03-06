'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { useTasks } from "@/hooks/use-dashboard-data"
import { ErrorBoundary } from "@/components/error-boundary"

function getStatusIcon(status: string) {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="h-4 w-4 text-status-success" />
    case "In Progress":
      return <Clock className="h-4 w-4 text-status-warning" />
    case "In Review":
      return <AlertCircle className="h-4 w-4 text-status-info" />
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "Critical":
      return <Badge className="bg-status-error text-status-error-foreground">Critical</Badge>
    case "High":
      return <Badge className="bg-status-warning text-status-warning-foreground">High</Badge>
    case "Medium":
      return <Badge className="bg-status-info text-status-info-foreground">Medium</Badge>
    case "Low":
      return <Badge variant="secondary">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getLabelColor(label: string) {
  const colors: Record<string, string> = {
    'feature': 'bg-accent text-accent-foreground',
    'bug': 'bg-status-error/10 text-status-error',
    'enhancement': 'bg-status-info/10 text-status-info',
    'frontend': 'bg-accent text-accent-foreground',
    'backend': 'bg-status-success/10 text-status-success',
    'testing': 'bg-status-warning/10 text-status-warning',
    'security': 'bg-status-error/10 text-status-error',
    'documentation': 'bg-muted text-muted-foreground',
    'maintenance': 'bg-muted text-muted-foreground',
    'quality': 'bg-status-success/10 text-status-success',
    'dependencies': 'bg-status-warning/10 text-status-warning',
    'ci/cd': 'bg-accent text-accent-foreground',
  }
  return colors[label] || "bg-muted text-muted-foreground"
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  )
}

function TasksListContent() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const { isLoading, currentProject } = useProject()
  const { data: tasks, loading, error } = useTasks(statusFilter)

  // Prevent API calls and show skeleton while project context is loading
  if (isLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks & Issues</CardTitle>
              <CardDescription>
                Track GitHub issues and task assignments
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-[140px]" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    )
  }

  // Show message if no project selected
  if (!currentProject) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks & Issues</CardTitle>
              <CardDescription>
                Track GitHub issues and task assignments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No project selected. Please select a project to view tasks.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show error state if tasks fetch failed
  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks & Issues</CardTitle>
              <CardDescription>
                Track GitHub issues and task assignments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load tasks: {error}. Please check your repository settings or try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const githubIssuesUrl = `https://github.com/${currentProject.owner}/${currentProject.repo}/issues`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tasks & Issues</CardTitle>
            <CardDescription>
              Track GitHub issues and task assignments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={() => window.open(githubIssuesUrl + '/new', '_blank')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              No tasks found. Create an issue in your repository.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(githubIssuesUrl + '/new', '_blank')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Labels</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {task.id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-md">
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className="text-sm">{task.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    {task.assignee ? (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-medium">
                        {task.assignee}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {task.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className={`text-xs ${getLabelColor(label)}`}
                        >
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{task.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(task.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export function TasksList() {
  return (
    <ErrorBoundary>
      <TasksListContent />
    </ErrorBoundary>
  )
}
