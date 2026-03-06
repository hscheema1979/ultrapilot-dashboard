/**
 * Workflow Table Component
 *
 * Displays a table of workflow issues with filtering and sorting.
 * Shows workflow ID, title, status, phase, agent, age, and last updated time.
 *
 * @module components/workflows/workflow-table
 */

'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Clock, Filter } from 'lucide-react'
import type { WorkflowIssue, WorkflowState, WorkflowPhase, WorkflowAgent } from '@/types/api'
import { formatDistanceToNow } from 'date-fns'

// ============================================================================
// Props
// ============================================================================

export interface WorkflowTableProps {
  /** Workflow issues to display */
  workflows: WorkflowIssue[]
  /** Loading state */
  isLoading?: boolean
}

// ============================================================================
// Helper Components
// ============================================================================

/**
 * Workflow state badge
 */
function StateBadge({ state }: { state: WorkflowState }) {
  const config = {
    pending: { variant: 'secondary' as const, label: 'Pending' },
    active: { variant: 'default' as const, label: 'Active' },
    completed: { variant: 'outline' as const, label: 'Completed' },
    blocked: { variant: 'destructive' as const, label: 'Blocked' },
    failed: { variant: 'destructive' as const, label: 'Failed' },
  }

  const { variant, label } = config[state]

  return <Badge variant={variant}>{label}</Badge>
}

/**
 * Phase indicator
 */
function PhaseIndicator({ phase }: { phase: WorkflowPhase }) {
  const phases = ['Expansion', 'Planning', 'Execution', 'QA', 'Validation', 'Verification', 'Cleanup']

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Phase {phase}</span>
      <span className="text-xs text-muted-foreground">{phases[phase] || 'Unknown'}</span>
    </div>
  )
}

/**
 * Agent badge
 */
function AgentBadge({ agent }: { agent: WorkflowAgent | null }) {
  if (!agent) {
    return <span className="text-sm text-muted-foreground">Unassigned</span>
  }

  // Shorten agent name for display
  const shortName = agent.replace('ultra:', '').replace('-', ' ')

  return (
    <Badge variant="outline" className="text-xs">
      {shortName}
    </Badge>
  )
}

/**
 * Relative time display
 */
function RelativeTime({ timestamp }: { timestamp: string }) {
  try {
    return (
      <span title={new Date(timestamp).toISOString()} className="text-sm">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
      </span>
    )
  } catch {
    return <span className="text-sm text-muted-foreground">Invalid date</span>
  }
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * WorkflowTable component
 */
export function WorkflowTable({ workflows, isLoading }: WorkflowTableProps) {
  const [filter, setFilter] = useState<{
    state: WorkflowState | 'all'
    phase: string
    search: string
  }>({
    state: 'all',
    phase: 'all',
    search: '',
  })

  // Filter workflows
  const filteredWorkflows = workflows.filter(workflow => {
    if (filter.state !== 'all' && workflow.state !== filter.state) {
      return false
    }

    if (filter.phase !== 'all' && String(workflow.phase) !== filter.phase) {
      return false
    }

    if (filter.search && !workflow.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <Select
          value={filter.state}
          onValueChange={(value) => setFilter({ ...filter, state: value as any })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.phase}
          onValueChange={(value) => setFilter({ ...filter, phase: value })}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Phase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Phases</SelectItem>
            {[0, 1, 2, 3, 4, 5, 6].map(phase => (
              <SelectItem key={phase} value={String(phase)}>Phase {phase}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Search workflows..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
          className="w-64"
        />

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredWorkflows.length} of {workflows.length} workflows
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-28">State</TableHead>
              <TableHead className="w-32">Phase</TableHead>
              <TableHead className="w-40">Agent</TableHead>
              <TableHead className="w-28">Age</TableHead>
              <TableHead className="w-28">Updated</TableHead>
              <TableHead className="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWorkflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No workflows found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell className="font-mono text-sm">
                    #{workflow.issueNumber}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium truncate">{workflow.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StateBadge state={workflow.state} />
                  </TableCell>
                  <TableCell>
                    <PhaseIndicator phase={workflow.phase} />
                  </TableCell>
                  <TableCell>
                    <AgentBadge agent={workflow.agent} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <RelativeTime timestamp={workflow.createdAt} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <RelativeTime timestamp={workflow.updatedAt} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a
                        href={workflow.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on GitHub"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
