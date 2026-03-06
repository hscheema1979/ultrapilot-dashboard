/**
 * Workflow Monitoring Logic Tests
 *
 * Unit tests for workflow monitoring business logic.
 * Tests label parsing, workflow listing, heartbeat parsing, and statistics.
 *
 * @module lib/github/workflows.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Octokit } from 'octokit'
import {
  parseWorkflowState,
  parseWorkflowPhase,
  parseWorkflowAgent,
  parseDependencies,
  isWorkflowIssue,
  issueToWorkflow,
  parseHeartbeatComment,
  workflowRunToActionRun,
} from './workflows'
import type { Issue, Label, WorkflowRun } from '@/types/github'

// ============================================================================
// Mock Data
// ============================================================================

const mockLabels: Label[] = [
  { id: 1, name: 'workflow', color: '009800', description: 'Workflow issue' },
  { id: 2, name: 'queue:intake', color: '0075ca', description: 'Intake queue' },
  { id: 3, name: 'phase:2', color: '5319e7', description: 'Phase 2' },
  { id: 4, name: 'agent:ultra:executor', color: 'bfd4f2', description: 'Executor agent' },
]

const mockIssue: Issue = {
  id: 123,
  node_id: 'node_123',
  url: 'https://api.github.com/repos/owner/repo/issues/123',
  repository_url: 'https://api.github.com/repos/owner/repo',
  labels_url: 'https://api.github.com/repos/owner/repo/issues/123/labels',
  comments_url: 'https://api.github.com/repos/owner/repo/issues/123/comments',
  events_url: 'https://api.github.com/repos/owner/repo/issues/123/events',
  html_url: 'https://github.com/owner/repo/issues/123',
  number: 123,
  state: 'open',
  title: 'Test Workflow',
  body: 'Test workflow body',
  user: {
    login: 'testuser',
    id: 456,
    node_id: 'user_456',
    avatar_url: 'https://github.com/images/testuser',
    gravatar_id: '',
    url: 'https://api.github.com/users/testuser',
    html_url: 'https://github.com/testuser',
    type: 'User',
    site_admin: false,
  },
  labels: mockLabels,
  assignee: null,
  assignees: [],
  milestone: null,
  comments: 0,
  locked: false,
  active_lock_reason: null,
  created_at: '2026-03-06T12:00:00Z',
  updated_at: '2026-03-06T12:30:00Z',
  closed_at: null,
  author_association: 'OWNER',
}

const mockWorkflowRun: WorkflowRun = {
  id: 123456789,
  node_id: 'run_node_123',
  name: 'ci.yml',
  run_number: 42,
  run_attempt: 1,
  event: 'push',
  status: 'completed',
  conclusion: 'success',
  workflow_id: 1,
  check_suite_id: 1,
  check_suite_node_id: 'suite_node_1',
  head_branch: 'main',
  head_sha: 'abc123def456',
  url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789',
  html_url: 'https://github.com/owner/repo/actions/runs/123456789',
  created_at: '2026-03-06T12:00:00Z',
  updated_at: '2026-03-06T12:05:00Z',
  run_started_at: '2026-03-06T12:00:00Z',
  jobs_url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789/jobs',
  logs_url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789/logs',
  check_suite_url: 'https://api.github.com/repos/owner/repo/check-suites/1',
  artifacts_url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789/artifacts',
  cancel_url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789/cancel',
  rerun_url: 'https://api.github.com/repos/owner/repo/actions/runs/123456789/rerun',
  previous_attempt_url: null,
  triggering_actor: {
    login: 'testuser',
    id: 456,
    node_id: 'actor_456',
    avatar_url: 'https://github.com/images/testuser',
    gravatar_id: '',
    url: 'https://api.github.com/users/testuser',
    html_url: 'https://github.com/testuser',
    type: 'User',
    site_admin: false,
  },
  repository: {
    id: 1,
    node_id: 'repo_1',
    name: 'repo',
    full_name: 'owner/repo',
    private: false,
    owner: {
      login: 'owner',
      id: 1,
      node_id: 'owner_1',
      avatar_url: 'https://github.com/images/owner',
      gravatar_id: '',
      url: 'https://api.github.com/users/owner',
      html_url: 'https://github.com/owner',
      type: 'User',
      site_admin: false,
    },
    html_url: 'https://github.com/owner/repo',
    description: null,
  },
  head_commit: {
    id: 'abc123',
    tree_id: 'tree_123',
    message: 'Test commit',
    timestamp: '2026-03-06T12:00:00Z',
    author: {
      name: 'Test User',
      email: 'test@example.com',
      date: '2026-03-06T12:00:00Z',
    },
    committer: {
      name: 'Test User',
      email: 'test@example.com',
      date: '2026-03-06T12:00:00Z',
    },
  },
}

// ============================================================================
// Tests
// ============================================================================

describe('parseWorkflowState', () => {
  it('should parse blocked status', () => {
    const labels = [{ ...mockLabels[0], name: 'status:blocked' }]
    expect(parseWorkflowState(labels)).toBe('blocked')
  })

  it('should parse completed status', () => {
    const labels = [{ ...mockLabels[0], name: 'queue:done' }]
    expect(parseWorkflowState(labels)).toBe('completed')
  })

  it('should parse active status', () => {
    const labels = [{ ...mockLabels[0], name: 'queue:in-progress' }]
    expect(parseWorkflowState(labels)).toBe('active')
  })

  it('should parse pending status', () => {
    const labels = [{ ...mockLabels[0], name: 'queue:intake' }]
    expect(parseWorkflowState(labels)).toBe('pending')
  })

  it('should default to pending for unknown state', () => {
    const labels = [{ ...mockLabels[0], name: 'unknown' }]
    expect(parseWorkflowState(labels)).toBe('pending')
  })
})

describe('parseWorkflowPhase', () => {
  it('should parse phase from label', () => {
    const labels = [{ ...mockLabels[0], name: 'phase:3' }]
    expect(parseWorkflowPhase(labels)).toBe(3)
  })

  it('should default to phase 0 when no phase label', () => {
    const labels = [{ ...mockLabels[0], name: 'workflow' }]
    expect(parseWorkflowPhase(labels)).toBe(0)
  })

  it('should handle invalid phase numbers', () => {
    const labels = [{ ...mockLabels[0], name: 'phase:10' }]
    expect(parseWorkflowPhase(labels)).toBe(0)
  })
})

describe('parseWorkflowAgent', () => {
  it('should parse agent from label', () => {
    const labels = [{ ...mockLabels[0], name: 'agent:ultra:executor' }]
    expect(parseWorkflowAgent(labels)).toBe('ultra:executor')
  })

  it('should return null for unknown agent', () => {
    const labels = [{ ...mockLabels[0], name: 'agent:unknown' }]
    expect(parseWorkflowAgent(labels)).toBe(null)
  })

  it('should return null when no agent label', () => {
    const labels = [{ ...mockLabels[0], name: 'workflow' }]
    expect(parseWorkflowAgent(labels)).toBe(null)
  })
})

describe('parseDependencies', () => {
  it('should parse single dependency', () => {
    const labels = [{ ...mockLabels[0], name: 'depends-on:123' }]
    expect(parseDependencies(labels)).toEqual([123])
  })

  it('should parse multiple dependencies', () => {
    const labels = [{ ...mockLabels[0], name: 'depends-on:123,456,789' }]
    expect(parseDependencies(labels)).toEqual([123, 456, 789])
  })

  it('should return empty array when no dependencies', () => {
    const labels = [{ ...mockLabels[0], name: 'workflow' }]
    expect(parseDependencies(labels)).toEqual([])
  })

  it('should filter invalid dependency numbers', () => {
    const labels = [{ ...mockLabels[0], name: 'depends-on:123,abc,456' }]
    expect(parseDependencies(labels)).toEqual([123, 456])
  })
})

describe('isWorkflowIssue', () => {
  it('should return true for workflow issues', () => {
    expect(isWorkflowIssue(mockIssue)).toBe(true)
  })

  it('should return false for non-workflow issues', () => {
    const nonWorkflowIssue = {
      ...mockIssue,
      labels: [{ id: 1, name: 'bug', color: 'd73a4a', description: 'Bug' }],
    }
    expect(isWorkflowIssue(nonWorkflowIssue)).toBe(false)
  })
})

describe('issueToWorkflow', () => {
  it('should convert issue to workflow', () => {
    const workflow = issueToWorkflow(mockIssue, 'owner', 'repo')

    expect(workflow.id).toBe('owner/repo#123')
    expect(workflow.issueNumber).toBe(123)
    expect(workflow.owner).toBe('owner')
    expect(workflow.repo).toBe('repo')
    expect(workflow.title).toBe('Test Workflow')
    expect(workflow.state).toBe('pending')
    expect(workflow.phase).toBe(2)
    expect(workflow.agent).toBe('ultra:executor')
    expect(workflow.labels).toContain('workflow')
    expect(workflow.htmlUrl).toBe('https://github.com/owner/repo/issues/123')
  })
})

describe('parseHeartbeatComment', () => {
  it('should parse valid heartbeat JSON', () => {
    const commentBody = '```json\n' +
'{\n' +
'  "timestamp": "2026-03-06T12:00:00Z",\n' +
'  "cycle": 42,\n' +
'  "activeWorkflows": 3,\n' +
'  "scannerStatus": "active",\n' +
'  "validatorStatus": "active",\n' +
'  "triggerStatus": "idle",\n' +
'  "interventionStatus": "idle",\n' +
'  "health": "healthy"\n' +
'}\n' +
'```'

    const result = parseHeartbeatComment(commentBody)

    expect(result).not.toBeNull()
    expect(result?.timestamp).toBe('2026-03-06T12:00:00Z')
    expect(result?.cycle).toBe(42)
    expect(result?.activeWorkflows).toBe(3)
    expect(result?.scannerStatus).toBe('active')
    expect(result?.health).toBe('healthy')
  })

  it('should return null for invalid JSON', () => {
    const commentBody = '```json\ninvalid json\n```'
    const result = parseHeartbeatComment(commentBody)
    expect(result).toBeNull()
  })

  it('should return null for missing JSON block', () => {
    const commentBody = 'No JSON here'
    const result = parseHeartbeatComment(commentBody)
    expect(result).toBeNull()
  })

  it('should handle missing optional fields', () => {
    const commentBody = '```json\n' +
'{\n' +
'  "timestamp": "2026-03-06T12:00:00Z",\n' +
'  "cycle": 1\n' +
'}\n' +
'```'

    const result = parseHeartbeatComment(commentBody)

    expect(result).not.toBeNull()
    expect(result?.activeWorkflows).toBe(0)
    expect(result?.scannerStatus).toBe('idle')
    expect(result?.health).toBe('healthy')
  })
})

describe('workflowRunToActionRun', () => {
  it('should convert workflow run to action run', () => {
    const actionRun = workflowRunToActionRun(mockWorkflowRun, 'owner', 'repo')

    expect(actionRun.id).toBe(123456789)
    expect(actionRun.name).toBe('ci.yml')
    expect(actionRun.runNumber).toBe(42)
    expect(actionRun.status).toBe('completed')
    expect(actionRun.conclusion).toBe('success')
    expect(actionRun.headBranch).toBe('main')
    expect(actionRun.headSha).toBe('abc123def456')
    expect(actionRun.headCommitMessage).toBe('Test commit')
    expect(actionRun.actor.login).toBe('testuser')
    expect(actionRun.repository.owner).toBe('owner')
    expect(actionRun.repository.name).toBe('repo')
    expect(actionRun.htmlUrl).toBe('https://github.com/owner/repo/actions/runs/123456789')
  })

  it('should calculate duration', () => {
    const actionRun = workflowRunToActionRun(mockWorkflowRun, 'owner', 'repo')

    expect(actionRun.duration).toBeDefined()
    expect(actionRun.duration).toBeGreaterThan(0)
  })

  it('should handle failed status', () => {
    const failedRun = {
      ...mockWorkflowRun,
      status: 'completed',
      conclusion: 'failure',
    }

    const actionRun = workflowRunToActionRun(failedRun, 'owner', 'repo')

    expect(actionRun.status).toBe('failed')
    expect(actionRun.conclusion).toBe('failure')
  })

  it('should handle in-progress status', () => {
    const inProgressRun = {
      ...mockWorkflowRun,
      status: 'in_progress',
      conclusion: null,
    }

    const actionRun = workflowRunToActionRun(inProgressRun, 'owner', 'repo')

    expect(actionRun.status).toBe('in_progress')
    expect(actionRun.conclusion).toBeNull()
  })
})
