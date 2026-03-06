/**
 * GitHub Type Definitions
 *
 * Comprehensive TypeScript interfaces for GitHub API v3 objects.
 * These types align with the GitHub REST API v3 schema and are used
 * throughout the UltraPilot Dashboard for type-safe API interactions.
 *
 * DEPENDENCY VERSIONS (Task 0.5.3 - Installed 2026-03-06):
 * - @vercel/kv: ^3.0.0 (Distributed cache for Redis/KV store)
 * - sonner: ^2.0.7 (Toast notifications for shadcn/ui)
 * - zod: ^4.3.6 (Schema validation and type-safe parsing)
 * - @octokit/auth-app: ^8.2.0 (GitHub App authentication)
 * - @octokit/rest: ^22.0.1 (GitHub REST API client)
 *
 * SHADCN/UI COMPONENTS INSTALLED (21 components):
 * - alert, alert-dialog, avatar, badge, button, card, dialog, dropdown-menu,
 *   input, label, progress, scroll-area, select, separator, sheet, skeleton,
 *   switch, table, tabs, textarea, tooltip
 *
 * @see https://docs.github.com/en/rest
 * @module types/github
 */

// ============================================================================
// Core Types
// ============================================================================

/**
 * GitHub user account information
 */
export interface User {
  /** Unique identifier for the user */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Username */
  login: string
  /** URL to user's profile page */
  url: string
  /** URL to user's HTML profile */
  html_url: string
  /** URL to user's avatar image */
  avatar_url: string
  /** Gravatar ID (if applicable) */
  gravatar_id: string
  /** User type: User, Bot, or Organization */
  type: 'User' | 'Bot' | 'Organization'
  /** Whether the user is a site admin */
  site_admin: boolean
  /** User's display name (optional) */
  name?: string | null
  /** User's company (optional) */
  company?: string | null
  /** User's blog/website (optional) */
  blog?: string | null
  /** User's location (optional) */
  location?: string | null
  /** User's email (optional) */
  email?: string | null
  /** Whether the user is hireable (optional) */
  hireable?: boolean | null
  /** User's bio (optional) */
  bio?: string | null
  /** Number of public followers */
  followers: number
  /** Number of users following */
  following: number
  /** Number of public repositories */
  public_repos: number
  /** Number of public gists */
  public_gists: number
  /** Account creation date */
  created_at: string
  /** Account last update date */
  updated_at: string
}

/**
 * GitHub organization account
 */
export interface Organization {
  /** Unique identifier for the organization */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Organization login/username */
  login: string
  /** URL to organization's profile */
  url: string
  /** URL to organization's HTML profile */
  html_url: string
  /** URL to organization's avatar */
  avatar_url: string
  /** Organization description (optional) */
  description?: string | null
  /** Organization type (always 'Organization') */
  type: 'Organization'
  /** Whether the org is a verified organization */
  is_verified?: boolean
  /** Number of public repositories */
  public_repos: number
}

/**
 * Simple user reference (in issues, comments, etc.)
 */
export interface SimpleUser {
  id: number
  login: string
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  type: string
  site_admin: boolean
}

// ============================================================================
// Repository Types
// ============================================================================

/**
 * Repository permissions
 */
export interface RepositoryPermissions {
  /** Can admin the repository */
  admin: boolean
  /** Can maintain (for org repos) */
  maintain?: boolean
  /** Can push to the repository */
  push: boolean
  /** Can read/triage issues */
  triage?: boolean
  /** Can pull/read the repository */
  pull: boolean
}

/**
 * GitHub repository information
 */
