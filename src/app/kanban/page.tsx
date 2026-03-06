'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react"
import { useProject } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface Task {
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
  projectName?: string
}

const COLUMNS = {
  'open': { title: 'Open', icon: AlertCircle, color: 'text-gray-500' },
  'in-progress': { title: 'In Progress', icon: Clock, color: 'text-yellow-600' },
  'completed': { title: 'Completed', icon: CheckCircle2, color: 'text-green-600' }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "Critical": return "bg-red-600"
    case "High": return "bg-orange-500"
    case "Medium": return "bg-blue-500"
    case "Low": return "bg-gray-500"
    default: return "bg-gray-500"
  }
}

export default function KanbanPage() {
  const { projects, currentProject, setCurrentProject } = useProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('all')

  useEffect(() => {
    async function fetchAllTasks() {
      if (projects.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const allTasks: Task[] = []

        for (const project of projects) {
          try {
            const response = await fetch(
              `/api/tasks?owner=${project.owner}&repo=${project.repo}`
            )
            if (response.ok) {
              const data = await response.json()
              const projectTasks = (data.tasks || []).map((task: Task) => ({
                ...task,
                projectName: project.name
              }))
              allTasks.push(...projectTasks)
            }
          } catch (error) {
            console.error(`Error fetching tasks for ${project.name}:`, error)
          }
        }

        setTasks(allTasks)
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllTasks()
  }, [projects])

  const filteredTasks = selectedProject === 'all'
    ? tasks
    : tasks.filter(task => task.projectName === selectedProject)

  const tasksByStatus = {
    'open': filteredTasks.filter(t => t.status === 'Open'),
    'in-progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'completed': filteredTasks.filter(t => t.status === 'Completed')
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{task.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => window.open(task.url, '_blank')}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </Badge>
          {task.projectName && (
            <Badge variant="outline" className="text-xs">
              {task.projectName}
            </Badge>
          )}
          {task.assignee && (
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-xs font-medium">
              {task.assignee.charAt(0)}
            </div>
          )}
        </div>
        {task.dueDate && (
          <div className="text-xs text-muted-foreground mt-2">
            Due: {task.dueDate}
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Kanban Board</h2>
          <p className="text-muted-foreground">
            Manage tasks across all projects
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.name}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => {
              const project = selectedProject === 'all' ? currentProject : projects.find(p => p.name === selectedProject)
              if (project) {
                window.open(`https://github.com/${project.owner}/${project.repo}/issues/new`, '_blank')
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Loading tasks...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(COLUMNS).map(([status, config]) => {
              const Icon = config.icon
              const columnTasks = tasksByStatus[status as keyof typeof tasksByStatus]

              return (
                <div key={status} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <h3 className="font-semibold">{config.title}</h3>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No tasks
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
