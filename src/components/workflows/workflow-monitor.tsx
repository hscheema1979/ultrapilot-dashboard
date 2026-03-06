/**
 * Workflow Monitor Component
 *
 * Main dashboard component for monitoring UltraPilot workflows.
 * Displays autoloop status, active workflows table, GitHub Actions runs,
 * and supervision module status with real-time polling updates.
 *
 * @module components/workflows/workflow-monitor
 */

'use client'

import { useEffect, useState } from 'react'
import { useWorkflowPolling } from '@/hooks/use-workflow-polling'
import { AutoloopStatusCard } from './autoloop-status-card'
import { WorkflowTable } from './workflow-table'
import { ActionsPanel } from './actions-panel'
import { SupervisionStatus } from './supervision-status'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, RefreshCw, Activity } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/badge'
import type { WorkflowPollingData } from '@/hooks/use-workflow-polling'

// ============================================================================
// Props
// ============================================================================

export interface WorkflowMonitorProps {
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Polling interval in milliseconds (default: 60000 = 1 minute) */
  interval?: number
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * WorkflowMonitor component
 *
 * Main dashboard for monitoring workflows with real-time updates.
 *
 * @example
 * ```tsx
 * <WorkflowMonitor
 *   owner="hscheema1979"
 *   repo="ultra-workspace"
 *   interval={60000}
 * />
 * ```
 */
export function WorkflowMonitor({ owner, repo, interval = 60000 }: WorkflowMonitorProps) {
  const [data, setData] = useState<WorkflowPollingData | null>(null)

  // Use polling hook
  const { isLoading, error, lastUpdate, isPolling, pollCount, refresh } = useWorkflowPolling({
    owner,
    repo,
    interval,
    enabled: true,
    onData: (newData) => {
      setData(newData)
    },
  })

  // If autoloop is down, show a warning
  const isAutoloopDown = data?.heartbeat?.health === 'down'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring for {owner}/{repo}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Polling Status */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className={`h-4 w-4 ${isPolling ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <span>{isPolling ? 'Live' : 'Paused'}</span>
          </div>

          {/* Last Update */}
          {lastUpdate && (
            <div className="text-sm text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error fetching workflow data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Autoloop Down Warning */}
      {isAutoloopDown && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Autoloop is Down</AlertTitle>
          <AlertDescription>
            The autoloop daemon is not running. Workflows will not be processed automatically.
            {data?.heartbeat?.error && ` Error: ${data.heartbeat.error}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Autoloop Status + Supervision */}
        <div className="space-y-6 lg:col-span-1">
          <AutoloopStatusCard
            heartbeat={data?.heartbeat || null}
            isLoading={isLoading}
          />

          {data?.heartbeat && (
            <SupervisionStatus
              modules={data.heartbeat.supervision}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right Column: Workflows + Actions */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="workflows" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="workflows" className="flex-1">
                Active Workflows
                {data?.workflows && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-secondary rounded-full">
                    {data.workflows.filter(w => w.state === 'active').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="actions" className="flex-1">
                Actions Runs
                {data?.actionRuns && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-secondary rounded-full">
                    {data.actionRuns.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="mt-4">
              <WorkflowTable
                workflows={data?.workflows || []}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <ActionsPanel
                runs={data?.actionRuns || []}
                isLoading={isLoading}
                maxRuns={20}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
        <div>
          Total polls: {pollCount}
        </div>
        <div className="flex items-center gap-4">
          {data?.workflows && (
            <>
              <span>Pending: {data.workflows.filter(w => w.state === 'pending').length}</span>
              <span>Active: {data.workflows.filter(w => w.state === 'active').length}</span>
              <span>Completed: {data.workflows.filter(w => w.state === 'completed').length}</span>
              <span>Blocked: {data.workflows.filter(w => w.state === 'blocked').length}</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Default Export
// ============================================================================

export default WorkflowMonitor
