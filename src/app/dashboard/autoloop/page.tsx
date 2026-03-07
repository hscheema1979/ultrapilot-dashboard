"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { RefreshCw, Activity, Clock, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

interface HeartbeatData {
  lastHeartbeat: string | null
  health: 'healthy' | 'degraded' | 'down'
  activeWorkflows: number
  supervision: {
    scanner: { name: string; status: string; lastExecution: string | null; executionCount: number }
    validator: { name: string; status: string; lastExecution: string | null; executionCount: number }
    trigger: { name: string; status: string; lastExecution: string | null; executionCount: number }
    intervention: { name: string; status: string; lastExecution: string | null; executionCount: number }
  }
  cycleCount: number
  uptime: number
  error?: string
}

export default function AutoloopPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [heartbeat, setHeartbeat] = useState<HeartbeatData | null>(null)
  const [selectedOwner, setSelectedOwner] = useState("hscheema1979")
  const [selectedRepo, setSelectedRepo] = useState("control-room")
  const [error, setError] = useState<string | null>(null)

  const fetchHeartbeat = async () => {
    try {
      setError(null)
      const response = await fetch(`/api/v1/autoloop/heartbeat?owner=${selectedOwner}&repo=${selectedRepo}`)
      if (!response.ok) throw new Error('Failed to fetch heartbeat')

      const data = await response.json()
      setHeartbeat(data)
    } catch (err) {
      console.error('Error fetching heartbeat:', err)
      setError(err instanceof Error ? err.message : 'Failed to load heartbeat')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHeartbeat()
    const interval = setInterval(fetchHeartbeat, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [selectedOwner, selectedRepo])

  const getHealthBadge = () => {
    if (!heartbeat) return null

    switch (heartbeat.health) {
      case 'healthy':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Healthy</Badge>
      case 'degraded':
        return <Badge className="bg-yellow-600"><AlertTriangle className="h-3 w-3 mr-1" />Degraded</Badge>
      case 'down':
        return <Badge className="bg-red-600"><AlertCircle className="h-3 w-3 mr-1" />Down</Badge>
    }
  }

  const getTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autoloop</h1>
          <p className="text-muted-foreground mt-1">Monitor autoloop status and events</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autoloop</h1>
          <p className="text-muted-foreground mt-1">
            Real-time autoloop status and heartbeat monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={`${selectedOwner}/${selectedRepo}`}
            onChange={(e) => {
              const [owner, repo] = e.target.value.split('/')
              setSelectedOwner(owner)
              setSelectedRepo(repo)
            }}
            className="px-3 py-2 border rounded-md bg-background text-sm"
          >
            <option value="hscheema1979/control-room">hscheema1979/control-room</option>
            <option value="hscheema1979/ultrapilot-dashboard">hscheema1979/ultrapilot-dashboard</option>
            <option value="hscheema1979/hscheema1979">hscheema1979/hscheema1979</option>
          </select>
          <Button onClick={fetchHeartbeat}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {heartbeat && (
        <>
          {/* Autoloop Status Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {getHealthBadge()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last heartbeat: {getTimeAgo(heartbeat.lastHeartbeat)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{heartbeat.uptime.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground mt-1">Based on heartbeat age</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{heartbeat.activeWorkflows}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently being processed</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cycle Count</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{heartbeat.cycleCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Total autoloop cycles</p>
              </CardContent>
            </Card>
          </div>

          {/* Supervision Modules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Supervision Modules
              </CardTitle>
              <CardDescription>Autoloop supervision module status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(heartbeat.supervision).map(([key, module]) => (
                  <Card key={key} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{module.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Status</span>
                          <Badge variant={module.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {module.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Last Execution</span>
                          <span className="text-xs">{getTimeAgo(module.lastExecution)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Execution Count</span>
                          <span className="text-xs font-medium">{module.executionCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
