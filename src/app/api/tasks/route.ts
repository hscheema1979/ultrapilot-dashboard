import { NextResponse } from 'next/server'

function getIssueStatus(state: string, stateReason: string | null): string {
  if (state === 'closed') return 'Completed'
  if (stateReason === 'completed') return 'In Review'
  if (stateReason === 'not_planned') return 'On Hold'
  return 'Open'
}

function getPriorityFromLabels(labels: any[]): string {
  const priorityLabel = labels.find((l: any) =>
    l.name.toLowerCase().includes('critical') ||
    l.name.toLowerCase().includes('high') ||
    l.name.toLowerCase().includes('medium') ||
    l.name.toLowerCase().includes('low')
  )

  if (priorityLabel) {
    const name = priorityLabel.name.toLowerCase()
    if (name.includes('critical')) return 'Critical'
    if (name.includes('high')) return 'High'
    if (name.includes('medium')) return 'Medium'
    if (name.includes('low')) return 'Low'
  }

  return 'Medium'
}

function formatAssignee(assignee: any): string | null {
  if (!assignee) return null
  const name = assignee.name || assignee.login
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const owner = searchParams.get('owner')
    const repo = searchParams.get('repo')

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      )
    }

    const { fetchGitHubAPI } = await import('@/lib/github-auth')

    // Fetch issues
    const data = await fetchGitHubAPI('/issues?state=all&per_page=20&sort=updated&direction=desc', {}, owner, repo)

    let tasks = data.map((issue: any) => ({
      id: issue.pull_request ? `PR-${issue.number}` : `GH-${issue.number}`,
      title: issue.title,
      description: issue.body || '',
      status: getIssueStatus(issue.state, issue.state_reason),
      priority: getPriorityFromLabels(issue.labels),
      assignee: formatAssignee(issue.assignee),
      labels: issue.labels.map((l: any) => l.name),
      createdAt: new Date(issue.created_at).toISOString().split('T')[0],
      dueDate: issue.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      url: issue.html_url,
    }))

    // Filter by status if provided
    if (status && status !== 'all') {
      const statusLower = status.toLowerCase()
      tasks = tasks.filter((task: any) => {
        const taskStatus = task.status.toLowerCase().replace(' ', '-')
        return taskStatus === statusLower || task.status.toLowerCase() === statusLower
      })
    }

    const stats = {
      total: tasks.length,
      open: tasks.filter((t: any) => t.status === 'Open').length,
      inProgress: tasks.filter((t: any) => t.status === 'In Progress').length,
      inReview: tasks.filter((t: any) => t.status === 'In Review').length,
      completed: tasks.filter((t: any) => t.status === 'Completed').length,
    }

    return NextResponse.json({
      tasks,
      ...stats,
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
        tasks: [],
        total: 0,
        open: 0,
        inProgress: 0,
        inReview: 0,
        completed: 0,
      },
      { status: 500 }
    )
  }
}
