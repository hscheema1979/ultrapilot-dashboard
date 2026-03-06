"use client"

import * as React from "react"
import { Workflow, Play, Clock, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function WorkflowsPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage GitHub Actions workflows</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage GitHub Actions workflows
          </p>
        </div>
        <Button>
          <Play className="mr-2 h-4 w-4" />
          Trigger Workflow
        </Button>
      </div>

      {/* Workflow Status Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">231</div>
            <p className="text-xs text-muted-foreground mt-1">93.1% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">17</div>
            <p className="text-xs text-muted-foreground mt-1">6.9% failure rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Currently active</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Monitor - Placeholder for Agent C's component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Runs
          </CardTitle>
          <CardDescription>
            Agent C's Workflows Monitor component will be integrated here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Workflow monitor coming soon</p>
              <p className="text-sm mt-1">Integration with Workflows API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
