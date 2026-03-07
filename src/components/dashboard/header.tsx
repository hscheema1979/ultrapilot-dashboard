'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Activity, GitBranch, Settings, RefreshCw, LayoutGrid, Zap, Loader2, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
import { ProjectSelector } from "./project-selector"
import { useProject } from "@/contexts/project-context"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { currentProject, isLoading, projects } = useProject()

  const enabledProjectsCount = projects.filter(p => p.enabled).length

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        {/* Main header row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo and title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative">
              <Activity className="h-6 w-6 text-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2 w-2 bg-status-success rounded-full ring-2 ring-background" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">Operations Suite</h1>
              <p className="text-sm text-muted-foreground truncate">
                GitHub operations, Relay sessions, and project management
              </p>
            </div>
          </div>

          {/* Navigation and controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/dashboard/workflows">
              <Button variant="outline" size="sm" asChild>
                <span className="hidden sm:inline-flex">
                  <Activity className="h-4 w-4 mr-2" />
                  New Workflow
                </span>
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <Zap className="h-4 w-4 mr-2" />
                  Relay
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <a href="/p/ubuntu/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">Ubuntu</div>
                      <div className="text-xs text-muted-foreground">Home directory</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/p/hscheema1979/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">hscheema1979</div>
                      <div className="text-xs text-muted-foreground">Project directory</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/p/projects/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">Projects</div>
                      <div className="text-xs text-muted-foreground">All projects</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/p/dev/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">Dev</div>
                      <div className="text-xs text-muted-foreground">Development</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/p/myhealthteam/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 cursor-pointer">
                    <Zap className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">MyHealthTeam</div>
                      <div className="text-xs text-muted-foreground">Health project</div>
                    </div>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1" />

            <ProjectSelector />

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              aria-label="Refresh dashboard"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <Separator className="mt-4" />

        {/* Project context bar */}
        <div className="flex items-center justify-between gap-4 mt-4">
          {/* Current project info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ) : !currentProject ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 text-status-warning" />
                <span>No project selected - {enabledProjectsCount} projects available</span>
                <Button variant="link" size="sm" className="h-auto p-0 ml-2" asChild>
                  <Link href="/dashboard/projects">Configure projects</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Project badge with color */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center ring-2 ring-background shadow-sm"
                      style={{ backgroundColor: currentProject.color + '15' }}
                    >
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: currentProject.color }}
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-status-success rounded-full flex items-center justify-center ring-2 ring-background">
                      <CheckCircle2 className="h-2.5 w-2.5 text-status-success-foreground" />
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold truncate">{currentProject.name}</h2>
                      <Badge variant="default" className="h-5 px-2 text-xs bg-status-success/10 text-status-success hover:bg-status-success/10 shrink-0">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm mt-0.5">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <GitBranch className="h-3.5 w-3.5" />
                        <span className="font-medium">{currentProject.owner}</span>
                        <span className="text-muted-foreground/60">/</span>
                        <span className="font-mono">{currentProject.repo}</span>
                      </div>
                      {currentProject.description && (
                        <>
                          <Separator orientation="vertical" className="h-3" />
                          <span className="text-muted-foreground truncate max-w-md">
                            {currentProject.description}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Project stats (optional - can be expanded later) */}
          {!isLoading && currentProject && (
            <div className="flex items-center gap-3 flex-shrink-0 text-sm">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent/50">
                <div className="h-2 w-2 rounded-full bg-status-success animate-pulse" />
                <span className="text-muted-foreground">Connected</span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent/50">
                <span className="text-muted-foreground">Enabled:</span>
                <span className="font-medium">{enabledProjectsCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
