'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Zap, Users, Cpu, Clock } from "lucide-react"

interface RelayMetrics {
  totalProjects: number
  activeProjects: number
  totalSessions: number
  totalClients: number
  lastUpdated: string
}

export function RelayMetrics() {
  const [metrics, setMetrics] = useState<RelayMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/relay/projects')
        if (response.ok) {
          const data = await response.json()
          const projects = data.projects || []

          const totalProjects = projects.length
          const activeProjects = projects.filter((p: any) => p.status === 'active').length
          const totalSessions = projects.reduce((sum: number, p: any) => sum + p.sessions, 0)
          const totalClients = projects.reduce((sum: number, p: any) => sum + p.clients, 0)

          setMetrics({
            totalProjects,
            activeProjects,
            totalSessions,
            totalClients,
            lastUpdated: new Date().toLocaleTimeString(),
          })
        }
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()

    // Update every 30 seconds
    const interval = setInterval(fetchMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-2"></div>
                <div className="h-8 w-16 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl font-bold">{metrics.totalProjects}</p>
            </div>
            <Zap className="h-8 w-8 text-status-warning/20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Now</p>
              <p className="text-2xl font-bold">{metrics.activeProjects}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-status-success/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-status-success" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold">{metrics.totalSessions}</p>
            </div>
            <Users className="h-8 w-8 text-status-info/20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Connected Clients</p>
              <p className="text-2xl font-bold">{metrics.totalClients}</p>
            </div>
            <Cpu className="h-8 w-8 text-status-warning/20" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
