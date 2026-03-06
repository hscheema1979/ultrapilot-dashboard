/**
 * Workflow Monitoring Logic
 *
 * Business logic for monitoring UltraPilot workflows via GitHub Issues.
 * Parses workflow labels, tracks autoloop heartbeat, and aggregates statistics.
 *
 * @module lib/github/workflows
 */

import { Octokit } from 'octokit'
import type {
  WorkflowIssue,
  WorkflowState,
  WorkflowPhase,
  WorkflowAgent,
  WorkflowFilters,
  WorkflowStats,
  AutoloopHeartbeat,
  AutoloopHealth,
  HeartbeatData,
  ActionRun,
  ActionRunFilters,
} from '@/types/api'
import type { Issue, Label, WorkflowRun } from '@/types/github'
import { WorkflowCache, IssueCache } from '@/lib/cache'

// ============================================================================
// Constants
// ============================================================================

/**
 * Workflow label patterns used by autoloop
 */
const WORKFLOW_LABELS = {
  // Queue labels (state)
  QUEUE_INTAKE: 'queue:intake',
  QUEUE_IN_PROGRESS: 'queue:in-progress',
  QUEUE_REVIEW: 'queue:review',
  QUEUE_DONE: 'queue:done',

  // Status labels
  STATUS_BLOCKED: 'status:blocked',
  STATUS_PLANNING: 'status:planning',
  STATUS_EXECUTION: 'status:execution',
  STATUS_QA: 'status:qa',
  STATUS_VALIDATION: 'status:validation',
  STATUS_COMPLETE: 'status:complete',

  // Phase labels
  PHASE_PREFIX: 'phase:',

  // Agent labels
  AGENT_PREFIX: 'agent:',

  // Workflow identifier
  WORKFLOW: 'workflow',

  // Dependencies
  DEPENDS_ON: 'depends-on',
} as const

/**
 * Autoloop heartbeat issue title
 */
const HEARTBEAT_ISSUE_TITLE = '🤖 Autoloop Heartbeat'

/**
 * Cache TTL in seconds
 */
const CACHE_TTL = {
  WORKFLOWS: 120,      // 2 minutes
  HEARTBEAT: 30,       // 30 seconds
  ACTIONS: 180,        // 3 minutes
  STATS: 300,          // 5 minutes
} as const

// ============================================================================
// Label Parsing Helpers
// ============================================================================

/**
 * Parse workflow state from labels
 */
export function parseWorkflowState(labels: Label[]): WorkflowState {
  const labelNames = labels.map(l => l.name)

  if (labelNames.includes(WORKFLOW_LABELS.STATUS_BLOCKED)) {
    return 'blocked'
  }

  if (labelNames.includes(WORKFLOW_LABELS.QUEUE_DONE)) {
    return 'completed'
  }

  if (labelNames.includes(WORKFLOW_LABELS.QUEUE_IN_PROGRESS)) {
    return 'active'
  }

  if (labelNames.includes(WORKFLOW_LABELS.QUEUE_INTAKE)) {
    return 'pending'
  }

  // Default to pending if no queue label found
  return 'pending'
}

/**
 * Parse workflow phase from labels
 */
export function parseWorkflowPhase(labels: Label[]): WorkflowPhase {
  const phaseLabel = labels.find(l => l.name.startsWith(WORKFLOW_LABELS.PHASE_PREFIX))

  if (phaseLabel) {
    const phaseStr = phaseLabel.name.replace(WORKFLOW_LABELS.PHASE_PREFIX, '')
    const phase = parseInt(phaseStr, 10)
    if (phase >= 0 && phase <= 6) {
      return phase as WorkflowPhase
    }
  }

  return 0 // Default to Phase 0
}

/**
 * Parse agent from labels
 */
export function parseWorkflowAgent(labels: Label[]): WorkflowAgent | null {
  const agentLabel = labels.find(l => l.name.startsWith(WORKFLOW_LABELS.AGENT_PREFIX))

  if (agentLabel) {
    const agent = agentLabel.name.replace(WORKFLOW_LABELS.AGENT_PREFIX, '') as WorkflowAgent
    // Validate it's a known agent type
    const validAgents: WorkflowAgent[] = [
      'ultra:analyst',
      'ultra:architect',
      'ultra:planner',
      'ultra:critic',
      'ultra:executor',
      'ultra:executor-low',
      'ultra:executor-high',
      'ultra:test-engineer',
      'ultra:verifier',
      'ultra:security-reviewer',
      'ultra:quality-reviewer',
      'ultra:code-reviewer',
      'ultra:debugger',
      'ultra:scientist',
      'ultra:build-fixer',
      'ultra:designer',
      'ultra:writer',
      'ultra:team-lead',
      'ultra:team-implementer',
      'ultra:team-reviewer',
      'ultra:team-debugger',
    ]

    if (validAgents.includes(agent)) {
      return agent
    }
  }

  return null
}

