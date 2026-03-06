import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface Project {
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

const PROJECTS_FILE = join(process.cwd(), 'data', 'projects.json')

function ensureDataDir() {
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
}

function getProjectsFile(): Project[] {
  ensureDataDir()

  if (!existsSync(PROJECTS_FILE)) {
    // Create default projects file
    const defaultProjects: Project[] = [
      {
        id: 'myhealthteam',
        name: 'MyHealthTeam',
        owner: 'creative-adventures',
        repo: 'myhealthteam',
        description: 'Healthcare workflow management system',
        color: '#3b82f6',
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ultra-workspace',
        name: 'UltraPilot Workspace',
        owner: 'hscheema1979',
        repo: 'ultra-workspace',
        description: 'Ultrapilot development workspace',
        color: '#8b5cf6',
        enabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ultrapilot-dashboard',
        name: 'Ultrapilot Dashboard',
        owner: 'hscheema1979',
        repo: 'ultrapilot-dashboard',
        description: 'GitHub monitoring dashboard',
        color: '#10b981',
        enabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2))
    return defaultProjects
  }

  try {
    const data = readFileSync(PROJECTS_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading projects file:', error)
    return []
  }
}

function saveProjectsFile(projects: Project[]) {
  ensureDataDir()
  writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2))
}

export async function getProjects(): Promise<Project[]> {
  return getProjectsFile()
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = getProjectsFile()
  return projects.find(p => p.id === id) || null
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const projects = getProjectsFile()
  const id = `${project.owner}-${project.repo}`.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

  const newProject: Project = {
    ...project,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  projects.push(newProject)
  saveProjectsFile(projects)

  return newProject
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = getProjectsFile()
  const index = projects.findIndex(p => p.id === id)

  if (index === -1) return null

  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveProjectsFile(projects)
  return projects[index]
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = getProjectsFile()
  const filtered = projects.filter(p => p.id !== id)

  if (filtered.length === projects.length) return false

  saveProjectsFile(filtered)
  return true
}

export async function getEnabledProjects(): Promise<Project[]> {
  const projects = getProjectsFile()
  return projects.filter(p => p.enabled)
}

export async function enableProject(id: string): Promise<Project | null> {
  return updateProject(id, { enabled: true })
}

export async function disableProject(id: string): Promise<Project | null> {
  return updateProject(id, { enabled: false })
}
