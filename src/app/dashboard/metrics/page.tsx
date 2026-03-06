"use client"

import * as React from "react"
import { BarChart3, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MetricsPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and analytics</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
        <p className="text-muted-foreground mt-1">
          Performance metrics and analytics
        </p>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142ms</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-green-500">12% faster</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-green-500">8% increase</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.12%</div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-green-500">0.05% decrease</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Request Volume
            </CardTitle>
            <CardDescription>API requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>Latency percentiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
              <div className="text-center text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Detailed performance breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "GitHub API Latency", value: "89ms", status: "good" },
              { name: "Database Query Time", value: "12ms", status: "good" },
              { name: "Workflow Execution", value: "2.3s", status: "good" },
              { name: "Webhook Processing", value: "45ms", status: "good" },
              { name: "Cache Hit Rate", value: "94.2%", status: "excellent" },
            ].map((metric, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{metric.value}</span>
                  <div className={`h-2 w-2 rounded-full ${
                    metric.status === "excellent" ? "bg-green-500" : "bg-blue-500"
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
