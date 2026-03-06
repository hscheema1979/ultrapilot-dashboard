import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock activity for now
    const activities = [
      {
        id: '1',
        type: 'workflow' as const,
        title: 'Build Control Room Dashboard',
        description: 'Completed Phase 1 implementation',
        time: '2 hours ago',
        status: 'success' as const,
        link: 'https://github.com/hscheema1979/control-room',
      },
      {
        id: '2',
        type: 'commit' as const,
        title: 'Fixed template string syntax errors',
        description: 'Multiple build error fixes',
        time: '3 hours ago',
        status: 'success' as const,
      },
      {
        id: '3',
        type: 'autoloop' as const,
        title: 'Autoloop heartbeat',
        description: 'Processed 3 tasks from queue',
        time: '1 hour ago',
        status: 'success' as const,
      },
    ]

    return NextResponse.json({ activities })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
