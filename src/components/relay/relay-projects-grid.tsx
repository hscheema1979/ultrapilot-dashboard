'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Users, Cpu, ExternalLink, Loader2 } from "lucide-react"

interface RelayProject {
  id: string
  name: string
  path: string
  status: 'active' | 'paused' | 'error'
  sessions: number
  clients: number
}

export function RelayProjectsGrid() {
  const [projects, setProjects] = useState<RelayProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/relay/projects')
        if (!response.ok) {
          throw new Error('Failed to fetch projects')
        }

        const data = await response.json()
        setProjects(data.projects || [])
      } catch (err) {
        console.error('Error fetching Relay projects:', err)
        setError(err instanceof Error ? err.message : 'Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()

    // Refresh every 30 seconds
    const interval = setInterval(fetchProjects, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusBadge = (status: RelayProject['status']) => {
    const variants = {
      active: 'bg-status-success text-status-success-foreground hover:bg-status-success/90',
      paused: 'bg-status-warning text-status-warning-foreground hover:bg-status-warning/90',
      error: 'bg-status-error text-status-error-foreground hover:bg-status-error/90',
    }

    const labels = {
      active: 'Active',
      paused: 'Paused',
      error: 'Error',
    }

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading Relay projects...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No Relay projects found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  project.status === 'active' ? 'bg-status-success/10' : 'bg-muted'
                }`}>
                  <Zap className={`h-5 w-5 ${
                    project.status === 'active' ? 'text-status-success' : 'text-muted-foreground'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{project.path}</p>
                </div>
              </div>
              {getStatusBadge(project.status)}
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{project.sessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{project.clients}</p>
                    <p className="text-xs text-muted-foreground">Clients</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => window.open(`http://localhost:3002/p/${project.id}/`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Relay
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
