'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Eye, MoreHorizontal, ExternalLink, AlertCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useProject } from "@/contexts/project-context"
import { useWorkflows } from "@/hooks/use-dashboard-data"
import { ErrorBoundary } from "@/components/error-boundary"

function getStatusBadge(status: string) {
  switch (status) {
    case "running":
      return <Badge className="bg-status-warning text-status-warning-foreground hover:bg-status-warning/90">Running</Badge>
    case "completed":
      return <Badge className="bg-status-success text-status-success-foreground hover:bg-status-success/90">Success</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
    case "pending":
      return <Badge variant="secondary">Pending</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  )
}

function WorkflowMonitorContent() {
  const { isLoading, currentProject } = useProject()
  const { data: workflows, loading, error } = useWorkflows()

  // Prevent API calls and show skeleton while project context is loading
  if (isLoading || loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Runs</CardTitle>
          <CardDescription>Monitor GitHub Actions workflow runs</CardDescription>
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
          <CardTitle>Workflow Runs</CardTitle>
          <CardDescription>Monitor GitHub Actions workflow runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No project selected. Please select a project to view workflows.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  // Show error state if workflows fetch failed
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Runs</CardTitle>
          <CardDescription>Monitor GitHub Actions workflow runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load workflows: {error}. Please check your repository settings or try refreshing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const handleViewDetails = (url: string) => {
    window.open(url, '_blank')
  }

  const githubActionsUrl = `https://github.com/${currentProject.owner}/${currentProject.repo}/actions`

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow Runs</CardTitle>
            <CardDescription>
              Monitor GitHub Actions workflow runs in real-time
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={() => window.open(githubActionsUrl, '_blank')}
          >
            <Play className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {workflows.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              No workflow runs found. Create a workflow in your repository.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(githubActionsUrl, '_blank')}
            >
              View GitHub Actions
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div>{workflow.name}</div>
                      {workflow.status === "running" && (
                        <Progress value={workflow.progress} className="h-1 w-20" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                  <TableCell className="capitalize">{workflow.trigger}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {workflow.branch}
                    </code>
                  </TableCell>
                  <TableCell>{workflow.duration}</TableCell>
                  <TableCell className="text-muted-foreground">{workflow.lastRun}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(workflow.url)}
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

export function WorkflowMonitor() {
  return (
    <ErrorBoundary>
      <WorkflowMonitorContent />
    </ErrorBoundary>
  )
}
