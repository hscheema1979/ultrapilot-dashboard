import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const org = searchParams.get('org')

    // Proxy to the v1 repos API
    const apiUrl = new URL('/api/v1/repos', request.url)
    if (org) {
      apiUrl.searchParams.set('org', org)
    }

    const response = await fetch(apiUrl.toString())
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching repos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repos' },
      { status: 500 }
    )
  }
}
