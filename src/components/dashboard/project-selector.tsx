'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Plus, Settings, FolderOpen, Loader2, AlertCircle } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { cn } from "@/lib/utils"

export function ProjectSelector() {
  const { currentProject, projects, setCurrentProject, isLoading } = useProject()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const enabledProjects = projects.filter(p => p.enabled)
  const disabledProjects = projects.filter(p => !p.enabled)

  const handleProjectSelect = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project && project.id !== currentProject?.id) {
      setIsSwitching(true)
      setCurrentProject(project)
      setIsOpen(false)
      // Small delay to show the loading state and smooth transition
      setTimeout(() => setIsSwitching(false), 300)
    }
  }

  // Loading state - show skeleton
  if (isLoading && !currentProject) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-[200px]" />
      </div>
    )
  }

  // No projects available state
  if (!isLoading && projects.length === 0) {
    return (
      <Button variant="outline" size="sm" className="min-w-[200px] justify-start" asChild>
        <a href="/dashboard/projects" className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">No projects</span>
          <Plus className="h-4 w-4 ml-auto" />
        </a>
      </Button>
    )
  }

  // No enabled projects state
  if (!isLoading && enabledProjects.length === 0) {
    return (
      <Button variant="outline" size="sm" className="min-w-[200px] justify-start" asChild>
        <a href="/dashboard/projects" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-status-warning" />
          <span className="text-status-warning">No enabled projects</span>
          <Settings className="h-4 w-4 ml-auto" />
        </a>
      </Button>
    )
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="min-w-[240px] justify-start pr-3 h-10 bg-accent/50 hover:bg-accent border-accent-foreground/20"
          aria-label="Current project: Select a different project"
        >
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <div className="relative">
              <div
                className="h-3 w-3 rounded-full mr-2 ring-2 ring-background"
                style={{ backgroundColor: currentProject?.color }}
              />
              <div
                className="absolute inset-0 h-3 w-3 rounded-full mr-2 animate-ping opacity-75"
                style={{ backgroundColor: currentProject?.color }}
              />
            </div>
          )}
          <div className="flex-1 text-left">
            <div className="font-semibold text-sm truncate">{currentProject?.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {currentProject?.owner}/{currentProject?.repo}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 ml-2 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[340px]">
        {/* Header */}
        <div className="px-3 py-2.5 border-b">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Select Project</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {enabledProjects.length} enabled project{enabledProjects.length !== 1 ? 's' : ''}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              asChild
            >
              <a href="/dashboard/projects">
                <Settings className="h-3.5 w-3.5 mr-1" />
                Manage
              </a>
            </Button>
          </div>
        </div>

        {/* Enabled Projects */}
        <div className="max-h-[300px] overflow-y-auto">
          {enabledProjects.map((project) => {
            const isSelected = currentProject?.id === project.id
            return (
              <DropdownMenuItem
                key={project.id}
                onClick={() => handleProjectSelect(project.id)}
                className={cn(
                  "cursor-pointer py-3 px-3 gap-3",
                  isSelected && "bg-accent/50 border-l-2 border-l-primary"
                )}
                aria-selected={isSelected}
              >
                {/* Color indicator with ring */}
                <div className="relative flex-shrink-0">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center ring-2 ring-background"
                    style={{ backgroundColor: project.color + '20' }}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-status-success rounded-full flex items-center justify-center ring-2 ring-background">
                      <Check className="h-2.5 w-2.5 text-status-success-foreground" />
                    </div>
                  )}
                </div>

                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{project.name}</span>
                    <Badge variant="default" className="h-5 px-1.5 text-xs bg-status-success/10 text-status-success hover:bg-status-success/10">
                      Enabled
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <span className="font-medium">{project.owner}</span>
                    <span>/</span>
                    <span className="font-mono">{project.repo}</span>
                  </div>
                  {project.description && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {project.description}
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            )
          })}

          {/* Disabled Projects Section */}
          {disabledProjects.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="px-3 py-2 bg-muted/30">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Disabled Projects ({disabledProjects.length})
                </div>
              </div>
              {disabledProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  disabled
                  className="cursor-not-allowed py-2.5 px-3 gap-3 opacity-60"
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted">
                    <div className="h-3 w-3 rounded-full bg-muted-foreground/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{project.name}</span>
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        Disabled
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {project.owner}/{project.repo}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="/dashboard/projects"
            className="cursor-pointer py-2.5 px-3 flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add or Manage Projects
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
