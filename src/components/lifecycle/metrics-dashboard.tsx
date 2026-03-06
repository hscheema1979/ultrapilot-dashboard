'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Bug, Bot, Star, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ProjectMetrics } from "@/lib/lifecycle-types"

interface MetricsDashboardProps {
  metrics: ProjectMetrics[]
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  // Calculate aggregate metrics
  const avgCycleTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.cycleTime, 0) / metrics.length
    : 0

  const avgBugRate = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.bugRate, 0) / metrics.length
    : 0

  const avgSatisfaction = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.satisfaction, 0) / metrics.length
    : 0

  const activeAgents = new Set(metrics.flatMap(m => m.agentsInvolved)).size

  const successfulProjects = metrics.filter(m => m.status === 'success').length
  const successRate = metrics.length > 0 ? (successfulProjects / metrics.length) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Performance Metrics</h2>
        <p className="text-muted-foreground">Across {metrics.length} projects</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Average Cycle Time */}
        <MetricCard
          title="Avg Cycle Time"
          value={formatDuration(avgCycleTime)}
          icon={Clock}
          trend={calculateTrend(metrics, 'cycleTime')}
          description="Time from request to deployment"
        />

        {/* Success Rate */}
        <MetricCard
          title="Success Rate"
          value={`${successRate.toFixed(1)}%`}
          icon={Star}
          trend={calculateSuccessTrend(metrics)}
          description={`${successfulProjects}/${metrics.length} projects successful`}
        />

        {/* Bug Rate */}
        <MetricCard
          title="Bug Rate"
          value={`${avgBugRate.toFixed(1)}%`}
          icon={Bug}
          trend={calculateTrend(metrics, 'bugRate', 'lower')}
          description="Average bugs found post-deployment"
        />

        {/* Active Agents */}
        <MetricCard
          title="Active Agents"
          value={activeAgents.toString()}
          icon={Bot}
          description="Unique agents participating"
        />
      </div>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Test Coverage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Test Coverage</span>
                <span className="font-semibold">
                  {(metrics.reduce((sum, m) => sum + m.testCoverage, 0) / metrics.length).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${metrics.reduce((sum, m) => sum + m.testCoverage, 0) / metrics.length}%`
                  }}
                />
              </div>
            </div>

            {/* Code Quality */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Code Quality</span>
                <span className="font-semibold">
                  {(metrics.reduce((sum, m) => sum + m.codeQualityScore, 0) / metrics.length).toFixed(1)}/100
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${metrics.reduce((sum, m) => sum + m.codeQualityScore, 0) / metrics.length}%`
                  }}
                />
              </div>
            </div>

            {/* User Satisfaction */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Satisfaction</span>
                <span className="font-semibold">
                  {avgSatisfaction.toFixed(1)}/5.0
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${(avgSatisfaction / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {getAgentDistribution(metrics).map(([agent, data]) => (
              <div key={agent} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{agent}</span>
                  <span className="text-muted-foreground">
                    {data.count} projects • {formatDuration(data.totalTime)}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${(data.count / metrics.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down' | 'neutral'
  description?: string
}

function MetricCard({ title, value, icon: Icon, trend, description }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {trend && (
              <Badge variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}>
                {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                {trend === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function calculateTrend(
  metrics: ProjectMetrics[],
  key: keyof ProjectMetrics,
  direction: 'higher' | 'lower' = 'lower'
): 'up' | 'down' | 'neutral' {
  if (metrics.length < 2) return 'neutral'

  const recent = metrics.slice(0, Math.ceil(metrics.length / 2))
  const older = metrics.slice(Math.ceil(metrics.length / 2))

  const recentAvg = recent.reduce((sum, m) => sum + (m[key] as number), 0) / recent.length
  const olderAvg = older.reduce((sum, m) => sum + (m[key] as number), 0) / older.length

  const diff = ((recentAvg - olderAvg) / olderAvg) * 100

  if (Math.abs(diff) < 5) return 'neutral'
  if (direction === 'higher') return diff > 0 ? 'up' : 'down'
  return diff < 0 ? 'up' : 'down'
}

function calculateSuccessTrend(metrics: ProjectMetrics[]): 'up' | 'down' | 'neutral' {
  if (metrics.length < 2) return 'neutral'

  const recentSuccess = metrics.slice(0, Math.ceil(metrics.length / 2))
    .filter(m => m.status === 'success').length

  const olderSuccess = metrics.slice(Math.ceil(metrics.length / 2))
    .filter(m => m.status === 'success').length

  const recentRate = recentSuccess / Math.ceil(metrics.length / 2)
  const olderRate = olderSuccess / Math.floor(metrics.length / 2)

  const diff = ((recentRate - olderRate) / olderRate) * 100

  if (Math.abs(diff) < 5) return 'neutral'
  return diff > 0 ? 'up' : 'down'
}

function getAgentDistribution(metrics: ProjectMetrics[]): Array<[string, { count: number; totalTime: number }]> {
  const distribution: Record<string, { count: number; totalTime: number }> = {}

  metrics.forEach(metric => {
    metric.agentsInvolved.forEach(agent => {
      if (!distribution[agent]) {
        distribution[agent] = { count: 0, totalTime: 0 }
      }
      distribution[agent].count++
      distribution[agent].totalTime += metric.agentTime[agent] || 0
    })
  })

  return Object.entries(distribution).sort((a, b) => b[1].count - a[1].count)
}
