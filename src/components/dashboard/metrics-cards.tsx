'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { useMetrics } from "@/hooks/use-dashboard-data"
import { ErrorBoundary } from "@/components/error-boundary"

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  change: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{change}</p>
      </CardContent>
    </Card>
  )
}

function MetricsCardContent() {
  const { isLoading, currentProject } = useProject()
  const { data, loading, error } = useMetrics()

  // Show skeleton while project context is loading
  if (isLoading || loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    )
  }

  // Show message if no project selected
  if (!currentProject) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No project selected. Please select a project to view metrics.
        </AlertDescription>
      </Alert>
    )
  }

  // Show error state if metrics fetch failed
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load metrics: {error}. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  // Show empty state if no data available
  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Workflows"
          value="--"
          change="No data"
          icon={Activity}
          color="text-muted-foreground"
        />
        <MetricCard
          title="Running Now"
          value="--"
          change="No data"
          icon={Clock}
          color="text-muted-foreground"
        />
        <MetricCard
          title="Successful Today"
          value="--"
          change="No data"
          icon={CheckCircle}
          color="text-muted-foreground"
        />
        <MetricCard
          title="Failed Today"
          value="--"
          change="No data"
          icon={AlertCircle}
          color="text-muted-foreground"
        />
      </div>
    )
  }

  // Display actual metrics
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Workflows"
        value={data.workflows.total}
        change={data.workflows.change}
        icon={Activity}
        color="text-status-info"
      />
      <MetricCard
        title="Running Now"
        value={data.workflows.runningNow}
        change={`${data.workflows.active} active`}
        icon={Clock}
        color="text-status-warning"
      />
      <MetricCard
        title="Successful Today"
        value={data.workflows.successfulToday}
        change={`${data.workflows.successRate} success rate`}
        icon={CheckCircle}
        color="text-status-success"
      />
      <MetricCard
        title="Failed Today"
        value={data.workflows.failedToday}
        change={data.workflows.failedToday > 0 ? "Needs attention" : "All good"}
        icon={AlertCircle}
        color={data.workflows.failedToday > 0 ? "text-status-error" : "text-status-success"}
      />
    </div>
  )
}

export function MetricsCards() {
  return (
    <ErrorBoundary>
      <MetricsCardContent />
    </ErrorBoundary>
  )
}