export interface Repository {
  /** Unique repository identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Repository name */
  name: string
  /** Full name including owner (owner/repo) */
  full_name: string
  /** Owner of the repository */
  owner: SimpleUser
  /** Repository description */
  description: string | null
  /** Whether the repository is private */
  private: boolean
  /** Whether the repository is a fork */
  fork: boolean
  /** Repository creation date */
  created_at: string
  /** Repository last update date */
  updated_at: string
  /** Last push date */
  pushed_at: string
  /** Homepage URL */
  homepage: string | null
  /** Repository size in KB */
  size: number
  /** Number of stargazers */
  stargazers_count: number
  /** Number of watchers */
  watchers_count: number
  /** Number of forks */
  forks_count: number
  /** Number of open issues */
  open_issues_count: number
  /** Primary programming language */
  language: string | null
  /** Whether issues are enabled */
  has_issues: boolean
  /** Whether projects are enabled */
  has_projects: boolean
  /** Whether wiki is enabled */
  has_wiki: boolean
  /** Whether pages are enabled */
  has_pages: boolean
  /** Whether discussions are enabled */
  has_discussions: boolean
  /** Default branch name */
  default_branch: string
  /** Repository permissions for current user */
  permissions?: RepositoryPermissions
  /** Whether the repository is a template */
  is_template?: boolean
  /** Template repository (if this is a fork from template) */
  template_repository?: Repository | null
  /** Parent repository (if this is a fork) */
  parent?: Repository | null
  /** Source repository (if this is a fork) */
  source?: Repository | null
  /** License information */
  license?: {
    key: string
    name: string
    url?: string
    spdx_id?: string
    node_id?: string
  } | null
  /** Repository topics */
  topics?: string[]
  /** URL to clone via HTTPS */
  clone_url: string
  /** URL to clone via Git */
  git_url: string
  /** URL to clone via SSH */
  ssh_url: string
  /** URL to clone via GitHub CLI */
  cli_url?: string
  /** SVN URL */
  svn_url: string
  /** Repository mirror URL (if mirrored) */
  mirror_url?: string | null
  /** Whether the repository is archived */
  archived: boolean
  /** Number of subscribers */
  subscribers_count: number
}

// ============================================================================
// Issue Types
// ============================================================================

/**
 * GitHub issue label
 */
export interface Label {
  /** Unique label identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Label URL */
  url: string
  /** Label name */
  name: string
  /** Label color (hex code without #) */
  color: string
  /** Whether this is a default label */
  default: boolean
  /** Label description */
  description?: string | null
}

/**
 * Issue milestone
 */
export interface Milestone {
  /** Unique milestone identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Milestone number */
  number: number
  /** Milestone title */
  title: string
  /** Milestone description */
  description: string | null
  /** Creator of the milestone */
  creator: SimpleUser
  /** Number of open issues */
  open_issues: number
  /** Number of closed issues */
  closed_issues: number
  /** Milestone state */
  state: 'open' | 'closed'
  /** Milestone creation date */
  created_at: string
  /** Milestone last update date */
  updated_at: string
  /** Milestone due date (optional) */
  due_on: string | null
  /** Milestone closed date (if closed) */
  closed_at: string | null
}

/**
 * Issue reaction
 */
export interface Reaction {
  /** Unique reaction identifier */
  id: number
  /** User who reacted */
  user: SimpleUser
  /** Reaction content */
  content: '+1' | '-1' | 'laugh' | 'hooray' | 'confused' | 'heart' | 'rocket' | 'eyes'
  /** Reaction creation date */
  created_at: string
}

/**
 * Timeline event in an issue
 */
export interface TimelineEvent {
  /** Unique event identifier */
  id: number
  /** Event type */
  event: 'labeled' | 'unlabeled' | 'milestoned' | 'demilestoned' | 'assigned' |
         'unassigned' | 'closed' | 'reopened' | 'renamed' | 'locked' | 'unlocked' |
         'referenced' | 'cross-referenced' | 'commented' | 'committed'
  /** Actor who triggered the event */
  actor: SimpleUser | null
  /** Event creation date */
  created_at: string
  /** Label (if label event) */
  label?: Label
  /** Milestone (if milestone event) */
  milestone?: Milestone
  /** Assignee (if assignment event) */
  assignee?: SimpleUser | null
  /** Rename details (if renamed event) */
  rename?: {
    from: string
    to: string
  }
  /** Commit details (if commit event) */
  commit_id?: string
  /** Commit URL */
  commit_url?: string
}

/**
 * GitHub issue or pull request
 */
