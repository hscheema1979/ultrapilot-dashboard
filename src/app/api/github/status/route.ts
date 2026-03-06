import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const owner = process.env.GITHUB_REPO_OWNER || 'hscheema1979'
    const repo = process.env.GITHUB_REPO_NAME || 'ultrapilot-dashboard'

    // Fetch repository data
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    if (!repoResponse.ok) {
      throw new Error('Failed to fetch repository data')
    }

    const repoData = await repoResponse.json()

    // Fetch issues count
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    )

    const issuesOpen = parseInt(issuesResponse.headers.get('X-TotalCount') || '0', 10)

    // Fetch closed issues
    const closedIssuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=closed&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    )

    const issuesClosed = parseInt(closedIssuesResponse.headers.get('X-TotalCount') || '0', 10)

    // Fetch PRs count
    const prsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=1`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    )

    const prsOpen = parseInt(prsResponse.headers.get('X-TotalCount') || '0', 10)

    // Check webhooks (this would require repo admin permissions)
    // For now, assume webhooks are connected if GITHUB_TOKEN is set
    const webhooksConnected = !!process.env.GITHUB_TOKEN

    return NextResponse.json({
      repository: `${owner}/${repo}`,
      appName: 'UltraPilot Bot',
      installed: repoData.permissions?.admin || repoData.permissions?.push || false,
      webhooksConnected,
      issuesOpen,
      issuesClosed,
      prsOpen,
      lastSync: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching GitHub status:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch GitHub status',
        repository: 'hscheema1979/ultrapilot-dashboard',
        appName: 'UltraPilot Bot',
        installed: false,
        webhooksConnected: false,
        issuesOpen: 0,
        issuesClosed: 0,
        prsOpen: 0,
        lastSync: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
