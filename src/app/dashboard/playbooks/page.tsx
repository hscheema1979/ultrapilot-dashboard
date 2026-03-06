"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Play,
  Settings,
  Code,
  Activity,
  Rocket,
  TrendingUp,
  Shield,
  ChevronRight,
  Search,
  Filter,
  Clock,
  User,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Playbook {
  id: string
  name: string
  description: string
  workspace: "ultrapilot" | "trading-at"
  category: string
  defaultAgent: string
  estimatedDuration: string
  phase: number
  parameters: PlaybookParameter[]
  file: string
}

interface PlaybookParameter {
  name: string
  type: string
  required: boolean
  description: string
  default?: string
  options?: string[]
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [filteredPlaybooks, setFilteredPlaybooks] = useState<Playbook[]>([])
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [workspaceFilter, setWorkspaceFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isExecuting, setIsExecuting] = useState(false)

  // Mock playbook data (in real implementation, fetch from API)
  useEffect(() => {
    const mockPlaybooks: Playbook[] = [
      {
        id: "ultrapilot-dev-feature",
        name: "Create New Feature",
        description: "Create a new feature branch and scaffold feature files",
        workspace: "ultrapilot",
        category: "development",
        defaultAgent: "ultra:executor",
        estimatedDuration: "15 minutes",
        phase: 1,
        parameters: [
          { name: "feature_name", type: "string", required: true, description: "Name of the feature" },
          { name: "feature_type", type: "select", required: true, description: "Type of feature", options: ["frontend", "backend", "full-stack"] },
          { name: "repo", type: "string", required: true, description: "Repository name", default: "ultrapilot-dashboard" }
        ],
        file: "ultrapilot/development/create-new-feature.md"
      },
      {
        id: "ultrapilot-ops-health",
        name: "System Health Check",
        description: "Comprehensive system health check for UltraPilot dashboard",
        workspace: "ultrapilot",
        category: "operations",
        defaultAgent: "ultra:autoloop-coordinator",
        estimatedDuration: "2 minutes",
        phase: 0,
        parameters: [],
        file: "ultrapilot/operations/health-check.md"
      },
      {
        id: "ultrapilot-deploy-dashboard",
        name: "Deploy Dashboard to Production",
        description: "Deploy UltraPilot dashboard to production with zero-downtime",
        workspace: "ultrapilot",
        category: "deployment",
        defaultAgent: "ultra:executor",
        estimatedDuration: "10 minutes",
        phase: 2,
        parameters: [
          { name: "environment", type: "select", required: true, description: "Deployment environment", options: ["staging", "production"] },
          { name: "branch", type: "string", required: true, description: "Git branch to deploy", default: "main" }
        ],
        file: "ultrapilot/deployment/deploy-dashboard.md"
      },
      {
        id: "trading-execute-strategy",
        name: "Execute Trading Strategy",
        description: "Execute a trading strategy with risk management",
        workspace: "trading-at",
        category: "trading",
        defaultAgent: "trading:executor",
        estimatedDuration: "5 minutes",
        phase: 2,
        parameters: [
          { name: "symbol", type: "string", required: true, description: "Trading symbol" },
          { name: "strategy", type: "select", required: true, description: "Trading strategy", options: ["momentum", "mean-reversion", "breakout"] },
          { name: "side", type: "select", required: true, description: "Trade direction", options: ["buy", "sell"] },
          { name: "quantity", type: "integer", required: true, description: "Number of shares", default: "100" }
        ],
        file: "trading-at/trading/execute-trade.md"
      },
      {
        id: "trading-portfolio-health",
        name: "Portfolio Health Monitor",
        description: "Monitor portfolio health and risk metrics",
        workspace: "trading-at",
        category: "monitoring",
        defaultAgent: "trading:monitor",
        estimatedDuration: "3 minutes",
        phase: 0,
        parameters: [
          { name: "alert_threshold", type: "float", required: false, description: "Loss percentage for alerts", default: "5.0" }
        ],
        file: "trading-at/monitoring/portfolio-health.md"
      }
    ]

    setPlaybooks(mockPlaybooks)
    setFilteredPlaybooks(mockPlaybooks)
  }, [])