/**
 * Parse dependencies from labels
 */
export function parseDependencies(labels: Label[]): number[] {
  const depLabel = labels.find(l => l.name.startsWith(WORKFLOW_LABELS.DEPENDS_ON))

  if (depLabel) {
    const depsStr = depLabel.name.replace(`${WORKFLOW_LABELS.DEPENDS_ON}:`, '')
    return depsStr.split(',').map(d => parseInt(d.trim(), 10)).filter(d => !isNaN(d))
  }

  return []
}

/**
 * Check if an issue is a workflow issue
 */
export function isWorkflowIssue(issue: Issue): boolean {
  return issue.labels.some(l => l.name === WORKFLOW_LABELS.WORKFLOW)
}

// ============================================================================
// Workflow Listing
// ============================================================================

/**
 * Convert GitHub Issue to WorkflowIssue
 */
export function issueToWorkflow(issue: Issue, owner: string, repo: string): WorkflowIssue {
  const labels = issue.labels || []
  const state = parseWorkflowState(labels)
  const phase = parseWorkflowPhase(labels)
  const agent = parseWorkflowAgent(labels)
  const dependencies = parseDependencies(labels)

  return {
    id: `${owner}/${repo}#${issue.number}`,
    issueNumber: issue.number,
    owner,
    repo,
    title: issue.title,
    state,
    phase,
    agent,
    labels: labels.map(l => l.name),
    assignees: issue.assignees.map(a => a.login),
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    htmlUrl: issue.html_url,
    url: issue.url,
    body: issue.body,
    dependencies,
  }
}

/**
 * List workflow issues with filters
 */
export async function listWorkflows(
  octokit: Octokit,
  owner: string,
  repo: string,
  filters: WorkflowFilters = {}
): Promise<{ workflows: WorkflowIssue[]; totalCount: number }> {
  // Check cache first
  const cacheKey = `workflows:${owner}:${repo}:${JSON.stringify(filters)}`
  const cached = await WorkflowCache.getList(owner, repo)
  // Note: We'd need more granular caching for filtered results

  // Build GitHub search query
  const queryParts = [`repo:${owner}/${repo}`, 'label:workflow']

  if (filters.state) {
    const stateLabel = {
      pending: WORKFLOW_LABELS.QUEUE_INTAKE,
      active: WORKFLOW_LABELS.QUEUE_IN_PROGRESS,
      completed: WORKFLOW_LABELS.QUEUE_DONE,
      blocked: WORKFLOW_LABELS.STATUS_BLOCKED,
    }[filters.state]

    if (stateLabel) {
      queryParts.push(`label:"${stateLabel}"`)
    }
  }

  if (filters.phase !== undefined) {
    queryParts.push(`label:"${WORKFLOW_LABELS.PHASE_PREFIX}${filters.phase}"`)
  }

  if (filters.agent) {
    queryParts.push(`label:"${WORKFLOW_LABELS.AGENT_PREFIX}${filters.agent}"`)
  }

  if (filters.search) {
    queryParts.push(`${filters.search} in:title`)
  }

  const query = queryParts.join(' ')
  const perPage = filters.per_page || 30
  const page = filters.page || 1

  try {
    // Search for issues matching the query
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: query,
      per_page: perPage,
      page,
      sort: 'updated',
      order: 'desc',
    })

    const totalCount = response.data.total_count

    // Convert issues to workflows
    const workflows = response.data.items
      .filter(item => !item.pull_request) // Exclude PRs
      .map(item => issueToWorkflow(item as Issue, owner, repo))

    // Cache the results
    await WorkflowCache.setList(owner, repo, workflows as any, { ttl: CACHE_TTL.WORKFLOWS })

    return { workflows, totalCount }
  } catch (error) {
    console.error('[Workflows] Error listing workflows:', error)
    throw error
  }
}

// ============================================================================
// Autoloop Heartbeat
// ============================================================================

/**
 * Parse heartbeat data from comment body
 */
export function parseHeartbeatComment(commentBody: string): HeartbeatData | null {
  try {
    // Look for JSON code block in comment
    const jsonMatch = commentBody.match(/```json\n([\s\S]*?)\n```/)

    if (!jsonMatch) {
      return null
    }

    const data = JSON.parse(jsonMatch[1])

    return {
      timestamp: data.timestamp || new Date().toISOString(),
      cycle: data.cycle || 0,
      activeWorkflows: data.activeWorkflows || 0,
      scannerStatus: data.scannerStatus || 'idle',
      validatorStatus: data.validatorStatus || 'idle',
      triggerStatus: data.triggerStatus || 'idle',
      interventionStatus: data.interventionStatus || 'idle',
      health: data.health || 'healthy',
    }
  } catch (error) {
    console.error('[Workflows] Error parsing heartbeat comment:', error)
    return null
  }
}

