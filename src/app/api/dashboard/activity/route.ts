import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
  try {
    // Try to read real activity from state file
    const activityPath = join(process.cwd(), '.ultra', 'state', 'activity.json')

    let activities = []

    try {
      const data = await readFile(activityPath, 'utf-8')
      activities = JSON.parse(data)
    } catch (e) {
      // File doesn't exist or is invalid, return empty
      console.log('No activity file found, returning empty array')
    }

    // Transform activities to the format expected by the frontend
    const transformedActivities = activities.map((activity: any) => {
      // Calculate relative time
      const time = new Date(activity.time)
      const now = new Date()
      const diffMs = now.getTime() - time.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)

      let relativeTime = ''
      if (diffMins < 1) {
        relativeTime = 'Just now'
      } else if (diffMins < 60) {
        relativeTime = `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
      } else if (diffHours < 24) {
        relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        relativeTime = time.toLocaleDateString()
      }

      return {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        time: relativeTime,
        status: activity.status,
        link: activity.link,
        metadata: activity.metadata
      }
    })

    return NextResponse.json({ activities: transformedActivities })
  } catch (error) {
    console.error('Error fetching dashboard activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
