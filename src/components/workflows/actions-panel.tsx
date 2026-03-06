/**
 * Actions Panel Component
 *
 * Displays recent GitHub Actions workflow runs with status badges.
 * Shows run name, status, branch, commit, actor, and links to logs.
 *
 * @module components/workflows/actions-panel
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Play, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { ActionRun, ActionRunStatus } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'

// ============================================================================
// Props
// ============================================================================

export interface ActionsPanelProps {
  /** Action runs to display */
  runs: ActionRun[]
  /** Loading state */
  isLoading?: boolean
  /** Maximum number of runs to display */
  maxRuns?: number
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Status badge for action runs
 */
function StatusBadge({ status, conclusion }: { status: ActionRunStatus; conclusion: ActionRunConclusion }) {
  if (status === 'queued' || status === 'in_progress') {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {status === 'queued' ? 'Queued' : 'Running'}
      </Badge>
    )
  }

  if (status === 'failed' || conclusion === 'failure') {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    )
  }

  if (conclusion === 'success') {
    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" />
        Success
      </Badge>
    )
  }

  return <Badge variant="outline">{conclusion || status}</Badge>
}

/**
 * Action run item
 */
function ActionRunItem({ run }: { run: ActionRun }) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0 hover:bg-muted/50 px-2 rounded transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Play className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{run.name}</span>
            <StatusBadge status={run.status} conclusion={run.conclusion} />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span>{run.repository.owner}/{run.repository.name}</span>
            <span className="w-px h-3 bg-border" />
            <span className="font-mono">{run.headBranch}</span>
            {run.duration !== undefined && (
              <>
                <span className="w-px h-3 bg-border" />
                <span>{run.duration}s</span>
              </>
            )}
          </div>

          {run.headCommitMessage && (
            <p className="text-xs text-muted-foreground truncate mt-1" title={run.headCommitMessage}>
              {run.headCommitMessage}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right text-xs">
          <div className="text-muted-foreground">
            <RelativeTime timestamp={run.createdAt} />
          </div>
          <div className="text-muted-foreground">by {run.actor.login}</div>
        </div>

        <a
          href={run.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="View run details"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}

/**
 * Relative time display
 */
function RelativeTime({ timestamp }: { timestamp: string }) {
  try {
    return (
      <span title={new Date(timestamp).toISOString()}>
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </span>
    )
  } catch {
    return <span className="text-muted-foreground">Invalid date</span>
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ActionsPanel component
 */
export function ActionsPanel({ runs, isLoading, maxRuns = 10 }: ActionsPanelProps) {
  const displayRuns = runs.slice(0, maxRuns)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Recent Actions
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {runs.length} runs
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {displayRuns.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No action runs found
          </div>
        ) : (
          <div className="space-y-0">
            {displayRuns.map((run) => (
              <ActionRunItem key={run.id} run={run} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
