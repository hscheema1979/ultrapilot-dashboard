"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Workflow,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Filter,
  GitBranch,
  User,
  Calendar,
  ExternalLink,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"

interface Workflow {
  id: string
  issueNumber: number
  title: string
  state: 'pending' | 'active' | 'completed' | 'blocked' | 'failed'
  phase: number
  agent: string
  labels: string[]
  assignees: string[]
  createdAt: string
  updatedAt: string
  htmlUrl: string
  dependencies: string[]
}

interface WorkflowStats {
  total: number
  pending: number
  active: number
  completed: number
  blocked: number
  failed: number
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<WorkflowStats>({
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    blocked: 0,
    failed: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch workflows from control-room repository
      const response = await fetch('/api/v1/workflows?owner=hscheema1979&repo=control-room&per_page=100')
      if (!response.ok) throw new Error('Failed to fetch workflows')

      const data = await response.json()
      setWorkflows(data.workflows || [])

      // Calculate stats
      const workflowStats = (data.workflows || []).reduce((acc: WorkflowStats, wf: Workflow) => {
        acc.total++
        if (wf.state === 'pending') acc.pending++
        else if (wf.state === 'active') acc.active++
        else if (wf.state === 'completed') acc.completed++
        else if (wf.state === 'blocked') acc.blocked++
        else if (wf.state === 'failed') acc.failed++
        return acc
      }, { total: 0, pending: 0, active: 0, completed: 0, blocked: 0, failed: 0 })

      setStats(workflowStats)
    } catch (err) {
      console.error('Error fetching workflows:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workflows')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const filteredWorkflows = React.useMemo(() => {
    return workflows.filter(wf =>
      wf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [workflows, searchQuery])

  const getStateIcon = (state: Workflow['state']) => {
    switch (state) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'active':
        return <Play className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'blocked':
        return <AlertCircle className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStateColor = (state: Workflow['state']) => {
    switch (state) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'active':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'blocked':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      case 'failed':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
    }
  }

  const getPhaseBadgeColor = (phase: number) => {
    const colors = [
      'bg-gray-500/10 text-gray-600 border-gray-500/20',      // Phase 0
      'bg-blue-500/10 text-blue-600 border-blue-500/20',      // Phase 1
      'bg-indigo-500/10 text-indigo-600 border-indigo-500/20', // Phase 2
      'bg-purple-500/10 text-purple-600 border-purple-500/20', // Phase 3
      'bg-pink-500/10 text-pink-600 border-pink-500/20',      // Phase 4
      'bg-orange-500/10 text-orange-600 border-orange-500/20', // Phase 5
      'bg-green-500/10 text-green-600 border-green-500/20',   // Phase 6
    ]
    return colors[phase] || colors[0]
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage agent workflows</p>
          </div>
          <Button onClick={fetchWorkflows}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
        <Card className="border-red-500/50 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-600">Error Loading Workflows</p>
                <p className="text-sm text-red-600/70">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage agent workflows for UltraPilot Dashboard
          </p>
        </div>
        <Button onClick={fetchWorkflows} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Workflow Status Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting start</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully done</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Blocked/Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked + stats.failed}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredWorkflows.length} of {workflows.length} workflows
        </Badge>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Workflow className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No workflows found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {searchQuery ? 'Try adjusting your search' : 'Create a workflow issue in GitHub to get started'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorkflows.map((wf) => (
            <Card key={wf.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg">
                        <a
                          href={wf.htmlUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          {wf.title}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getStateColor(wf.state)}>
                        {getStateIcon(wf.state)}
                        <span className="ml-1">{wf.state}</span>
                      </Badge>
                      <Badge variant="outline" className={getPhaseBadgeColor(wf.phase)}>
                        <GitBranch className="h-3 w-3 mr-1" />
                        Phase {wf.phase}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                        <User className="h-3 w-3 mr-1" />
                        {wf.agent}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(wf.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wf.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {wf.labels.slice(0, 5).map((label) => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {wf.labels.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{wf.labels.length - 5} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Issue #{wf.issueNumber}
                    </span>
                    {wf.assignees.length > 0 && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {wf.assignees.join(', ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated {new Date(wf.updatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
