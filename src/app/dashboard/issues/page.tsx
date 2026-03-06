"use client"

import * as React from "react"
import { AlertCircle, GitPullRequest, CheckCircle2, Clock, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function IssuesPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground mt-1">Track issues and pull requests</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground mt-1">
            Track issues and pull requests across repositories
          </p>
        </div>
        <Button>
          <AlertCircle className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </div>

      {/* Issue Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Closed Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground mt-1">Issues resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Merged Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">PRs merged</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Recent Issues
          </CardTitle>
          <CardDescription>Latest issues from your repositories</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
              {[
                { title: "Fix authentication bug in workflow", repo: "ultrapilot-core", status: "open", labels: ["bug", "high-priority"] },
                { title: "Add support for custom webhooks", repo: "ultrapilot-dashboard", status: "open", labels: ["enhancement"] },
                { title: "Update dependencies to latest versions", repo: "ultrapilot-agent", status: "open", labels: ["maintenance"] },
                { title: "Improve error handling in API layer", repo: "ultrapilot-core", status: "open", labels: ["improvement"] },
                { title: "Add dark mode toggle", repo: "ultrapilot-dashboard", status: "closed", labels: ["feature"] },
              ].map((issue, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <GitPullRequest className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{issue.title}</p>
                      <Badge variant={issue.status === "open" ? "default" : "secondary"} className="text-xs">
                        {issue.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{issue.repo}</span>
                      <span>•</span>
                      <span>{i === 0 ? "5 minutes ago" : `${i * 2 + 5} minutes ago`}</span>
                    </div>
                    <div className="flex gap-1">
                      {issue.labels.map((label, j) => (
                        <Badge key={j} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Recent Pull Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5" />
            Recent Pull Requests
          </CardTitle>
          <CardDescription>Latest PRs across repositories</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-4 pr-4">
              {[
                { title: "feat: Add GitHub integration", author: "developer1", status: "open", reviews: 2 },
                { title: "fix: Resolve caching issue", author: "developer2", status: "approved", reviews: 3 },
                { title: "docs: Update API documentation", author: "developer3", status: "merged", reviews: 1 },
              ].map((pr, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <GitPullRequest className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    pr.status === "merged" ? "text-purple-500" :
                    pr.status === "approved" ? "text-green-500" :
                    "text-blue-500"
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{pr.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>by {pr.author}</span>
                      <span>•</span>
                      <span>{i === 0 ? "Just now" : `${i * 15 + 10} minutes ago`}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{pr.reviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={
                    pr.status === "merged" ? "default" :
                    pr.status === "approved" ? "secondary" :
                    "outline"
                  } className="flex-shrink-0">
                    {pr.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
