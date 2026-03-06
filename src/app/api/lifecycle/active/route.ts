import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get GitHub issues with lifecycle labels
    const owner = process.env.GITHUB_REPO_OWNER || 'hscheema1979'
    const repo = process.env.GITHUB_REPO_NAME || 'ultrapilot-dashboard'

    // Query GitHub for issues with lifecycle-related labels
    const query = `
      query {
        repository(owner: "${owner}", name: "${repo}") {
          issues(first: 50, states: [OPEN], labels: ["lifecycle"], orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              number
              title
              state
              createdAt
              updatedAt
              labels(first: 20) {
                nodes {
                  name
                }
              }
              comments(first: 100) {
                nodes {
                  author {
                    login
                    type
                  }
                  body
                  createdAt
                }
              }
              url
            }
          }
        }
      }
    `

    // Call GitHub API
    const githubResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    })

    if (!githubResponse.ok) {
      throw new Error('GitHub API request failed')
    }

    const data = await githubResponse.json()
    const issues = data.data?.repository?.issues?.nodes || []

    // Transform to lifecycle projects
    const projects = issues.map((issue: any) => {
      const labels = issue.labels.nodes.map((l: any) => l.name)

      // Detect current phase from labels
      const phaseLabel = labels.find((l: string) => l.startsWith('phase:'))
      const phase = phaseLabel ? phaseLabel.replace('phase:', '') : 'initiation'

      // Detect agent from labels
      const agentLabel = labels.find((l: string) => l.startsWith('agent:'))
      const agent = agentLabel ? agentLabel.replace('agent:', '') : 'unassigned'

      // Detect project from labels
      const projectLabel = labels.find((l: string) => l.startsWith('project:'))
      const projectId = projectLabel ? projectLabel.replace('project:', '') : 'unknown'

      // Calculate progress based on phase
      const phases = ['initiation', 'requirements', 'architecture', 'planning', 'execution', 'verification', 'review', 'approval', 'deployment', 'monitoring']
      const currentPhaseIndex = phases.indexOf(phase)
      const progress = ((currentPhaseIndex + 1) / phases.length) * 100

      return {
        issueId: issue.number,
        title: issue.title,
        projectId,
        phase,
        progress: Math.round(progress),
        started: issue.createdAt,
        updated: issue.updatedAt,
        labels,
        agent,
        url: issue.url
      }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Error fetching lifecycle projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lifecycle projects', projects: [] },
      { status: 500 }
    )
  }
}