export interface Issue {
  /** Unique issue identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Issue URL */
  url: string
  /** Repository URL */
  repository_url: string
  /** Labels URL */
  labels_url: string
  /** Comments URL */
  comments_url: string
  /** Events URL */
  events_url: string
  /** HTML URL */
  html_url: string
  /** Issue number */
  number: number
  /** Issue state */
  state: 'open' | 'closed'
  /** Issue state reason (if completed) */
  state_reason?: 'completed' | 'not_planned' | null
  /** Issue title */
  title: string
  /** Issue body/description */
  body: string | null
  /** User who created the issue */
  user: SimpleUser
  /** Labels attached to the issue */
  labels: Label[]
  /** Primary assignee */
  assignee: SimpleUser | null
  /** All assignees */
  assignees: SimpleUser[]
  /** Milestone (if attached) */
  milestone: Milestone | null
  /** Number of comments */
  comments: number
  /** Whether the issue is locked */
  locked: boolean
  /** Active lock reason (if locked) */
  active_lock_reason: 'resolved' | 'off-topic' | 'too heated' | 'spam' | null
  /** Issue creation date */
  created_at: string
  /** Issue last update date */
  updated_at: string
  /** Issue closed date (if closed) */
  closed_at: string | null
  /** Author's association with the repo */
  author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' |
                       'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER'
  /** Reactions to the issue */
  reactions?: {
    url: string
    total_count: number
    '+1': number
    '-1': number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
  }
  /** Whether the issue is a pull request */
  pull_request?: {
    url: string
    html_url: string
    diff_url: string
    patch_url: string
  }
  /** Issue timeline URL */
  timeline_url?: string
  /** Whether the issue has a draft flag (PRs only) */
  draft?: boolean
  /** Whether the issue is pinned */
  pinned?: boolean
}

// ============================================================================
// Pull Request Types
// ============================================================================

/**
 * Pull request status
 */
export interface PullRequestStatus {
  /** Status check state */
  state: 'pending' | 'success' | 'failure' | 'error'
  /** Status context */
  context: string
  /** Status description */
  description?: string
  /** Target URL for more info */
  target_url?: string | null
  /** Status creation date */
  created_at: string
  /** Status last update date */
  updated_at: string
}

/**
 * Pull request review
 */
export interface PullRequestReview {
  /** Unique review identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Review user */
  user: SimpleUser
  /** Review body */
  body: string | null
  /** Review state */
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING'
  /** Review submission date */
  submitted_at: string
  /** Review commit ID */
  commit_id: string
  /** Review HTML URL */
  html_url: string
  /** Pull request URL */
  pull_request_url: string
}

/**
 * Pull request
 */
export interface PullRequest extends Issue {
  /** Pull request specific: merged status */
  merged: boolean
  /** Whether the PR is mergeable */
  mergeable: boolean | null
  /** Whether the PR can be merged cleanly */
  mergeable_state: 'behind' | 'clean' | 'dirty' | 'draft' | 'unknown' | 'unstable'
  /** Whether the PR is a draft */
  draft: boolean
  /** Merge commit SHA (if merged) */
  merge_commit_sha: string | null
  /** PR merge date (if merged) */
  merged_at: string | null
  /** PR merge state */
  merged_by: SimpleUser | null
  /** PR merge commit message */
  merge_commit_message: string | null
  /** Comment count (includes review comments) */
  review_comments: number
  /** Number of commits in the PR */
  commits: number
  /** Number of additions in the PR */
  additions: number
  /** Number of deletions in the PR */
  deletions: number
  /** Number of files changed */
  changed_files: number
  /** Head (source) branch reference */
  head: {
    label: string
    ref: string
    sha: string
    user: SimpleUser
    repo: Repository | null
  }
  /** Base (target) branch reference */
  base: {
    label: string
    ref: string
    sha: string
    user: SimpleUser
    repo: Repository
  }
  /** PR author association */
  author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' |
                       'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER'
  /** Whether the PR maintains (can only be edited by maintainers) */
  maintainers_can_modify: boolean
  /** Requested reviewers (for team reviews) */
  requested_reviewers?: SimpleUser[]
  /** Requested teams (for team reviews) */
  requested_teams?: Array<{
    id: number
    node_id: string
    slug: string
    name: string
    description: string | null
    privacy: 'closed' | 'secret'
    permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage'
  }>
}

// ============================================================================
// Comment Types
// ============================================================================

