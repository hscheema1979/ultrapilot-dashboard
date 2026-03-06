// Lifecycle Types and Constants

export const LIFECYCLE_PHASES = [
  { id: 'initiation', name: 'Initiation', icon: 'Zap', color: 'blue' },
  { id: 'requirements', name: 'Requirements', icon: 'FileText', color: 'purple' },
  { id: 'architecture', name: 'Architecture', icon: 'Layout', color: 'indigo' },
  { id: 'planning', name: 'Planning', icon: 'ListTodo', color: 'cyan' },
  { id: 'execution', name: 'Execution', icon: 'Code', color: 'green' },
  { id: 'verification', name: 'Verification', icon: 'CheckCircle', color: 'teal' },
  { id: 'review', name: 'Review', icon: 'GitBranch', color: 'orange' },
  { id: 'approval', name: 'Approval', icon: 'User', color: 'yellow' },
  { id: 'deployment', name: 'Deployment', icon: 'Rocket', color: 'red' },
  { id: 'monitoring', name: 'Monitoring', icon: 'BarChart', color: 'pink' }
] as const

export type LifecyclePhase = typeof LIFECYCLE_PHASES[number]['id']

export interface ProjectMetrics {
  // Time metrics
  cycleTime: number
  leadTime: number
  activeTime: number
  waitTime: number

  // Quality metrics
  bugRate: number
  testCoverage: number
  codeQualityScore: number

  // Agent metrics
  agentsInvolved: string[]
  agentTime: Record<string, number>

  // User metrics
  satisfaction: number
  iterations: number

  // Outcome
  status: 'success' | 'failed' | 'partial'
  issuesCreated: number
  prsCreated: number
  linesChanged: number
}

export interface LifecycleProject {
  issueId: number
  title: string
  projectId: string
  phase: LifecyclePhase
  progress: number
  started: string
  updated: string
  labels: string[]
  agent: string
  metrics: Partial<ProjectMetrics>
  url: string
}

export interface Bottleneck {
  type: 'phase' | 'agent' | 'approval'
  phase?: string
  agent?: string
  count?: number
  time?: number
  severity: 'low' | 'medium' | 'high'
}
