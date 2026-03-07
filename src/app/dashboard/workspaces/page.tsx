"use client"

import * as React from "react"
import {
  Terminal,
  User,
  FolderOpen,
  Code,
  HeartPulse,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Workspace {
  id: string
  title: string
  path: string
  icon: React.ReactNode
  description: string
  color: string
}

const workspaces: Workspace[] = [
  {
    id: 'ubuntu',
    title: 'Ubuntu Workspace',
    path: '/p/ubuntu/',
    icon: <Terminal className="h-6 w-6" />,
    description: 'Ubuntu Relay session with full system access',
    color: 'bg-orange-600'
  },
  {
    id: 'hscheema1979',
    title: 'Personal Workspace',
    path: '/p/hscheema1979/',
    icon: <User className="h-6 w-6" />,
    description: 'Personal workspace and configuration',
    color: 'bg-blue-600'
  },
  {
    id: 'projects',
    title: 'Projects Workspace',
    path: '/p/projects/',
    icon: <FolderOpen className="h-6 w-6" />,
    description: 'Projects directory and files',
    color: 'bg-purple-600'
  },
  {
    id: 'dev',
    title: 'Development Workspace',
    path: '/p/dev/',
    icon: <Code className="h-6 w-6" />,
    description: 'Development environment and tools',
    color: 'bg-green-600'
  },
  {
    id: 'myhealthteam',
    title: 'MyHealthTeam',
    path: '/p/myhealthteam/',
    icon: <HeartPulse className="h-6 w-6" />,
    description: 'MyHealthTeam project workspace',
    color: 'bg-red-600'
  }
]

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Relay Workspaces</h1>
        <p className="text-muted-foreground mt-1">
          Access terminal sessions and workspaces
        </p>
      </div>

      {/* Workspaces Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <Card key={workspace.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`${workspace.color} p-2 rounded-lg text-white`}>
                  {workspace.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{workspace.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {workspace.path}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {workspace.description}
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => (window.location.href = workspace.path)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Workspace
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