/**
 * Issue comment
 */
export interface IssueComment {
  /** Unique comment identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Comment URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Issue URL (deprecated, use issue_url below) */
  issue_url: string
  /** Comment author */
  user: SimpleUser
  /** Comment creation date */
  created_at: string
  /** Comment last update date */
  updated_at: string
  /** Comment body */
  body: string
  /** Author's association */
  author_association: 'COLLABORATOR' | 'CONTRIBUTOR' | 'FIRST_TIMER' |
                       'FIRST_TIME_CONTRIBUTOR' | 'MANNEQUIN' | 'MEMBER' | 'NONE' | 'OWNER'
  /** Reactions to the comment */
  reactions?: {
    url: string
    total_count: number
    '+1': number
    '-1': number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
  }
  /** Performed via GitHub App (if applicable) */
  performed_via_github_app?: {
    id: number
    slug: string
    name: string
  }
}

/**
 * Pull request review comment
 */
export interface PullRequestReviewComment extends IssueComment {
  /** Review comment position in diff */
  position: number | null
  /** Original position in diff */
  original_position: number | null
  /** Commit ID */
  commit_id: string
  /** Original commit ID */
  original_commit_id: string
  /** Diff hunk */
  diff_hunk: string
  /** Comment path (file) */
  path: string
  /** Pull request URL */
  pull_request_url: string
  /** Review ID (if part of a review) */
  pull_request_review_id?: number
}

// ============================================================================
// Branch & Commit Types
// ============================================================================

/**
 * Git branch
 */
export interface Branch {
  /** Branch name */
  name: string
  /** Branch commit */
  commit: {
    sha: string
    url: string
  }
  /** Whether this is the default branch */
  protected?: boolean
}

/**
 * Git commit
 */
export interface Commit {
  /** Commit SHA */
  sha: string
  /** Node ID for GraphQL */
  node_id: string
  /** Commit URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Commit author details */
  author: {
    name: string
    email: string
    date: string
  }
  /** Commit committer details */
  committer: {
    name: string
    email: string
    date: string
  }
  /** Commit message */
  message: string
  /** Commit tree */
  tree: {
    sha: string
    url: string
  }
  /** Parent commits */
  parents: Array<{
    sha: string
    url: string
  }>
  /** Verification status */
  verification?: {
    verified: boolean
    reason: string
    signature: string | null
    payload: string | null
  }
  /** Number of lines added */
  stats?: {
    additions: number
    deletions: number
    total: number
  }
  /** Files changed */
  files?: Array<{
    sha: string
    filename: string
    status: 'added' | 'removed' | 'modified' | 'renamed' | 'copied'
    additions: number
    deletions: number
    changes: number
    blob_url: string
    raw_url: string
    contents_url: string
    patch?: string
    previous_filename?: string
  }>
}

// ============================================================================
// Workflow & CI/CD Types
// ============================================================================

/**
 * GitHub Actions workflow run
 */
export interface WorkflowRun {
  /** Unique run identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Workflow name */
  name: string
  /** Workflow run number (repository-specific) */
  run_number: number
  /** Workflow run attempt number (for re-runs) */
  run_attempt: number
  /** Event that triggered the workflow */
  event: 'push' | 'pull_request' | 'workflow_dispatch' | 'schedule' | 'release' | 'manual'
  /** Workflow status */
  status: 'queued' | 'in_progress' | 'completed' | 'waiting' | 'pending' | 'unknown'
  /** Workflow conclusion (if completed) */
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | 'action_required' | 'neutral' | null
  /** Workflow ID */
  workflow_id: number
  /** Check suite ID */
  check_suite_id: number
  /** Check suite node ID */
  check_suite_node_id: string
  /** Head branch */
  head_branch: string
  /** Head commit SHA */
  head_sha: string
  /** Workflow run URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Workflow run creation date */
  created_at: string
  /** Workflow run last update date */
  updated_at: string
  /** Workflow run start date */
  run_started_at: string
  /** Jobs URL */
  jobs_url: string
  /** Logs URL */
  logs_url: string
  /** Check suite URL */
  check_suite_url: string
  /** Artifacts URL */
  artifacts_url: string
  /** Cancel URL */
  cancel_url: string
  /** Rerun URL */
  rerun_url: string
  /** Previous attempt URL */
  previous_attempt_url: string | null
  /** Actor who triggered the workflow */
  triggering_actor: SimpleUser
  /** Repository information */
  repository: Repository
  /** Head commit information */
  head_commit: {
    id: string
    tree_id: string
    message: string
    timestamp: string
    author: {
      name: string
      email: string
    }
    committer: {
      name: string
      email: string
    }
  } | null
  /** Workflow run duration in seconds */
  run_duration?: number
}

