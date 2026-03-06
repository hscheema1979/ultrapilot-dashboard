"use client"

import * as React from "react"
import Link from "next/link"
import {
  FolderOpen,
  FolderKanban,
  Workflow,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  GitBranch,
  Star,
  ExternalLink,
  Play,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// Types
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp
              className={cn(
                "h-3 w-3 mr-1",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            />
            <span
              className={cn(
                "text-xs",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ActivityItem {
  id: string
  type: "workflow" | "commit" | "issue" | "pr" | "autoloop"
  title: string
  description: string
  time: string
  status?: "success" | "error" | "pending" | "running"
  link?: string
}

function getActivityIcon(type: ActivityItem["type"], status?: ActivityItem["status"]) {
  const baseClass = "h-4 w-4"

  switch (type) {
    case "workflow":
      return <Workflow className={baseClass} />
    case "commit":
      return <GitBranch className={baseClass} />
    case "issue":
      return <AlertCircle className={baseClass} />
    case "pr":
      return <GitBranch className={baseClass} />
    case "autoloop":
      return <RefreshCw className={baseClass} />
    default:
      return <Clock className={baseClass} />
  }
}

function getStatusBadge(status?: ActivityItem["status"]) {
  if (!status) return null

  const variants = {
    success: "default",
    error: "destructive",
    pending: "secondary",
    running: "outline",
  } as const

  const labels = {
    success: "Success",
    error: "Failed",
    pending: "Pending",
    running: "Running",
  }

  return (
    <Badge variant={variants[status]} className="ml-2">
      {labels[status]}
    </Badge>
  )
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [stats, setStats] = React.useState({
    totalRepos: 0,
    activeWorkflows: 0,
    openIssues: 0,
    projectsInProgress: 0,
    autoloopUptime: "0%",
  })
  const [recentActivity, setRecentActivity] = React.useState<ActivityItem[]>([])

  // Fetch dashboard data
  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch stats
        const statsResponse = await fetch("/api/dashboard/stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Fetch activity
        const activityResponse = await fetch("/api/dashboard/activity")
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData.activities || [])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your GitHub projects.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/workflows">
              <Play className="mr-2 h-4 w-4" />
              New Workflow
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Repositories"
          value={stats.totalRepos}
          description="Across all organizations"
          icon={FolderOpen}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Workflows"
          value={stats.activeWorkflows}
          description="Currently running"
          icon={Workflow}
        />
        <StatCard
          title="Open Issues"
          value={stats.openIssues}
          description="Need attention"
          icon={AlertCircle}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Projects"
          value={stats.projectsInProgress}
          description="In progress"
          icon={FolderKanban}
        />
        <StatCard
          title="Autoloop Uptime"
          value={stats.autoloopUptime}
          description="Last 30 days"
          icon={RefreshCw}
          trend={{ value: 2, isPositive: true }}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity Feed */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest workflow runs, commits, and events</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="mt-1">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            {activity.title}
                            {getStatusBadge(activity.status)}
                          </p>
                          <time className="text-xs text-muted-foreground">
                            {activity.time}
                          </time>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/repos">
                <FolderOpen className="mr-2 h-4 w-4" />
                View All Repositories
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" />
                View All Projects
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/workflows">
                <Play className="mr-2 h-4 w-4" />
                Start New Workflow
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Separator />
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/autoloop">
                <RefreshCw className="mr-2 h-4 w-4" />
                Trigger Autoloop Heartbeat
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/dashboard/metrics">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Metrics
                <ArrowRight className="ml-auto h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Performance Chart (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Performance</CardTitle>
          <CardDescription>Workflow completion rate over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization coming soon</p>
              <p className="text-sm mt-1">Integration with metrics API in progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
