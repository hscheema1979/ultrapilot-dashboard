import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock stats for now
    const stats = {
      totalRepos: 58,
      activeWorkflows: 12,
      pendingTasks: 5,
      completedToday: 8,
      successRate: 94,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
