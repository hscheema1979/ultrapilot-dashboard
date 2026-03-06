'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, ExternalLink, CheckCircle, XCircle, Activity } from "lucide-react"

export default function GitHubIntegrationPage() {
  const [status, setStatus] = useState<any>(null)
  const [boards, setBoards] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchGitHubData()
    const interval = setInterval(fetchGitHubData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  async function fetchGitHubData() {
    try {
      setLoading(true)
      const [statusRes, boardsRes, activityRes] = await Promise.all([
        fetch('/api/github/status'),
        fetch('/api/github/boards'),
        fetch('/api/github/activity')
      ])

      const statusData = await statusRes.json()
      const boardsData = await boardsRes.json()
      const activityData = await activityRes.json()

      setStatus(statusData)
      setBoards(boardsData.boards || [])
      setRecentActivity(activityData.activity || [])
    } catch (error) {
      console.error('Error fetching GitHub data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch('/api/github/sync', { method: 'POST' })
      await fetchGitHubData()
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">GitHub Integration</h1>
            <p className="text-muted-foreground">
              Manage GitHub App connection and project boards
            </p>
          </div>
          <Button onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Repository</p>
                <p className="font-semibold">{status?.repository || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">App</p>
                <p className="font-semibold">{status?.appName || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Installation</p>
                <div className="flex items-center gap-2">
                  {status?.installed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {status?.installed ? 'Active' : 'Not Installed'}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Webhooks</p>
                <div className="flex items-center gap-2">
                  {status?.webhooksConnected ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="font-semibold">
                    {status?.webhooksConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
            </div>

            {status?.lastSync && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="font-semibold">{new Date(status.lastSync).toLocaleString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold">{status?.issuesOpen || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open PRs</p>
                  <p className="text-2xl font-bold">{status?.prsOpen || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Closed Issues</p>
                  <p className="text-2xl font-bold">{status?.issuesClosed || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Boards */}
        <Card>
          <CardHeader>
            <CardTitle>Project Boards</CardTitle>
            <CardDescription>Kanban boards for project management</CardDescription>
          </CardHeader>
          <CardContent>
            {boards.length === 0 ? (
              <p className="text-muted-foreground">No project boards found</p>
            ) : (
              <div className="space-y-3">
                {boards.map(board => (
                  <div key={board.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{board.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {board.columns?.length || 0} columns • {board.issuesCount || 0} issues
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={board.state === 'open' ? 'default' : 'secondary'}>
                        {board.state}
                      </Badge>
                      <Button size="sm" variant="outline" asChild>
                        <a href={board.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events from GitHub</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 20).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      activity.type === 'issue' ? 'bg-blue-500' :
                      activity.type === 'pr' ? 'bg-green-500' :
                      activity.type === 'comment' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-muted-foreground">
                        {activity.author} • {activity.type} • {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <Badge variant="outline">{activity.repo}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}
