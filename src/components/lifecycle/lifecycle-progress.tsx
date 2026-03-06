'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LIFECYCLE_PHASES, type LifecyclePhase } from "@/lib/lifecycle-types"
import { Zap, FileText, Layout, ListTodo, Code, CheckCircle, GitBranch, User, Rocket, BarChart, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  Zap, FileText, Layout, ListTodo, Code, CheckCircle, GitBranch, User, Rocket, BarChart
}

interface LifecycleProgressProps {
  issueId: number
  currentPhase: LifecyclePhase
  progress: number
  startedAt: string
  estimatedCompletion?: string
}

export function LifecycleProgress({
  issueId,
  currentPhase,
  progress,
  startedAt,
  estimatedCompletion
}: LifecycleProgressProps) {
  const currentPhaseIndex = LIFECYCLE_PHASES.findIndex(p => p.id === currentPhase)
  const elapsed = Date.now() - new Date(startedAt).getTime()
  const elapsedMinutes = Math.floor(elapsed / 60000)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Lifecycle Progress</CardTitle>
          <Badge variant="outline">#{issueId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{elapsedMinutes}min active</span>
          </div>
          {estimatedCompletion && (
            <div className="flex items-center gap-1">
              <span>Est. completion:</span>
              <span className="font-medium">{new Date(estimatedCompletion).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Phase Steps */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Lifecycle Phases</h3>

          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div
              className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ height: `${(currentPhaseIndex / (LIFECYCLE_PHASES.length - 1)) * 100}%` }}
            />

            {/* Phase Steps */}
            <div className="space-y-4">
              {LIFECYCLE_PHASES.map((phase, index) => {
                const Icon = ICON_MAP[phase.icon as keyof typeof ICON_MAP]
                const isCompleted = index < currentPhaseIndex
                const isCurrent = index === currentPhaseIndex
                const isPending = index > currentPhaseIndex

                return (
                  <div key={phase.id} className="relative flex items-start gap-4">
                    {/* Phase Icon */}
                    <div className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all",
                      isCompleted && "bg-primary border-primary",
                      isCurrent && "bg-primary border-primary animate-pulse",
                      isPending && "bg-background border-border"
                    )}>
                      <Icon className={cn(
                        "h-4 w-4",
                        isCompleted || isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>

                    {/* Phase Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "text-sm font-medium",
                          isCurrent && "text-primary",
                          isPending && "text-muted-foreground"
                        )}>
                          {phase.name}
                        </p>
                        {isCurrent && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </div>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button size="sm" variant="outline">
            <Code className="h-4 w-4 mr-2" />
            View Details
          </Button>
          <Button size="sm" variant="outline">
            <BarChart className="h-4 w-4 mr-2" />
            Metrics
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CompactLifecycleProps {
  currentPhase: LifecyclePhase
  progress: number
  showLabel?: boolean
}

export function CompactLifecycle({ currentPhase, progress, showLabel = true }: CompactLifecycleProps) {
  const currentPhaseIndex = LIFECYCLE_PHASES.findIndex(p => p.id === currentPhase)

  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm text-muted-foreground">Progress:</span>
      )}
      <div className="flex items-center gap-1">
        {LIFECYCLE_PHASES.map((phase, index) => {
          const isCompleted = index < currentPhaseIndex
          const isCurrent = index === currentPhaseIndex

          return (
            <div
              key={phase.id}
              className={cn(
                "h-2 rounded-full transition-all",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary animate-pulse",
                index > currentPhaseIndex && "bg-muted"
              )}
              style={{ width: `${100 / LIFECYCLE_PHASES.length}%` }}
              title={phase.name}
            />
          )
        })}
      </div>
      <span className="text-sm font-medium">{progress}%</span>
    </div>
  )
}
