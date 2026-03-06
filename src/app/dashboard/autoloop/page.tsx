"use client"

import * as React from "react"
import { RefreshCw, Activity, Clock, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AutoloopPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTriggering, setIsTriggering] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleTriggerHeartbeat = async () => {
    setIsTriggering(true)
    try {
      const response = await fetch("/api/autoloop/heartbeat", { method: "POST" })
      if (response.ok) {
        // Show success toast
      }
    } catch (error) {
      console.error("Failed to trigger heartbeat:", error)
    } finally {
      setTimeout(() => setIsTriggering(false), 1000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autoloop</h1>
          <p className="text-muted-foreground mt-1">Monitor autoloop status and events</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
            Monitor autoloop status and heartbeat events
          </p>
        </div>
        <Button onClick={handleTriggerHeartbeat} disabled={isTriggering}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isTriggering ? "animate-spin" : ""}`} />
          {isTriggering ? "Triggering..." : "Trigger Heartbeat"}
        </Button>
      </div>

      {/* Autoloop Status Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-lg font-bold">Active</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Last heartbeat: 2 minutes ago</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Heartbeats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Events
          </CardTitle>
          <CardDescription>Latest autoloop heartbeat events</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Heartbeat successful</p>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 ? "Just now" : `${i * 5} minutes ago`}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    {Math.floor(Math.random() * 200) + 100}ms
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Autoloop settings and intervals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Heartbeat Interval</span>
                <span className="font-medium">5 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timeout Threshold</span>
                <span className="font-medium">15 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max Retry Attempts</span>
                <span className="font-medium">3</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
