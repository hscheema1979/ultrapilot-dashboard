/**
 * Projects API Demo Page
 *
 * This page demonstrates the GitHub Projects API integration.
 * Access at: /projects-demo
 */

import { ProjectBoard } from '@/components/projects/project-board'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProjectsDemoPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">GitHub Projects Dashboard</h1>
        <p className="text-muted-foreground">
          Track progress across all GitHub projects with real-time updates
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organization Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View all projects from your GitHub organizations in one place.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-Time Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Auto-refresh every 60 seconds to keep you up to date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Visual progress indicators show completion status.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Board */}
      <ProjectBoard
        initialOrg="hscheema1979"
        autoRefresh={true}
        refreshInterval={60}
      />

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Use these endpoints to integrate projects data into your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              GET <Badge variant="secondary">/api/v1/projects</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Fetch GitHub Projects with columns and cards
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">
                curl "/api/v1/projects?org=hscheema1979&state=open&page=1&per_page=30"
              </code>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              POST <Badge variant="secondary">/api/v1/projects</Badge>
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Invalidate projects cache
            </p>
            <div className="bg-muted p-3 rounded-md">
              <code className="text-sm">
                curl -X POST "/api/v1/projects" -d '{{"org":"hscheema1979"}}'
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
