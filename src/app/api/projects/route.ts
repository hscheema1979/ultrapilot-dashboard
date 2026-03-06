import { NextResponse } from 'next/server'
import { getProjects, createProject, updateProject, deleteProject, getEnabledProjects } from '@/lib/projects/storage'

export async function GET() {
  try {
    const projects = await getProjects()
    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const project = await createProject(body)
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const project = await updateProject(id, updates)

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      )
    }

    const success = await deleteProject(id)

    if (!success) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
