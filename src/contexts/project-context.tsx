'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

interface Project {
  id: string
  name: string
  owner: string
  repo: string
  description: string
  color: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  setCurrentProject: (project: Project | null) => void
  refreshProjects: () => Promise<void>
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const isInitializedRef = useRef(false)

  const refreshProjects = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      const fetchedProjects = data.projects || []
      setProjects(fetchedProjects)

      // Only auto-select on initial load, not on manual refresh
      if (!isInitializedRef.current && fetchedProjects.length > 0) {
        const firstEnabled = fetchedProjects.find((p: Project) => p.enabled)
        if (firstEnabled) {
          setCurrentProject(firstEnabled)
          isInitializedRef.current = true
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      refreshProjects()
    }
  }, [])

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        setCurrentProject,
        refreshProjects,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
