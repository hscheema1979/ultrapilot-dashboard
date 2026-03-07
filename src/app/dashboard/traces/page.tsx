"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  GitCommit,
  GitPullRequest,
  GitBranch,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  Eye,
  Search,
  Filter,
  FileText
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

interface GitHubTrace {
  traceId: string
  type: 'commit' | 'pr' | 'issue' | 'workflow'
  title: string
  description?: string
  author: string
  createdAt: string
  updatedAt: string
  url: string
  agent?: string
  phase?: number
  status: string
  metadata: any
}

export default function GitHubTracesPage() {
  const [traces, setTraces] = useState<GitHubTrace[]>([])
  const [filteredTraces, setFilteredTraces] = useState<GitHubTrace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [owner] = useState('hscheema1979')
  const [repo] = useState('hscheema1979')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchTraces()
  }, [owner, repo])

  useEffect(() => {
    let filtered = traces

    if (typeFilter !== 'all') {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTraces(filtered)
  }, [traces, typeFilter, searchQuery])

  const fetchTraces = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/v1/traces/github?owner=${owner}&repo=${repo}`)
      if (response.ok) {
        const data = await response.json()
        setTraces(data.traces || [])
      }
    } catch (error) {
      console.error('Error fetching traces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: GitHubTrace['type']) => {
    switch (type) {
      case 'commit':
        return <GitCommit className="h-4 w-4" />
      case 'pr':
        return <GitPullRequest className="h-4 w-4" />
      case 'issue':
        return <FileText className="h-4 w-4" />
      case 'workflow':
        return <Activity className="h-4 w-4" />
    }
  }

  const getStatusBadge = (trace: GitHubTrace) => {
    if (trace.type === 'pr') {
      if (trace.status === 'merged') {
        return <Badge className="bg-purple-600">Merged</Badge>
      }
      if (trace.status === 'closed') {
        return <Badge variant="secondary">Closed</Badge>
      }
      return <Badge className="bg-green-600">Open</Badge>
    }

    if (trace.type === 'workflow') {
      if (trace.status === 'success') {
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>
      }
      if (trace.status === 'failed') {
        return <Badge className="bg-red-600"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      }
      return <Badge className="bg-blue-600">Running</Badge>
    }

    return <Badge variant="outline">{trace.status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">GitHub Traceability</h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail from GitHub repository activity
          </p>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
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
        <h1 className="text-3xl font-bold tracking-tight">GitHub Traceability</h1>
        <p className="text-muted-foreground mt-1">
          Every commit, PR, issue, and workflow - complete audit trail
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-40"
          />
          <Input
            placeholder="Repository"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="commit">Commits</SelectItem>
            <SelectItem value="pr">Pull Requests</SelectItem>
            <SelectItem value="issue">Issues</SelectItem>
            <SelectItem value="workflow">Workflows</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTraces.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Commits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTraces.filter(t => t.type === 'commit').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTraces.filter(t => t.type === 'pr').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTraces.filter(t => t.type === 'workflow').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Traces Timeline */}
      <div className="space-y-3">
        {filteredTraces.map((trace) => (
          <Card key={trace.traceId} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {getTypeIcon(trace.type)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{trace.title}</span>
                        {getStatusBadge(trace)}
                        {trace.agent && (
                          <Badge variant="outline" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            {trace.agent}
                          </Badge>
                        )}
                        {trace.phase !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            Phase {trace.phase}
                          </Badge>
                        )}
                      </div>
                      {trace.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {trace.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(trace.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>by</span>
                      <span className="font-medium">{trace.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(trace.createdAt).toLocaleString()}</span>
                    </div>
                    {trace.type === 'commit' && trace.metadata?.stats && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">+{trace.metadata.stats.additions}</span>
                        <span className="text-red-600">-{trace.metadata.stats.deletions}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTraces.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No traces found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting filters or check a different repository
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