/**
 * Check suite
 */
export interface CheckSuite {
  /** Unique check suite identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Head branch */
  head_branch: string
  /** Head SHA */
  head_sha: string
  /** Check suite status */
  status: 'queued' | 'in_progress' | 'completed' | 'unknown'
  /** Check suite conclusion */
  conclusion: 'success' | 'failure' | 'timed_out' | 'cancelled' | 'action_required' | 'neutral' | null
  /** Check suite URL */
  url: string
  /** Check suite creation date */
  created_at: string
  /** Check suite last update date */
  updated_at: string
  /** Pull requests (if triggered by PR) */
  pull_requests: Array<{
    url: string
    id: number
    number: number
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
      sha: string
    }
  }>
  /** Check suite app */
  app?: {
    id: number
    slug: string
    name: string
  }
}

/**
 * Check run
 */
export interface CheckRun {
  /** Unique check run identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Check run name */
  name: string
  /** Check run status */
  status: 'queued' | 'in_progress' | 'completed' | 'unknown'
  /** Check run conclusion */
  conclusion: 'success' | 'failure' | 'timed_out' | 'cancelled' | 'action_required' | 'neutral' | null
  /** Head SHA */
  head_sha: string
  /** Check run URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Check run details URL */
  details_url: string | null
  /** Check run start time */
  started_at: string
  /** Check run completion time */
  completed_at: string | null
  /** External ID (for integrations) */
  external_id: string | null
  /** Check run output */
  output: {
    title: string | null
    summary: string | null
    text: string | null
    annotations_count: number
    annotations_url: string
  }
  /** Check run app */
  app?: {
    id: number
    slug: string
    name: string
  }
  /** Pull requests (if triggered by PR) */
  pull_requests: Array<{
    url: string
    id: number
    number: number
    head: {
      ref: string
      sha: string
    }
    base: {
      ref: string
      sha: string
    }
  }>
}

// ============================================================================
// Project Types
// ============================================================================

/**
 * GitHub Project (classic)
 */
export interface Project {
  /** Unique project identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Project name */
  name: string
  /** Project description */
  body: string | null
  /** Project number (repository-specific) */
  number: number
  /** Project state */
  state: 'open' | 'closed'
  /** Project creator */
  creator: SimpleUser
  /** Project creation date */
  created_at: string
  /** Project last update date */
  updated_at: string
  /** Project URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Columns URL */
  columns_url: string
  /** Project owner (user or org) */
  owner: SimpleUser | Organization
}

/**
 * Project column
 */
export interface ProjectColumn {
  /** Unique column identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Column name */
  name: string
  /** Column creation date */
  created_at: string
  /** Column last update date */
  updated_at: string
  /** Project URL */
  project_url: string
}

/**
 * Project card
 */
export interface ProjectCard {
  /** Unique card identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Column ID */
  column_id: number
  /** Card content URL (issue URL) */
  content_url: string | null
  /** Card creation date */
  created_at: string
  /** Card last update date */
  updated_at: string
  /** Card archived status */
  archived: boolean
  /** Card note (if not linked to issue) */
  note: string | null
  /** Associated issue (if linked) */
  content?: Issue
}

// ============================================================================
// Release Types
// ============================================================================

/**
 * GitHub release
 */
