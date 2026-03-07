'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Code, Settings, ExternalLink, Activity } from "lucide-react"

export default function AgentsMonitorPage() {
  const [agents, setAgents] = useState<any[]>([])
  const [selectedAgent, setSelectedAgent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 15000) // Refresh every 15s
    return () => clearInterval(interval)
  }, [])

  async function fetchAgents() {
    try {
      setLoading(true)
      const res = await fetch('/api/agents/active')
      const data = await res.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Error fetching agents:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents Monitor</h1>
          <p className="text-muted-foreground">
            View and manage active ultra:architect, ultra:team-lead, and execution agents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Agents</p>
                  <p className="text-2xl font-bold">{agents.length}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Orchestrators</p>
                  <p className="text-2xl font-bold">
                    {agents.filter(a => a.role === 'orchestrator').length}
                  </p>
                </div>
                <Settings className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Executors</p>
                  <p className="text-2xl font-bold">
                    {agents.filter(a => a.role === 'executor').length}
                  </p>
                </div>
                <Code className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">
                    {new Set(agents.flatMap(a => a.projects || [])).size}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Agents Grid */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No active agents</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {agents.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={() => setSelectedAgent(agent)}
              />
            ))}
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <AgentDetailModal
            agent={selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </div>
    </DashboardLayout>
  )
}

function AgentCard({ agent, onClick }: { agent: any; onClick: () => void }) {
  const isActive = agent.status === 'active'

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{agent.name}</h3>
              <Badge variant={isActive ? 'default' : 'secondary'}>
                <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'} mr-2`} />
                {agent.status}
              </Badge>
              <Badge variant="outline">{agent.role}</Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {agent.description}
            </p>

            {agent.activeProject && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Active Project:</p>
                <p className="text-sm">{agent.activeProject}</p>
                {agent.currentPhase && (
                  <p className="text-xs text-muted-foreground">
                    Phase: {agent.currentPhase}
                  </p>
                )}
              </div>
            )}

            {agent.projects && agent.projects.length > 1 && (
              <div className="mb-3">
                <p className="text-sm font-medium mb-1">All Projects:</p>
                <ul className="text-sm text-muted-foreground">
                  {agent.projects.map((project: string, i: number) => (
                    <li key={i}>• {project}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Since: {formatDuration(agent.started)}</span>
              {agent.progress !== undefined && (
                <span>Progress: {agent.progress}%</span>
              )}
            </div>

            {agent.progress !== undefined && (
              <Progress value={agent.progress} className="mt-3" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
          <Button size="sm" variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </Button>
          {agent.githubUrl && (
            <Button size="sm" variant="outline" asChild>
              <a href={agent.githubUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Work
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AgentDetailModal({ agent, onClose }: { agent: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                {agent.name}
                <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
                  {agent.status}
                </Badge>
              </CardTitle>
              <CardDescription>{agent.role}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Activity */}
          <div>
            <h3 className="font-semibold mb-3">Current Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium">{agent.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Since:</span>
                <span className="font-medium">{formatDuration(agent.started)}</span>
              </div>
              {agent.activeProject && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">{agent.activeProject}</span>
                  </div>
                  {agent.currentPhase && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phase:</span>
                      <span className="font-medium">{agent.currentPhase}</span>
                    </div>
                  )}
                  {agent.task && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Task:</span>
                      <span className="font-medium">{agent.task}</span>
                    </div>
                  )}
                  {agent.progress !== undefined && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{agent.progress}%</span>
                      </div>
                      <Progress value={agent.progress} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Projects */}
          {agent.projects && agent.projects.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Projects</h3>
              <div className="space-y-2">
                {agent.projects.map((project: string, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{project}</span>
                    {agent.activeProject === project && (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {agent.recentActivity && agent.recentActivity.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {agent.recentActivity.map((activity: any, i: number) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          {agent.metrics && (
            <div>
              <h3 className="font-semibold mb-3">Performance</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold">{agent.metrics.tasksCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Task Time</p>
                  <p className="text-2xl font-bold">{agent.metrics.avgTaskTime || '-'}m</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold">{agent.metrics.successRate || 0}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Errors</p>
                  <p className="text-2xl font-bold">{agent.metrics.errors || 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Adjust Settings
            </Button>
            {agent.githubUrl && (
              <Button size="sm" variant="outline" asChild>
                <a href={agent.githubUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on GitHub
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatDuration(timestamp: string): string {
  const minutes = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}