/**
 * Get autoloop heartbeat status
 */
export async function getAutoloopHeartbeat(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<AutoloopHeartbeat> {
  // Check cache first
  const cacheKey = `heartbeat:${owner}:${repo}`
  const cached = await get<AutoloopHeartbeat>(cacheKey)
  if (cached && cached.data) {
    return cached.data
  }

  try {
    // Search for heartbeat issue
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      per_page: 100,
    })

    const heartbeatIssue = response.data.find(
      issue => issue.title === HEARTBEAT_ISSUE_TITLE
    )

    if (!heartbeatIssue) {
      // Autoloop not running
      return {
        lastHeartbeat: null,
        health: 'down',
        activeWorkflows: 0,
        supervision: {
          scanner: { name: 'Scanner', status: 'idle', lastExecution: null, executionCount: 0 },
          validator: { name: 'Validator', status: 'idle', lastExecution: null, executionCount: 0 },
          trigger: { name: 'Trigger', status: 'idle', lastExecution: null, executionCount: 0 },
          intervention: { name: 'Intervention', status: 'idle', lastExecution: null, executionCount: 0 },
        },
        cycleCount: 0,
        uptime: 0,
        error: 'Autoloop heartbeat issue not found',
      }
    }

    // Get latest comment (heartbeat)
    const commentsResponse = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: heartbeatIssue.number,
      per_page: 1,
    })

    const latestComment = commentsResponse.data[0]

    if (!latestComment) {
      return {
        lastHeartbeat: heartbeatIssue.updated_at,
        health: 'degraded',
        activeWorkflows: 0,
        supervision: {
          scanner: { name: 'Scanner', status: 'idle', lastExecution: null, executionCount: 0 },
          validator: { name: 'Validator', status: 'idle', lastExecution: null, executionCount: 0 },
          trigger: { name: 'Trigger', status: 'idle', lastExecution: null, executionCount: 0 },
          intervention: { name: 'Intervention', status: 'idle', lastExecution: null, executionCount: 0 },
        },
        cycleCount: 0,
        uptime: 0,
        error: 'No heartbeat comments found',
      }
    }

    // Parse heartbeat data
    const heartbeatData = parseHeartbeatComment(latestComment.body || '')

    if (!heartbeatData) {
      return {
        lastHeartbeat: latestComment.created_at,
        health: 'degraded',
        activeWorkflows: 0,
        supervision: {
          scanner: { name: 'Scanner', status: 'idle', lastExecution: null, executionCount: 0 },
          validator: { name: 'Validator', status: 'idle', lastExecution: null, executionCount: 0 },
          trigger: { name: 'Trigger', status: 'idle', lastExecution: null, executionCount: 0 },
          intervention: { name: 'Intervention', status: 'idle', lastExecution: null, executionCount: 0 },
        },
        cycleCount: 0,
        uptime: 0,
        error: 'Failed to parse heartbeat data',
      }
    }

    // Calculate uptime (rough estimate based on heartbeat age)
    const heartbeatAge = Date.now() - new Date(heartbeatData.timestamp).getTime()
    const isHealthy = heartbeatAge < 120000 // 2 minutes
    const health: AutoloopHealth = isHealthy ? 'healthy' : 'degraded'

    return {
      lastHeartbeat: heartbeatData.timestamp,
      health,
      activeWorkflows: heartbeatData.activeWorkflows,
      supervision: {
        scanner: {
          name: 'WorkflowScanner',
          status: heartbeatData.scannerStatus,
          lastExecution: heartbeatData.timestamp,
          executionCount: heartbeatData.cycle,
        },
        validator: {
          name: 'ExpectationValidator',
          status: heartbeatData.validatorStatus,
          lastExecution: heartbeatData.timestamp,
          executionCount: heartbeatData.cycle,
        },
        trigger: {
          name: 'DependencyTrigger',
          status: heartbeatData.triggerStatus,
          lastExecution: heartbeatData.timestamp,
          executionCount: heartbeatData.cycle,
        },
        intervention: {
          name: 'AgenticIntervention',
          status: heartbeatData.interventionStatus,
          lastExecution: heartbeatData.timestamp,
          executionCount: heartbeatData.cycle,
        },
      },
      cycleCount: heartbeatData.cycle,
      uptime: isHealthy ? 100 : Math.max(0, 100 - (heartbeatAge / 1000 / 60)), // Degraded over time
    }
  } catch (error) {
    console.error('[Workflows] Error getting autoloop heartbeat:', error)
    return {
      lastHeartbeat: null,
      health: 'down',
      activeWorkflows: 0,
      supervision: {
        scanner: { name: 'Scanner', status: 'error', lastExecution: null, executionCount: 0, errorCount: 1 },
        validator: { name: 'Validator', status: 'error', lastExecution: null, executionCount: 0, errorCount: 1 },
        trigger: { name: 'Trigger', status: 'error', lastExecution: null, executionCount: 0, errorCount: 1 },
        intervention: { name: 'Intervention', status: 'error', lastExecution: null, executionCount: 0, errorCount: 1 },
      },
      cycleCount: 0,
      uptime: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// GitHub Actions Runs
// ============================================================================

/**
 * Convert GitHub WorkflowRun to ActionRun
 */
export function workflowRunToActionRun(run: WorkflowRun, owner: string, repo: string): ActionRun {
  const duration = run.run_started_at
    ? Math.floor((new Date(run.updated_at).getTime() - new Date(run.run_started_at).getTime()) / 1000)
    : undefined

  return {
    id: run.id,
    name: run.name,
    runNumber: run.run_number,
    runAttempt: run.run_attempt,
    event: run.event,
    status: run.status === 'completed' || run.status === 'waiting' || run.status === 'unknown'
      ? (run.conclusion === 'failure' ? 'failed' as const : 'completed' as const)
      : run.status as ActionRunStatus,
    conclusion: run.conclusion,
    headBranch: run.head_branch,
    headSha: run.head_sha,
    headCommitMessage: run.head_commit?.message || null,
    actor: {
      login: run.triggering_actor.login,
      avatarUrl: run.triggering_actor.avatar_url,
      htmlUrl: run.triggering_actor.html_url,
    },
    repository: {
      owner,
      name: repo,
      fullName: `${owner}/${repo}`,
      htmlUrl: run.repository.html_url,
    },
    createdAt: run.created_at,
    updatedAt: run.updated_at,
    runStartedAt: run.run_started_at,
    htmlUrl: run.html_url,
    logsUrl: run.logs_url,
    jobsUrl: run.jobs_url,
    duration,
  }
}

/**
 * List GitHub Actions workflow runs
 */
export async function listActionRuns(
  octokit: Octokit,
  owner: string,
  repo: string,
  filters: ActionRunFilters = {}
): Promise<{ runs: ActionRun[]; totalCount: number }> {
  // Check cache first
  const cacheKey = `actions:${owner}:${repo}:${JSON.stringify(filters)}`
  const cached = await WorkflowCache.getList(owner, repo)

  const perPage = filters.per_page || 30
  const page = filters.page || 1

  try {
    const response = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: perPage,
      page,
      status: filters.status === 'failed' ? 'failure' : filters.status as any,
      branch: filters.branch,
    })

    const totalCount = response.data.total_count

    // Convert workflow runs
    const runs = response.data.workflow_runs.map(run =>
      workflowRunToActionRun(run, owner, repo)
    )

    // Cache the results
    await WorkflowCache.setList(owner, repo, runs as any, { ttl: CACHE_TTL.ACTIONS })

    return { runs, totalCount }
  } catch (error) {
    console.error('[Workflows] Error listing action runs:', error)
    throw error
  }
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Calculate workflow statistics
 */
export async function calculateWorkflowStats(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<WorkflowStats> {
  // Check cache first
  const cacheKey = `stats:${owner}:${repo}`
  const cached = await get<WorkflowStats>(cacheKey)
  if (cached && cached.data) {
    return cached.data
  }

  try {
    // Get all workflow issues
    const { workflows } = await listWorkflows(octokit, owner, repo, { per_page: 100 })

    // Calculate stats
    const stats: WorkflowStats = {
      total: workflows.length,
      pending: 0,
      active: 0,
      completed: 0,
      blocked: 0,
      failed: 0,
      byPhase: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
      byAgent: {},
    }

    for (const workflow of workflows) {
      // Count by state
      stats[workflow.state]++

      // Count by phase
      stats.byPhase[workflow.phase]++

      // Count by agent
      if (workflow.agent) {
        stats.byAgent[workflow.agent] = (stats.byAgent[workflow.agent] || 0) + 1
      }
    }

    // Cache the stats
    await set(cacheKey, stats, { ttl: CACHE_TTL.STATS })

    return stats
  } catch (error) {
    console.error('[Workflows] Error calculating stats:', error)
    throw error
  }
}

// ============================================================================
// Cache Helpers (re-export for convenience)
// ============================================================================

import { get, set } from '@/lib/cache'
