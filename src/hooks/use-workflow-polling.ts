/**
 * Workflow Polling Hook
 *
 * Custom React hook for polling workflow data at regular intervals.
 * Provides real-time updates with automatic pause when tab is inactive.
 *
 * @module hooks/use-workflow-polling
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  WorkflowIssue,
  AutoloopHeartbeat,
  ActionRun,
  WorkflowFilters,
  ActionRunFilters,
} from '@/types/api'

// ============================================================================
// Types
// ============================================================================

/**
 * Workflow polling data
 */
export interface WorkflowPollingData {
  /** Active workflows */
  workflows: WorkflowIssue[]
  /** Autoloop heartbeat status */
  heartbeat: AutoloopHeartbeat | null
  /** Recent action runs */
  actionRuns: ActionRun[]
}

/**
 * Workflow polling state
 */
export interface WorkflowPollingState {
  /** Data from polling */
  data: WorkflowPollingData | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Last update timestamp */
  lastUpdate: Date | null
  /** Currently polling */
  isPolling: boolean
  /** Poll count */
  pollCount: number
}

/**
 * Workflow polling options
 */
export interface WorkflowPollingOptions {
  /** Repository owner */
  owner: string
  /** Repository name */
  repo: string
  /** Polling interval in milliseconds (default: 60000 = 1 minute) */
  interval?: number
  /** Workflow filters (optional) */
  workflowFilters?: WorkflowFilters
  /** Action runs filters (optional) */
  actionFilters?: ActionRunFilters
  /** Enable polling (default: true) */
  enabled?: boolean
  /** Callback when data updates */
  onData?: (data: WorkflowPollingData) => void
  /** Callback when error occurs */
  onError?: (error: string) => void
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * useWorkflowPolling hook
 *
 * Polls workflow data at regular intervals with smart pause on tab inactivity.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, isPolling } = useWorkflowPolling({
 *   owner: 'hscheema1979',
 *   repo: 'ultra-workspace',
 *   interval: 60000, // 1 minute
 * })
 * ```
 */
export function useWorkflowPolling(options: WorkflowPollingOptions): WorkflowPollingState {
  const {
    owner,
    repo,
    interval = 60000, // 60 seconds default
    workflowFilters,
    actionFilters,
    enabled = true,
    onData,
    onError,
  } = options

  // State
  const [data, setData] = useState<WorkflowPollingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const maxRetries = 3

  /**
   * Fetch workflow data from API
   */
  const fetchData = useCallback(async () => {
    if (!isMountedRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      // Build query parameters for workflows
      const workflowParams = new URLSearchParams({
        owner,
        repo,
        page: String(workflowFilters?.page || 1),
        per_page: String(workflowFilters?.per_page || 30),
      })

      if (workflowFilters?.state) {
        workflowParams.set('state', workflowFilters.state)
      }

      if (workflowFilters?.phase !== undefined) {
        workflowParams.set('phase', String(workflowFilters.phase))
      }

      if (workflowFilters?.agent) {
        workflowParams.set('agent', workflowFilters.agent)
      }

      if (workflowFilters?.search) {
        workflowParams.set('search', workflowFilters.search)
      }

      // Build query parameters for heartbeat
      const heartbeatParams = new URLSearchParams({
        owner,
        repo,
      })

      // Build query parameters for action runs
      const actionParams = new URLSearchParams({
        owner,
        repo,
        page: String(actionFilters?.page || 1),
        per_page: String(actionFilters?.per_page || 30),
        status: actionFilters?.status || 'completed',
      })

      if (actionFilters?.branch) {
        actionParams.set('branch', actionFilters.branch)
      }

      // Fetch all data in parallel
      const [workflowsResponse, heartbeatResponse, actionRunsResponse] = await Promise.all([
        fetch(`/api/v1/workflows?${workflowParams.toString()}`),
        fetch(`/api/v1/autoloop/heartbeat?${heartbeatParams.toString()}`),
        fetch(`/api/v1/actions/runs?${actionParams.toString()}`),
      ])

      // Check for errors
      if (!workflowsResponse.ok) {
        throw new Error(`Workflows API error: ${workflowsResponse.status}`)
      }

      if (!heartbeatResponse.ok) {
        throw new Error(`Heartbeat API error: ${heartbeatResponse.status}`)
      }

      if (!actionRunsResponse.ok) {
        throw new Error(`Actions API error: ${actionRunsResponse.status}`)
      }

      // Parse responses
      const workflowsData = await workflowsResponse.json()
      const heartbeatData = await heartbeatResponse.json()
      const actionRunsData = await actionRunsResponse.json()

      const newData: WorkflowPollingData = {
        workflows: workflowsData.workflows || [],
        heartbeat: heartbeatData,
        actionRuns: actionRunsData.runs || [],
      }

      if (isMountedRef.current) {
        setData(newData)
        setLastUpdate(new Date())
        setPollCount(prev => prev + 1)
        setIsLoading(false)
        setError(null)
        retryCountRef.current = 0 // Reset retry count on success

        // Call callback if provided
        if (onData) {
          onData(newData)
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Retry logic with exponential backoff
      retryCountRef.current++

      if (retryCountRef.current <= maxRetries) {
        console.warn(`[useWorkflowPolling] Fetch failed (attempt ${retryCountRef.current}/${maxRetries}), retrying...`, errorMessage)

        // Exponential backoff: 2^retry seconds
        const backoffDelay = Math.pow(2, retryCountRef.current) * 1000

        setTimeout(() => {
          if (isMountedRef.current && enabled) {
            fetchData()
          }
        }, backoffDelay)

        return
      }

      // Max retries reached
      console.error('[useWorkflowPolling] Max retries reached, giving up:', errorMessage)

      if (isMountedRef.current) {
        setError(errorMessage)
        setIsLoading(false)
        setIsPolling(false)

        if (onError) {
          onError(errorMessage)
        }
      }
    }
  }, [owner, repo, workflowFilters, actionFilters, enabled, onData, onError])

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    setIsPolling(true)

    // Initial fetch
    fetchData()

    // Set up interval
    intervalRef.current = setInterval(() => {
      fetchData()
    }, interval)
  }, [interval, fetchData])

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setIsPolling(false)
  }, [])

  /**
   * Manually refresh data
   */
  const refresh = useCallback(() => {
    fetchData()
  }, [fetchData])

  // Set up polling on mount
  useEffect(() => {
    if (enabled) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, startPolling, stopPolling])

  // Pause polling when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, pause polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        setIsPolling(false)
      } else {
        // Tab is visible again, resume polling
        if (enabled && !intervalRef.current) {
          intervalRef.current = setInterval(() => {
            fetchData()
          }, interval)
          setIsPolling(true)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, interval, fetchData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    isPolling,
    pollCount,
    refresh,
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Hook result type with refresh function
 */
export type WorkflowPollingResult = WorkflowPollingState & {
  /** Manually refresh data */
  refresh: () => void
}
