import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/project-context'

export interface Workflow {
  id: number
  name: string
  status: string
  trigger: string
  branch: string
  duration: string
  progress: number
  lastRun: string
  url: string
}

export interface Project {
  id: number
  name: string
  description: string
  status: string
  progress: number
  totalTasks: number
  completedTasks: number
  team: string[]
  priority: string
  dueDate: string
  url: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: string
  priority: string
  assignee: string | null
  labels: string[]
  createdAt: string
  dueDate: string
  url: string
}

export interface Metrics {
  workflows: {
    total: number
    change: string
    runningNow: number
    active: number
    successfulToday: number
    successRate: string
    failedToday: number
  }
  projects: {
    total: number
    active: number
    onTrack: number
    atRisk: number
  }
  tasks: {
    total: number
    open: number
    inProgress: number
    inReview: number
    completed: number
    overdue: number
  }
}

export function useWorkflows() {
  const { currentProject } = useProject()
  const [data, setData] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWorkflows() {
      if (!currentProject) {
        setData([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/workflows?owner=${currentProject.owner}&repo=${currentProject.repo}`)
        if (!response.ok) throw new Error('Failed to fetch workflows')
        const json = await response.json()
        setData(json.workflows)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [currentProject])

  return { data, loading, error }
}

export function useTasks(status?: string) {
  const { currentProject } = useProject()
  const [data, setData] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      if (!currentProject) {
        setData([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const url = status
          ? `/api/tasks?status=${status}&owner=${currentProject.owner}&repo=${currentProject.repo}`
          : `/api/tasks?owner=${currentProject.owner}&repo=${currentProject.repo}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const json = await response.json()
        setData(json.tasks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [currentProject, status])

  return { data, loading, error }
}

export function useProjects() {
  const { currentProject } = useProject()
  const [data, setData] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      if (!currentProject) {
        setData([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        // Try to fetch GitHub Projects
        const response = await fetch(`/api/projects?owner=${currentProject.owner}&repo=${currentProject.repo}`)
        if (!response.ok) throw new Error('Failed to fetch projects')
        const json = await response.json()
        setData(json.projects || [])
      } catch (err) {
        // If GitHub Projects fail, return empty array (not critical)
        console.log('GitHub Projects not available:', err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [currentProject])

  return { data, loading, error }
}

export function useMetrics() {
  const { currentProject } = useProject()
  const [data, setData] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      if (!currentProject) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [workflowsRes, tasksRes] = await Promise.all([
          fetch(`/api/workflows?owner=${currentProject.owner}&repo=${currentProject.repo}`),
          fetch(`/api/tasks?owner=${currentProject.owner}&repo=${currentProject.repo}`),
        ])

        const workflowsData = await workflowsRes.json()
        const tasksData = await tasksRes.json()

        // Calculate metrics
        const metrics: Metrics = {
          workflows: {
            total: workflowsData.total || 0,
            change: "+3 this week",
            runningNow: workflowsData.running || 0,
            active: workflowsData.running || 0,
            successfulToday: workflowsData.completed || 0,
            successRate: workflowsData.total > 0
              ? `${Math.round((workflowsData.completed / workflowsData.total) * 100)}%`
              : 'N/A',
            failedToday: workflowsData.failed || 0,
          },
          projects: {
            total: 0,
            active: 0,
            onTrack: 0,
            atRisk: 0,
          },
          tasks: {
            total: tasksData.total || 0,
            open: tasksData.open || 0,
            inProgress: tasksData.inProgress || 0,
            inReview: tasksData.inReview || 0,
            completed: tasksData.completed || 0,
            overdue: 0,
          },
        }

        setData(metrics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [currentProject])

  return { data, loading, error }
}
