'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Pause, CheckCircle, XCircle, Clock, Zap, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface Phase {
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  icon: string
  startedAt?: string
  completedAt?: string
}

interface WorkflowDetail {
  id: string
  title: string
  description: string
  type: string
  priority: string
  workflowType: string
  status: string
  currentPhase?: string
  progress: number
  githubIssue?: {
    number: number
    url: string
  }
  createdAt: string
  updatedAt: string
}

export default function WorkflowDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null)
  const [phases, setPhases] = useState<Phase[]>([
    { name: 'Initiation', status: 'completed', icon: 'Zap' },
    { name: 'Requirements', status: 'pending', icon: 'Search' },
    { name: 'Architecture', status: 'pending', icon: 'Architecture' },
    { name: 'Planning', status: 'pending', icon: 'Calendar' },
    { name: 'Execution', status: 'pending', icon: 'Play' },
    { name: 'Verification', status: 'pending', icon: 'CheckCircle' },
  ])

  useEffect(() => {
    // Fetch workflow details
    fetch(`/api/workflows/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          router.push('/projects')
        } else {
          setWorkflow(data)
        }
      })
      .catch(err => {
        console.error('Error fetching workflow:', err)
        router.push('/projects')
      })

    // Set up polling for updates
    const interval = setInterval(() => {
      fetch(`/api/workflows/${params.id}`)
        .then(res => res.json())
        .then(data => setWorkflow(data))
    }, 5000)

    return () => clearInterval(interval)
  }, [params.id])

  if (!workflow) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading workflow details...</p>
        </div>
      </DashboardLayout>
    )
  }

  const getPhaseIcon = (phaseName: string) => {
    const phase: any = phases.find(p => p.name === phaseName)
    return phase?.icon || 'Zap'
  }

  const getPhaseStatus = (phaseName: string) => {
    const phase: any = phases.find(p => p.name === phaseName)
    return phase?.status || 'pending'
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </div>

        {/* Title */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{workflow.title}</h1>
              <Badge variant={workflow.priority === 'critical' ? 'destructive' : 'default'}>
                {workflow.priority}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{workflow.type}</Badge>
              <Badge variant="outline">{workflow.workflowType}</Badge>
              <span>•</span>
              <span>Created {new Date(workflow.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {workflow.status === 'pending' && (
              <Button onClick={() => window.open(workflow.githubIssue?.url, '_blank')}>
                View on GitHub
              </Button>
            )}
            {workflow.status === 'running' && (
              <Button variant="secondary">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
          </div>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{workflow.progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${workflow.progress}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{phases.filter(p => p.status === 'completed').length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{phases.filter(p => p.status === 'in-progress').length}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{phases.filter(p => p.status === 'pending').length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases.map((phase, index) => (
                <div key={phase.name} className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${phase.status === 'completed' ? 'bg-green-100 text-green-700' :
                      phase.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      phase.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-500'}
                  `}>
                    {phase.status === 'completed' && <CheckCircle className="h-6 w-6" />}
                    {phase.status === 'in-progress' && <Clock className="h-6 w-6 animate-pulse" />}
                    {phase.status === 'failed' && <XCircle className="h-6 w-6" />}
                    {phase.status === 'pending' && <Zap className="h-6 w-6" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{phase.name}</h3>
                      <Badge variant="outline" className="capitalize">
                        {phase.status}
                      </Badge>
                    </div>
                    {phase.status === 'completed' && phase.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(phase.completedAt).toLocaleString()}
                      </p>
                    )}
                    {phase.status === 'in-progress' && phase.startedAt && (
                      <p className="text-xs text-muted-foreground">
                        Started {new Date(phase.startedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Activity */}
        {workflow.status === 'running' && (
          <Card>
            <CardHeader>
              <CardTitle>Current Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">ultra:architect</p>
                  <p className="text-sm text-muted-foreground">Processing requirements phase</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-mono">{`> Analyzing user requirements`}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{workflow.description}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
