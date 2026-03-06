'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { LayoutDashboard, List, Timer, Package, Search, Filter, ArrowRight, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProjectsPage() {
  const router = useRouter()
  const [workflows, setWorkflows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, failed: 0 })

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/workflows?owner=hscheema1979&repo=ultrapilot-dashboard')
      const data = await response.json()
      setWorkflows(data.workflows || [])
      setStats({
        total: data.total || 0,
        running: data.running || 0,
        completed: data.completed || 0,
        failed: data.failed || 0,
      })
    } catch (error) {
      console.error('Error fetching workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">
              Workflow automation with AI agents - {stats.total} active workflows
            </p>
          </div>
          <Button onClick={() => router.push('/workflows/submit')}>
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </CardContent>
          </Card>
        </div>

        {/* View Tabs */}
        <Tabs defaultValue="board">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              LayoutDashboard
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="backlog" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Backlog
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {['pending', 'running', 'completed', 'failed'].map(status => (
                <div key={status} className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-4 capitalize">{status}</h3>
                  {loading ? (
                    <div className="space-y-2">
                      <div className="h-24 bg-muted animate-pulse rounded" />
                      <div className="h-24 bg-muted animate-pulse rounded" />
                    </div>
                  ) : (
                    workflows
                      .filter(w => w.status === status)
                      .map(workflow => {
                        const badgeVariant = status === 'completed' ? 'default' :
                                            status === 'running' ? 'default' :
                                            status === 'failed' ? 'destructive' : 'secondary'

                        return (
                          <Card key={workflow.id} className="mb-2 cursor-pointer hover:bg-accent/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant={badgeVariant}>
                                  {workflow.status}
                                </Badge>
                                <Badge variant="outline">{workflow.workflowType}</Badge>
                              </div>
                              <h4 className="font-medium text-sm mb-2">{workflow.title}</h4>
                              <p className="text-xs text-muted-foreground">{workflow.type}</p>
                            </CardContent>
                          </Card>
                        )
                      })
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center">Loading...</div>
                ) : workflows.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No workflows yet. Create your first workflow to get started.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">Title</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Priority</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Created</th>
                        <th className="text-left p-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {workflows.map(workflow => (
                        <tr key={workflow.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">{workflow.title}</td>
                          <td className="p-4">
                            <Badge variant="outline">{workflow.type}</Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                workflow.priority === 'critical' ? 'destructive' :
                                workflow.priority === 'high' ? 'default' :
                                'secondary'
                              }
                            >
                              {workflow.priority}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge
                              variant={
                                workflow.status === 'completed' ? 'default' :
                                workflow.status === 'running' ? 'default' :
                                workflow.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {workflow.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(workflow.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="ghost" onClick={() => window.open(workflow.url, '_blank')}>
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Timer view coming soon - Visualize workflow phases over time</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backlog">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Backlog view coming soon - Icebox for future work</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
