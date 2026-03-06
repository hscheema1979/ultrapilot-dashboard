"use client"

import * as React from "react"
import { FolderKanban, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your project boards and tasks</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your project boards and tasks
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Board - Placeholder for Agent B's component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Project Board
          </CardTitle>
          <CardDescription>
            Agent B's Projects API component will be integrated here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center border rounded-lg bg-muted/20">
            <div className="text-center text-muted-foreground">
              <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Project board coming soon</p>
              <p className="text-sm mt-1">Integration with Projects API</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
