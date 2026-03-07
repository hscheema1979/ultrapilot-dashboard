"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Sparkles,
  FileText,
  Bug,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  Activity,
  Play,
  Pause,
  Eye,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface WorkflowRequest {
  type: 'feature-request' | 'bug-report' | 'audit' | 'refactor' | 'test'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  workflow: 'quick' | 'full-ultrapilot' | 'ultra-ralph' | 'autoloop'
  repository: string
}

export default function WorkflowControlCenter() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeWorkflows, setActiveWorkflows] = useState([
    {
      id: 'wf-001',
      type: 'feature-request',
      title: 'Add OAuth2 authentication',
      status: 'in-progress',
      phase: 2,
      agents: ['ultra:analyst', 'ultra:architect', 'ultra:planner', 'ultra:team-lead'],
      startedAt: '2026-03-06T10:00:00Z',
      currentAgent: 'ultra:team-lead',
      currentActivity: 'Spawning workers for implementation',
    }
  ])

  const [request, setRequest] = useState<WorkflowRequest>({
    type: 'feature-request',
    title: '',
    description: '',
    priority: 'medium',
    workflow: 'full-ultrapilot',
    repository: 'hscheema1979/ultrapilot-dashboard'
  })

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Trigger GitHub Actions workflow
      const response = await fetch('/api/v1/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: request.workflow,
          task: `${request.type}: ${request.title}\n\n${request.description}`,
          metadata: {
            type: request.type,
            priority: request.priority,
            repository: request.repository
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Add to active workflows and show success
        const newWorkflow = {
          id: data.runId,
          type: request.type,
          title: request.title,
          status: 'pending',
          phase: 0,
          agents: [],
          startedAt: new Date().toISOString(),
          currentActivity: 'Initializing...',
          issueUrl: data.issueUrl,
          issueNumber: data.issueNumber
        }
        setActiveWorkflows([...activeWorkflows, newWorkflow])

        // Show success message
        alert(`Workflow submitted successfully!\n\nIssue created: ${data.issueUrl}\nYou can monitor progress in Active Workflows below.`)

        // Reset form
        setRequest({
          type: 'feature-request',
          title: '',
          description: '',
          priority: 'medium',
          workflow: 'full-ultrapilot',
          repository: 'hscheema1979/ultrapilot-dashboard'
        })
      }
    } catch (error) {
      console.error('Error submitting workflow:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getWorkflowBadge = (workflow: string) => {
    switch (workflow) {
      case 'quick':
        return <Badge variant="outline">Quick (Single Agent)</Badge>
      case 'full-ultrapilot':
        return <Badge className="bg-blue-600">Full UltraPilot (5-Phase)</Badge>
      case 'ultra-ralph':
        return <Badge className="bg-purple-600">Ultra-Ralph (Loop)</Badge>
      case 'autoloop':
        return <Badge className="bg-green-600">Autoloop (Continuous)</Badge>
    }
  }

  const getPhaseProgress = (phase: number) => {
    const phases = [
      { num: 0, name: 'Requirements' },
      { num: 1, name: 'Planning' },
      { num: 2, name: 'Execution' },
      { num: 3, name: 'QA' },
      { num: 4, name: 'Validation' },
      { num: 5, name: 'Verification' }
    ]

    return (
      <div className="flex gap-1">
        {phases.map((p) => (
          <div
            key={p.num}
            className={`h-2 w-8 rounded-full ${
              p.num < phase
                ? 'bg-green-500'
                : p.num === phase
                ? 'bg-blue-500 animate-pulse'
                : 'bg-gray-200'
            }`}
            title={p.name}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflow Control Center</h1>
        <p className="text-muted-foreground mt-1">
          Submit feature requests, trigger audits, and monitor UltraPilot workflows
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Feature Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Feature Request</DialogTitle>
              <DialogDescription>
                Trigger an UltraPilot workflow to build your feature with full orchestration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select
                  value={request.type}
                  onValueChange={(value) => setRequest({ ...request, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                    <SelectItem value="bug-report">Bug Report</SelectItem>
                    <SelectItem value="audit">Audit Workflow</SelectItem>
                    <SelectItem value="refactor">Refactoring</SelectItem>
                    <SelectItem value="test">Test Suite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g., Add OAuth2 authentication"
                  value={request.title}
                  onChange={(e) => setRequest({ ...request, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe what you need in detail..."
                  rows={6}
                  value={request.description}
                  onChange={(e) => setRequest({ ...request, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select
                    value={request.priority}
                    onValueChange={(value) => setRequest({ ...request, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Repository</Label>
                  <Select
                    value={request.repository}
                    onValueChange={(value) => setRequest({ ...request, repository: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hscheema1979/ultrapilot-dashboard">ultrapilot-dashboard</SelectItem>
                      <SelectItem value="hscheema1979/control-room">control-room</SelectItem>
                      <SelectItem value="hscheema1979/hscheema1979">hscheema1979</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Workflow Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                       onClick={() => setRequest({ ...request, workflow: 'quick' })}>
                    <input
                      type="radio"
                      checked={request.workflow === 'quick'}
                      readOnly
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Quick Request</div>
                      <div className="text-sm text-muted-foreground">
                        Single agent, 30 minutes, minimal friction
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                       onClick={() => setRequest({ ...request, workflow: 'full-ultrapilot' })}>
                    <input
                      type="radio"
                      checked={request.workflow === 'full-ultrapilot'}
                      readOnly
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Full UltraPilot</div>
                      <div className="text-sm text-muted-foreground">
                        5-phase orchestration, multi-perspective reviews, production-ready
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                       onClick={() => setRequest({ ...request, workflow: 'ultra-ralph' })}>
                    <input
                      type="radio"
                      checked={request.workflow === 'ultra-ralph'}
                      readOnly
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Ultra-Ralph</div>
                      <div className="text-sm text-muted-foreground">
                        Persistent execution loop, guaranteed completion
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!request.title || !request.description || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Submit Workflow
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/playbooks')}>
          <Sparkles className="h-5 w-5 mr-2" />
          Browse Playbooks
        </Button>

        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/autoloop')}>
          <Activity className="h-5 w-5 mr-2" />
          Autoloop Status
        </Button>

        <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/traces')}>
          <Eye className="h-5 w-5 mr-2" />
          View Traces
        </Button>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Workflows
          </CardTitle>
          <CardDescription>
            Real-time monitoring of UltraPilot orchestration in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeWorkflows.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active workflows</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeWorkflows.map((workflow) => (
                <Card key={workflow.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="font-semibold">{workflow.title}</h3>
                          {getWorkflowBadge(workflow.type)}
                          <Badge variant="outline">{workflow.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {new Date(workflow.startedAt).toLocaleString()}
                          </span>
                        </div>
                        {workflow.currentActivity && (
                          <div className="text-sm text-blue-600">
                            → {workflow.currentActivity}
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
                            View Issue
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/traces`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Traces
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Phase Progress */}
                      <div>
                        <div className="text-sm font-medium mb-2">Phase Progress</div>
                        {getPhaseProgress(workflow.phase)}
                      </div>

                      {/* Current Agent Activity */}
                      {workflow.currentAgent && (
                        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {workflow.currentAgent}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {workflow.currentActivity}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            Active
                          </Badge>
                        </div>
                      )}

                      {/* Agents Involved */}
                      <div>
                        <div className="text-sm font-medium mb-2">Agents</div>
                        <div className="flex flex-wrap gap-1">
                          {workflow.agents.map((agent) => (
                            <Badge key={agent} variant="secondary" className="text-xs">
                              <Bot className="h-3 w-3 mr-1" />
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