  // Filter playbooks
  useEffect(() => {
    let filtered = playbooks

    if (searchQuery) {
      filtered = filtered.filter(pb =>
        pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pb.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (workspaceFilter !== "all") {
      filtered = filtered.filter(pb => pb.workspace === workspaceFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(pb => pb.category === categoryFilter)
    }

    setFilteredPlaybooks(filtered)
  }, [searchQuery, workspaceFilter, categoryFilter, playbooks])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "development": return <Code className="h-4 w-4" />
      case "operations": return <Settings className="h-4 w-4" />
      case "deployment": return <Rocket className="h-4 w-4" />
      case "monitoring": return <Activity className="h-4 w-4" />
      case "trading": return <TrendingUp className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getWorkspaceColor = (workspace: string) => {
    return workspace === "ultrapilot"
      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
      : "bg-green-500/10 text-green-600 border-green-500/20"
  }

  const handleExecute = async (playbook: Playbook) => {
    setIsExecuting(true)

    try {
      // Create GitHub issue for playbook execution
      const response = await fetch('/api/v1/playbooks/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookId: playbook.id,
          playbookName: playbook.name,
          workspace: playbook.workspace,
          parameters: {} // Would be populated from form
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to workflows page to monitor execution
        window.location.href = `/dashboard/workflows`
      }
    } catch (error) {
      console.error('Error executing playbook:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Playbooks</h1>
          <p className="text-muted-foreground mt-1">
            Browse and execute predefined workflow templates
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {playbooks.length} playbooks available
        </Badge>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playbooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={workspaceFilter} onValueChange={setWorkspaceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workspaces</SelectItem>
            <SelectItem value="ultrapilot">UltraPilot (VPS5)</SelectItem>
            <SelectItem value="trading-at">Trading-at (VPS4)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="deployment">Deployment</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="trading">Trading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Playbooks Grid */}
      {filteredPlaybooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No playbooks found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlaybooks.map((playbook) => (
            <Card
              key={playbook.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPlaybook(playbook)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(playbook.category)}
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={getWorkspaceColor(playbook.workspace)}>
                    {playbook.workspace}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {playbook.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {playbook.estimatedDuration}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      {playbook.defaultAgent}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {playbook.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Phase {playbook.phase}
                    </Badge>
                    {playbook.parameters.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {playbook.parameters.length} params
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExecute(playbook)
                    }}
                    disabled={isExecuting}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Playbook Detail Modal */}
      {selectedPlaybook && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlaybook(null)}
        >
          <div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedPlaybook.name}</h2>
                  <p className="text-muted-foreground mt-1">{selectedPlaybook.description}</p>
                </div>
                <Badge variant="outline" className={getWorkspaceColor(selectedPlaybook.workspace)}>
                  {selectedPlaybook.workspace}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">{selectedPlaybook.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Default Agent</p>
                    <p className="font-medium">{selectedPlaybook.defaultAgent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{selectedPlaybook.estimatedDuration}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phase</p>
                    <p className="font-medium">{selectedPlaybook.phase}</p>
                  </div>
                </div>

                {selectedPlaybook.parameters.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Parameters</h3>
                    <div className="space-y-2">
                      {selectedPlaybook.parameters.map((param) => (
                        <div key={param.name} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{param.name}</p>
                              <p className="text-sm text-muted-foreground">{param.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {param.type}
                              </Badge>
                              {param.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                          </div>
                          {param.options && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {param.options.map((option) => (
                                <Badge key={option} variant="secondary" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleExecute(selectedPlaybook)}
                    disabled={isExecuting}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Playbook
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedPlaybook(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
