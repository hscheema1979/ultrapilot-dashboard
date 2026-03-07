import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// Verify GitHub webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${digest}`))
}

export async function POST(request: Request) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-hub-signature-256')
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 401 })
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const secret = process.env.GITHUB_WEBHOOK_SECRET || 'development-secret'

    // Verify signature (skip in development if no secret set)
    if (process.env.NODE_ENV === 'production' && !verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)

    // Handle different GitHub events
    if (payload.workflow_job || payload.workflow_run) {
      // Workflow job event
      const event = payload.workflow_job || payload.workflow_run

      // Store activity
      const activity = {
        id: event.id || `gh-${Date.now()}`,
        type: 'workflow',
        title: event.name || 'GitHub Actions Workflow',
        description: `${event.action} - ${event.status}`,
        time: new Date(event.started_at || Date.now()).toISOString(),
        status: event.conclusion === 'success' ? 'success' : event.conclusion === 'failure' ? 'error' : 'running',
        link: event.html_url,
        metadata: {
          workflow: event.workflow_name,
          runId: event.run_id,
          runNumber: event.run_number,
          repository: event.repository?.full_name,
          actor: event.actor?.login,
          status: event.status,
          conclusion: event.conclusion,
          startedAt: event.started_at,
          completedAt: event.completed_at
        }
      }

      // Store in .ultra/state/activity.json
      const fs = require('fs').promises
      const path = require('path')
      const activityDir = path.join(process.cwd(), '.ultra', 'state')

      await fs.mkdir(activityDir, { recursive: true })

      const activityFile = path.join(activityDir, 'activity.json')
      let activities = []

      try {
        const existing = await fs.readFile(activityFile, 'utf-8')
        activities = JSON.parse(existing)
      } catch (e) {
        // File doesn't exist yet
      }

      // Add new activity at the beginning
      activities.unshift(activity)

      // Keep only last 100 activities
      activities = activities.slice(0, 100)

      await fs.writeFile(activityFile, JSON.stringify(activities, null, 2))

      // Revalidate dashboard paths
      revalidatePath('/dashboard')
      revalidatePath('/api/dashboard/activity')
      revalidatePath('/api/dashboard/stats')

      return NextResponse.json({ success: true, activity })
    }

    // Handle agent status updates from workflows
    if (payload.action === 'agent_status_update') {
      const activity = {
        id: `agent-${Date.now()}`,
        type: 'agent_execution',
        title: payload.agent_name || 'UltraPilot Agent',
        description: payload.status || 'Agent execution update',
        time: new Date().toISOString(),
        status: payload.status === 'completed' ? 'success' : payload.status === 'failed' ? 'error' : 'running',
        link: payload.issue_url || payload.workflow_url,
        metadata: payload
      }

      // Store activity
      const fs = require('fs').promises
      const path = require('path')
      const activityDir = path.join(process.cwd(), '.ultra', 'state')

      await fs.mkdir(activityDir, { recursive: true })
      const activityFile = path.join(activityDir, 'activity.json')

      let activities = []
      try {
        const existing = await fs.readFile(activityFile, 'utf-8')
        activities = JSON.parse(existing)
      } catch (e) {}

      activities.unshift(activity)
      activities = activities.slice(0, 100)

      await fs.writeFile(activityFile, JSON.stringify(activities, null, 2))

      revalidatePath('/dashboard')
      revalidatePath('/api/dashboard/activity')

      return NextResponse.json({ success: true, activity })
    }

    return NextResponse.json({ received: true, event: Object.keys(payload)[0] })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
