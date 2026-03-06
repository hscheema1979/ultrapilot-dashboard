import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const relayPath = searchParams.get('path') || '/'

    // Forward request to Relay service on port 3002
    const relayUrl = `http://localhost:3002${relayPath}`

    const response = await fetch(relayUrl, {
      method: 'GET',
      headers: {
        'Accept': searchParams.get('accept') || 'application/json',
        'User-Agent': 'Operations-Suite/1.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Relay service error', status: response.status },
        { status: response.status }
      )
    }

    // Get response content type
    const contentType = response.headers.get('content-type') || 'application/json'

    // Return response with appropriate headers
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  } catch (error) {
    console.error('Relay proxy error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to Relay service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
