/**
 * Autoloop Status Card Component
 *
 * Displays the current status of the autoloop daemon including:
 * - Health indicator (healthy, degraded, down)
 * - Last heartbeat timestamp
 * - Active workflows count
 * - Supervision module status
 * - Uptime percentage
 *
 * @module components/workflows/autoloop-status-card
 */

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity, Clock, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type { AutoloopHeartbeat } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'

// ============================================================================
// Props
// ============================================================================

export interface AutoloopStatusCardProps {
  /** Autoloop heartbeat data */
  heartbeat: AutoloopHeartbeat | null
  /** Loading state */
  isLoading?: boolean
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Health status badge
 */
function HealthBadge({ health }: { health: AutoloopHeartbeat['health'] }) {
  const config = {
    healthy: {
      label: 'Healthy',
      variant: 'default' as const,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    degraded: {
      label: 'Degraded',
      variant: 'secondary' as const,
      icon: AlertTriangle,
      color: 'text-yellow-500',
    },
    down: {
      label: 'Down',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-red-500',
    },
  }

  const { label, variant, icon: Icon, color } = config[health]

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className={`h-3 w-3 ${color}`} />
      {label}
    </Badge>
  )
}

/**
 * Supervision module status indicator
 */
function SupervisionModule({
  name,
  status,
  lastExecution,
  executionCount,
}: {
  name: string
  status: 'active' | 'idle' | 'error'
  lastExecution: string | null
  executionCount: number
}) {
  const statusConfig = {
    active: { color: 'bg-green-500', label: 'Active' },
    idle: { color: 'bg-gray-400', label: 'Idle' },
    error: { color: 'bg-red-500', label: 'Error' },
  }

  const { color, label } = statusConfig[status]

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${color}`} />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>{label}</span>
        <span className="w-px h-3 bg-border" />
        <span>{executionCount} cycles</span>
      </div>
    </div>
  )
}

/**
 * Relative time display
 */
function RelativeTime({ timestamp }: { timestamp: string | null }) {
  if (!timestamp) {
    return <span className="text-muted-foreground">Never</span>
  }

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
 * AutoloopStatusCard component
 */
export function AutoloopStatusCard({ heartbeat, isLoading }: AutoloopStatusCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!heartbeat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Autoloop Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            No autoloop data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const uptimeColor = heartbeat.uptime >= 90 ? 'text-green-500' : heartbeat.uptime >= 50 ? 'text-yellow-500' : 'text-red-500'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Autoloop Status
          </CardTitle>
          <HealthBadge health={heartbeat.health} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Last Heartbeat</span>
              <span className="text-sm font-medium">
                <RelativeTime timestamp={heartbeat.lastHeartbeat} />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Active Workflows</span>
              <span className="text-sm font-medium">{heartbeat.activeWorkflows}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Uptime</span>
              <span className={`text-sm font-medium ${uptimeColor}`}>
                {heartbeat.uptime.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Supervision Modules */}
        <div className="space-y-1">
          <h4 className="text-sm font-medium mb-2">Supervision Modules</h4>
          <SupervisionModule
            name={heartbeat.supervision.scanner.name}
            status={heartbeat.supervision.scanner.status}
            lastExecution={heartbeat.supervision.scanner.lastExecution}
            executionCount={heartbeat.supervision.scanner.executionCount}
          />
          <SupervisionModule
            name={heartbeat.supervision.validator.name}
            status={heartbeat.supervision.validator.status}
            lastExecution={heartbeat.supervision.validator.lastExecution}
            executionCount={heartbeat.supervision.validator.executionCount}
          />
          <SupervisionModule
            name={heartbeat.supervision.trigger.name}
            status={heartbeat.supervision.trigger.status}
            lastExecution={heartbeat.supervision.trigger.lastExecution}
            executionCount={heartbeat.supervision.trigger.executionCount}
          />
          <SupervisionModule
            name={heartbeat.supervision.intervention.name}
            status={heartbeat.supervision.intervention.status}
            lastExecution={heartbeat.supervision.intervention.lastExecution}
            executionCount={heartbeat.supervision.intervention.executionCount}
          />
        </div>

        {/* Cycle Count */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Cycles</span>
            <span className="font-medium">{heartbeat.cycleCount}</span>
          </div>
        </div>

        {/* Error Message */}
        {heartbeat.error && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">{heartbeat.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