export interface Release {
  /** Unique release identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Tag name */
  tag_name: string
  /** Target commitish (branch/commit) */
  target_commitish: string
  /** Release name (optional) */
  name: string | null
  /** Release body/description */
  body: string | null
  /** Whether this is a draft release */
  draft: boolean
  /** Whether this is a prerelease */
  prerelease: boolean
  /** Release creation date */
  created_at: string
  /** Release publication date */
  published_at: string | null
  /** Release author */
  author: SimpleUser
  /** Release assets */
  assets: Array<{
    url: string
    browser_download_url: string
    id: number
    node_id: string
    name: string
    label: string | null
    state: 'uploaded' | 'uploading'
    content_type: string
    size: number
    download_count: number
    created_at: string
    updated_at: string
    uploader: SimpleUser
  }>
  /** Release URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Assets URL */
  assets_url: string
  /** Upload URL */
  upload_url: string
  /** Tarball URL */
  tarball_url: string
  /** Zipball URL */
  zipball_url: string
}

// ============================================================================
// Deployment Types
// ============================================================================

/**
 * GitHub deployment
 */
export interface Deployment {
  /** Unique deployment identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Deployment SHA */
  sha: string
  /** Deployment ref (branch/tag) */
  ref: string
  /** Deployment task */
  task: string
  /** Deployment payload */
  payload: Record<string, unknown> | null
  /** Original environment (for promotion) */
  original_environment: string | null
  /** Deployment environment */
  environment: string
  /** Description */
  description: string | null
  /** Creator */
  creator: SimpleUser
  /** Creation date */
  created_at: string
  /** Last update date */
  updated_at: string
  /** Deployment statuses URL */
  statuses_url: string
  /** Repository URL */
  repository_url: string
  /** Transient environment */
  transient_environment: boolean | null
  /** Production environment */
  production_environment: boolean | null
}

/**
 * Deployment status
 */
export interface DeploymentStatus {
  /** Unique status identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Deployment state */
  state: 'pending' | 'success' | 'failure' | 'error' | 'inactive' | 'in_progress' | 'queued'
  /** Creator */
  creator: SimpleUser
  /** Description */
  description: string | null
  /** Deployment environment */
  environment: string
  /** Deprecated: environment (use deployment.environment) */
  deprecated_environment: string | null
  /** Target URL */
  target_url: string | null
  /** Creation date */
  created_at: string
  /** Last update date */
  updated_at: string
  /** Deployment URL */
  deployment_url: string
  /** Repository URL */
  repository_url: string
  /** Environment URL */
  environment_url: string | null
  /** Log URL */
  log_url: string | null
}

// ============================================================================
// Webhook Types
// ============================================================================

/**
 * Webhook headers
 */
export interface WebhookHeaders {
  /** GitHub delivery ID */
  'x-github-delivery': string
  /** GitHub event name */
  'x-github-event': string
  /** GitHub signature */
  'x-hub-signature': string
  /** GitHub signature 256 */
  'x-hub-signature-256': string
  /** GitHub app ID */
  'x-github-hook-id': string
}

/**
 * Webhook payload base
 */
export interface WebhookPayload {
  /** Delivery ID */
  delivery_id: string
  /** Event name */
  event_name: string
  /** Event action */
  action?: string
  /** Installation ID */
  installation?: {
    id: number
    node_id: string
  }
  /** Organization */
  organization?: Organization
  /** Repository */
  repository?: Repository
  /** Sender */
  sender?: SimpleUser
  /** Timestamp */
  timestamp?: string
}

// ============================================================================
// Search Types
// ============================================================================

/**
 * Search results
 */
export interface SearchResults<T> {
  /** Total count of results */
  total_count: number
  /** Whether results are incomplete */
  incomplete_results: boolean
  /** Array of items */
  items: T[]
}

/**
 * Search code result
 */
export interface SearchCodeResult {
  /** Repository name */
  name: string
  /** Full path */
  path: string
  /** SHA */
  sha: string
  /** File URL */
  url: string
  /** Git URL */
  git_url: string
  /** HTML URL */
  html_url: string
  /** Repository information */
  repository: Repository
}

// ============================================================================
// Rate Limit Types
// ============================================================================

/**
 * Rate limit status
 */
export interface RateLimit {
  /** Rate limit resources */
  resources: {
    /** Core API rate limit */
    core: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
    /** Search API rate limit */
    search: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
    /** GraphQL rate limit */
    graphql?: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
    /** Integration manifest rate limit */
    integration_manifest?: {
      limit: number
      remaining: number
      reset: number
      used: number
    }
  }
  /** Rate limit status */
  rate: {
    limit: number
    remaining: number
    reset: number
    used: number
  }
}

