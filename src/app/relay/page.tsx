'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Users, Cpu, RefreshCw, ExternalLink, ArrowRight } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface RelayProject {
  id: string
  name: string
  path: string
  status: 'active' | 'paused' | 'error'
  sessions: number
  clients: number
}

export default function RelayPage() {
  const [projects, setProjects] = useState<RelayProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
    const interval = setInterval(fetchProjects, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  async function fetchProjects() {
    try {
      setLoading(true)
      const response = await fetch('/api/relay/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error('Error fetching Relay projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: RelayProject['status']) => {
    const variants = {
      active: 'bg-green-600 hover:bg-green-700',
      paused: 'bg-yellow-600 hover:bg-yellow-700',
      error: 'bg-red-600 hover:bg-red-700',
    }

    const labels = {
      active: 'Active',
      paused: 'Paused',
      error: 'Error',
    }

    const icons = {
      active: '⚡',
      paused: '⏸',
      error: '🔴',
    }

    return (
      <Badge className={variants[status]}>
        {icons[status]} {labels[status]}
      </Badge>
    )
  }

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalSessions = projects.reduce((sum, p) => sum + p.sessions, 0)
  const totalClients = projects.reduce((sum, p) => sum + p.clients, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="h-8 w-8 text-orange-500" />
              <h2 className="text-3xl font-bold tracking-tight">Claude Relay</h2>
              <Badge variant="outline" className="ml-2">
                Via Nginx Proxy
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Chat interface and session management - Access via nginx proxy
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProjects}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{totalProjects}</p>
                </div>
                <Zap className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Now</p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{totalSessions}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Connected Clients</p>
                  <p className="text-2xl font-bold">{totalClients}</p>
                </div>
                <Cpu className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Relay Chat Card */}
        <Card className="border-orange-200 dark:border-orange-900">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Open Relay Chat Interface</h3>
                  <p className="text-muted-foreground">
                    Access the full Relay chat interface with Claude Code CLI integration
                  </p>
                </div>
              </div>
              <a
                href="/relay"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2"
              >
                Open Relay Interface
                <ExternalLink className="h-5 w-5 ml-2" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
              <span className="text-muted-foreground">Loading Relay projects...</span>
            </CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No Relay projects found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure Relay is running on port 3002
              </p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4">All Projects</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="h-12 w-12 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: project.status === 'active' ? '#dcfce7' : '#f3f4f6',
                          }}
                        >
                          <Zap className={`h-6 w-6 ${
                            project.status === 'active' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {project.path}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xl font-bold">{project.sessions}</p>
                          <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <Cpu className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-xl font-bold">{project.clients}</p>
                          <p className="text-xs text-muted-foreground">Clients</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(`/p/${project.id}/`, '_blank')}
                      >
                        Open Chat
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Nginx Proxy Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Relay is accessible via nginx reverse proxy at <code className="bg-muted px-1 py-0.5 rounded">/relay</code>.
                  The dashboard on port 3000 shows project metrics, while clicking "Open Relay" takes you to the full Relay interface
                  on port 3002 through the nginx proxy. This provides clean URL-based access to all Relay functionality.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span>Nginx proxy: /relay → localhost:3002</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    <span>Auto-refresh every 5s</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
