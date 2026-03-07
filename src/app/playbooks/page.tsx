"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  BookOpen,
  Play,
  Rocket,
  Activity,
  Settings,
  ChevronRight,
  Search,
  Clock,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  User,
  Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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
  category: string
  file: string
  parameters?: string[]
  githubWorkflow?: string
  estimatedDuration?: string
}

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([])
  const [filteredPlaybooks, setFilteredPlaybooks] = useState<Playbook[]>([])
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlaybooks()
  }, [])

  const fetchPlaybooks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // REAL playbook data from UltraPilot skills
      const realPlaybooks: Playbook[] = [
        {
          id: "ultrapilot",
          name: "UltraPilot - Strategic Orchestration",
          description: "Strategic orchestration system: Requirements → Architecture → Planning with Multi-Perspective Review, then hands off to Ultra-Lead for operational execution",
          category: "Core Workflow",
          file: "~/.claude/skills/ultrapilot/SKILL.md",
          githubWorkflow: ".github/workflows/ultrapilot.yml",
          parameters: ["task (required)", "workspace (optional)", "direct (optional)"],
          estimatedDuration: "Hours to days"
        },
        {
          id: "ultra-lead",
          name: "Ultra-Lead - Planning & Execution",
          description: "Persistent planning orchestrator: Phase 0 (Requirements + Architecture) → Phase 1 (Planning + Review) → Task Decomposition → AutoloopDaemon coordination",
          category: "Core Workflow",
          file: "~/.claude/skills/ultra-lead/SKILL.md",
          githubWorkflow: ".github/workflows/ultra-lead.yml",
          parameters: ["task (required)", "mode (planning|execution|full)", "workspace (optional)"],
          estimatedDuration: "Hours"
        },
        {
          id: "ultra-autoloop",
          name: "Ultra-Autoloop - Continuous Execution",
          description: "Continuous heartbeat daemon (60s cycle): Processes task queues, coordinates agents via WorkingManager, executes routines. 'The boulder never stops'",
          category: "Core Workflow",
          file: "~/.claude/skills/ultra-autoloop/SKILL.md",
          githubWorkflow: ".github/workflows/ultra-autoloop.yml",
          parameters: ["action (start|stop|status|heartbeat)", "cycles (optional)", "workspace (optional)"],
          estimatedDuration: "Continuous"
        }
      ]

      setPlaybooks(realPlaybooks)
      setFilteredPlaybooks(realPlaybooks)
    } catch (err) {
      console.error('Error loading playbooks:', err)
      setError(err instanceof Error ? err.message : 'Failed to load playbooks')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter playbooks
  useEffect(() => {
    let filtered = playbooks

    if (searchQuery) {
      filtered = filtered.filter(pb =>
        pb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pb.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(pb => pb.category === categoryFilter)
    }

    setFilteredPlaybooks(filtered)
  }, [playbooks, searchQuery, categoryFilter])

  const handleExecutePlaybook = async (playbook: Playbook) => {
    setIsExecuting(true)
    try {
      // Trigger GitHub workflow
      if (playbook.githubWorkflow) {
        const response = await fetch('/api/v1/playbooks/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playbookId: playbook.id,
            playbookName: playbook.name,
            workflow: playbook.githubWorkflow,
          })
        })

        if (!response.ok) throw new Error('Failed to execute playbook')

        const data = await response.json()
        window.open(data.workflowUrl, '_blank')
      }
    } catch (err) {
      console.error('Error executing playbook:', err)
    } finally {
      setIsExecuting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core Workflow':
        return <Zap className="h-5 w-5 text-yellow-600" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UltraPilot Workflows</h1>
          <p className="text-muted-foreground mt-1">
            Execute strategic planning and continuous automation workflows
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">UltraPilot Workflows</h1>
        <p className="text-muted-foreground mt-1">
          Strategic orchestration and continuous automation workflows
        </p>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Core Workflow">Core Workflows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Playbooks Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlaybooks.map((playbook) => (
          <Card key={playbook.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(playbook.category)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{playbook.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{playbook.category}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{playbook.description}</p>

              {playbook.parameters && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Settings className="h-4 w-4" />
                    <span>Parameters</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {playbook.parameters.map((param, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {param}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {playbook.estimatedDuration && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{playbook.estimatedDuration}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleExecutePlaybook(playbook)}
                  disabled={isExecuting}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(`https://github.com/hscheema1979/hscheema1979/blob/main/${playbook.githubWorkflow}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlaybooks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No workflows found matching your search</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