// ============================================================================
// App Types
// ============================================================================

/**
 * GitHub App
 */
export interface App {
  /** Unique app identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** App slug */
  slug: string
  /** App name */
  name: string
  /** App description */
  description: string | null
  /** App external URL */
  external_url: string
  /** HTML URL */
  html_url: string
  /** App creation date */
  created_at: string
  /** App last update date */
  updated_at: string
  /** App owner */
  owner: SimpleUser | Organization
  /** App permissions */
  permissions: Record<string, string>
  /** App events */
  events: string[]
  /** App installations count */
  installations_count: number
}

/**
 * GitHub App installation
 */
export interface Installation {
  /** Unique installation identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** App account */
  app: {
    id: number
    slug: string
    node_id: string
    owner: SimpleUser | Organization
    name: string
    description: string | null
    external_url: string
    html_url: string
    created_at: string
    updated_at: string
    permissions: Record<string, string>
    events: string[]
  }
  /** Installation target account */
  account: SimpleUser | Organization
  /** Access tokens URL */
  access_tokens_url: string
  /** Repositories URL */
  repositories_url: string
  /** Installation creation date */
  created_at: string
  /** Installation last update date */
  updated_at: string
  /** App events */
  events: string[] | null
  /** App permissions */
  permissions: Record<string, string> | null
  /** Repository selection */
  repository_selection: 'all' | 'selected'
  /** Single file name (if restricted) */
  single_file_name?: string | null
  /** Single file paths (if restricted) */
  single_file_paths?: string[] | null
  /** Suggested by (if suggested installation) */
  suspended_by?: SimpleUser | null
  /** Suspension reason */
  suspended_at?: string | null
}

// ============================================================================
// Team Types
// ============================================================================

/**
 * GitHub team
 */
export interface Team {
  /** Unique team identifier */
  id: number
  /** Node ID for GraphQL */
  node_id: string
  /** Team name */
  name: string
  /** Team slug (URL-friendly) */
  slug: string
  /** Team description */
  description: string | null
  /** Team privacy level */
  privacy: 'closed' | 'secret'
  /** Team permission */
  permission: 'pull' | 'push' | 'admin' | 'maintain' | 'triage'
  /** Team URL */
  url: string
  /** HTML URL */
  html_url: string
  /** Members URL */
  members_url: string
  /** Repositories URL */
  repositories_url: string
  /** Team creation date */
  created_at: string
  /** Team last update date */
  updated_at: string
  /** Team parent (if nested) */
  parent?: Team | null
}

// ============================================================================
// Misc Types
// ============================================================================

/**
 * Git reference
 */
export interface GitReference {
  /** Ref name */
  ref: string
  /** Node ID for GraphQL */
  node_id: string
  /** Ref URL */
  url: string
  /** Object the ref points to */
  object: {
    type: 'commit' | 'tree' | 'blob' | 'tag'
    sha: string
    url: string
  }
}

/**
 * Git tag
 */
export interface GitTag {
  /** Tag name */
  tag: string
  /** Node ID for GraphQL */
  node_id: string
  /** Tag SHA */
  sha: string
  /** Tag URL */
  url: string
  /** Tag message */
  message: string
  /** Tagger */
  tagger: {
    name: string
    email: string
    date: string
  }
  /** Tag object */
  object: {
    type: 'commit' | 'tree' | 'blob'
    sha: string
    url: string
  }
}

/**
 * Repository traffic stats
 */
export interface TrafficStats {
  /** Number of views in the last 14 days */
  count: number
  /** Number of uniques in the last 14 days */
  uniques: number
  /** Daily views breakdown */
  views: Array<{
    timestamp: string
    count: number
    uniques: number
  }>
}

/**
 * Repository clone stats
 */
export interface CloneStats {
  /** Number of clones in the last 14 days */
  count: number
  /** Number of unique cloners in the last 14 days */
  uniques: number
  /** Daily clones breakdown */
  clones: Array<{
    timestamp: string
    count: number
    uniques: number
  }>
}
