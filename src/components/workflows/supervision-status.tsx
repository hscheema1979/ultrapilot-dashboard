/**
 * Supervision Status Component
 *
 * Displays detailed status of autoloop supervision modules.
 * Shows scanner, validator, trigger, and intervention module details.
 *
 * @module components/workflows/supervision-status
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import type { SupervisionModule } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'

// ============================================================================
// Props
// ============================================================================

export interface SupervisionStatusProps {
  /** Supervision modules to display */
  modules: {
    scanner: SupervisionModule
    validator: SupervisionModule
    trigger: SupervisionModule
    intervention: SupervisionModule
  }
  /** Loading state */
  isLoading?: boolean
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Status indicator dot
 */
function StatusIndicator({ status }: { status: 'active' | 'idle' | 'error' }) {
  const config = {
    active: { color: 'bg-green-500', label: 'Active' },
    idle: { color: 'bg-gray-400', label: 'Idle' },
    error: { color: 'bg-red-500', label: 'Error' },
  }

  const { color, label } = config[status]

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

/**
 * Module status card
 */
function ModuleCard({
  name,
  status,
  lastExecution,
  executionCount,
  errorCount,
  data,
}: SupervisionModule & { description?: string }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-card">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="font-medium">{name}</h4>
          <StatusIndicator status={status} />
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              Last run:{' '}
              {lastExecution ? (
                <RelativeTime timestamp={lastExecution} />
              ) : (
                'Never'
              )}
            </span>
          </div>

          <div>Executions: {executionCount}</div>

          {errorCount !== undefined && errorCount > 0 && (
            <div className="text-destructive">Errors: {errorCount}</div>
          )}

          {data && Object.keys(data).length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <div className="text-xs font-medium mb-1">Details:</div>
              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Relative time display
 */
function RelativeTime({ timestamp }: { timestamp: string | null }) {
  if (!timestamp) {
    return <span>Never</span>
  }

  try {
    return (
      <span title={new Date(timestamp).toISOString()}>
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </span>
    )
  } catch {
    return <span>Invalid date</span>
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * SupervisionStatus component
 */
export function SupervisionStatus({ modules, isLoading }: SupervisionStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Supervision Modules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ModuleCard {...modules.scanner} />
        <ModuleCard {...modules.validator} />
        <ModuleCard {...modules.trigger} />
        <ModuleCard {...modules.intervention} />
      </CardContent>
    </Card>
  )
}
