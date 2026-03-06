import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch HTML from Relay service on port 3002
    const response = await fetch('http://localhost:3002/', {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Operations-Suite/1.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch projects from Relay service' },
        { status: response.status }
      )
    }

    const html = await response.text()

    // Parse HTML to extract project data
    const projects = parseRelayProjects(html)

    return NextResponse.json({
      projects,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching Relay projects:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Relay service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    )
  }
}

interface RelayProject {
  id: string
  name: string
  path: string
  status: 'active' | 'paused' | 'error'
  sessions: number
  clients: number
}

function parseRelayProjects(html: string): RelayProject[] {
  const projects: RelayProject[] = []

  // Extract project cards from HTML
  // Pattern: <a class="card" href="/p/ubuntu/">...</a>
  const cardPattern = /<a[^>]*class="card"[^>]*href="\/p\/([^\/]+)\/"[^>]*>([\s\S]*?)<\/a>/gi
  const cardMatches = html.matchAll(cardPattern)

  for (const match of cardMatches) {
    const cardHtml = match[0]
    const pathMatch = cardHtml.match(/href="\/p\/([^\/]+)\/"/)

    // Extract name and status from card-title
    const titleMatch = cardHtml.match(/<div class="card-title">([^<]+)<span class="card-status">([^<]+)<\/span><\/div>/)

    // Extract path
    const pathMatch2 = cardHtml.match(/<div class="card-path">([^<]+)<\/div>/)

    // Extract metadata (sessions and clients)
    const metaMatch = cardHtml.match(/<div class="card-meta">([^<]+)<\/div>/)

    if (pathMatch && titleMatch && pathMatch2) {
      const name = titleMatch[1].trim()
      const path = pathMatch[1]
      const fullPath = pathMatch2[1].trim()
      const statusEmoji = titleMatch[2].trim()

      // Parse status from emoji
      let status: 'active' | 'paused' | 'error' = 'paused'
      if (statusEmoji === '🟢' || statusEmoji === '⚡') {
        status = 'active'
      } else if (statusEmoji === '🔴' || statusEmoji === '⚠️') {
        status = 'error'
      }

      // Parse metadata for sessions and clients
      let sessions = 0
      let clients = 0
      if (metaMatch) {
        const metaText = metaMatch[1]
        const sessionsMatch = metaText.match(/(\d+)\s*sessions/)
        const clientsMatch = metaText.match(/(\d+)\s*clients/)
        if (sessionsMatch) sessions = parseInt(sessionsMatch[1])
        if (clientsMatch) clients = parseInt(clientsMatch[1])
      }

      projects.push({
        id: path,
        name,
        path: fullPath,
        status,
        sessions,
        clients,
      })
    }
  }

  return projects
}
