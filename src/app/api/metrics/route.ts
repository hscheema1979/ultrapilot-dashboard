import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch data from other endpoints to calculate metrics
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004'

    const [workflowsRes, tasksRes] = await Promise.all([
      fetch(`${baseUrl}/api/workflows`),
      fetch(`${baseUrl}/api/tasks`),
    ])

    const workflowsData = await workflowsRes.json()
    const tasksData = await tasksRes.json()

    // Calculate metrics
    const metrics = {
      workflows: {
        total: workflowsData.total || 0,
        change: "+3 this week", // This would require historical data
        runningNow: workflowsData.running || 0,
        active: workflowsData.running || 0,
        successfulToday: workflowsData.completed || 0,
        successRate: workflowsData.total > 0
          ? `${Math.round((workflowsData.completed / workflowsData.total) * 100)}%`
          : 'N/A',
        failedToday: workflowsData.failed || 0,
      },
      projects: {
        total: 0, // Would come from projects endpoint
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
        overdue: 0, // Would need due date calculation
      },
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error calculating metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        workflows: { total: 0, change: '', runningNow: 0, active: 0, successfulToday: 0, successRate: 'N/A', failedToday: 0 },
        projects: { total: 0, active: 0, onTrack: 0, atRisk: 0 },
        tasks: { total: 0, open: 0, inProgress: 0, inReview: 0, completed: 0, overdue: 0 },
      },
      { status: 500 }
    )
  }
}
