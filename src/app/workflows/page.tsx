"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  GitBranch,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface WorkflowRun {
  id: string
  type: string
  title: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  phase: number
  startedAt: string
  issueUrl?: string
  issueNumber?: number
}

export default function ActiveWorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      setIsLoading(true)
      // Fetch from GitHub issues with workflow labels
      const response = await fetch('/api/v1/workflows/list')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data.workflows || [])
      }
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'in_progress':
        return <Badge className="bg-blue-600"><Activity className="h-3 w-3 mr-1 animate-spin" />Running</Badge>
      case 'completed':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPhaseProgress = (phase: number, totalPhases: number = 6) => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: totalPhases }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-6 rounded-full ${
              i < phase
                ? 'bg-green-500'
                : i === phase
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-200'
            }`}
            title={`Phase ${i}`}
          />
        ))}
      </div>
    )
  }

  const filteredWorkflows = workflows.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Workflows</h1>
        <p className="text-muted-foreground mt-1">
          Monitor all UltraPilot workflow executions
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={fetchWorkflows} variant="outline">
          Refresh
        </Button>
        <Button onClick={() => window.location.href = '/dashboard/control'}>
          New Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredWorkflows.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredWorkflows.filter(w => w.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredWorkflows.filter(w => w.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredWorkflows.filter(w => w.status === 'failed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 animate-spin" />
          <p>Loading workflows...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWorkflows.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <GitBranch className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No workflows found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Submit a workflow from Control Center to get started
                </p>
                <Button
                  className="mt-4"
                  onClick={() => window.location.href = '/dashboard/control'}
                >
                  Submit First Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredWorkflows.map((workflow) => (
              <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold">{workflow.title}</h3>
                        {getStatusBadge(workflow.status)}
                        <Badge variant="outline" className="text-xs">
                          {workflow.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(workflow.startedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-2">
                        {getPhaseProgress(workflow.phase)}
                      </div>
                      {workflow.issueUrl && (
                        <div className="text-sm text-blue-600">
                          Issue: #{workflow.issueNumber}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {workflow.issueUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(workflow.issueUrl, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Issue
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('/dashboard/traces', '_self')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Traces
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
