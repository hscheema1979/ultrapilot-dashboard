# GitHub Projects API Integration - Examples

This document provides examples and usage patterns for the GitHub Projects API integration.

## API Endpoints

### GET /api/v1/projects

Fetch GitHub Projects with columns and cards.

**Query Parameters:**
- `org` (string, optional): Organization name
- `repo` (string, optional): Repository name
- `state` (string, optional): Project state - `open`, `closed`, or `all` (default: `open`)
- `page` (number, optional): Page number (default: `1`)
- `per_page` (number, optional): Results per page, max 100 (default: `30`)

**Example Request:**
```bash
curl "http://localhost:3000/api/v1/projects?org=hscheema1979&state=open&page=1&per_page=30"
```

**Example Response:**
```json
{
  "projects": [
    {
      "id": 123456,
      "name": "Healthcare Platform",
      "body": "Track healthcare platform development",
      "state": "open",
      "columns": [
        {
          "id": 789,
          "name": "To Do",
          "cards": [
            {
              "id": 456,
              "contentType": "issue",
              "isClosed": false,
              "priority": "high",
              "assigneeAvatars": ["https://github.com/avatars/user1"],
              "content": {
                "type": "Issue",
                "number": 42,
                "title": "Implement authentication",
                "state": "open",
                "html_url": "https://github.com/hscheema1979/healthcare-platform/issues/42",
                "assignees": [...],
                "labels": [...]
              }
            }
          ],
          "cardCount": 5
        }
      ],
      "cardCount": 15,
      "lastUpdated": "2026-03-06T12:00:00Z",
      "progress": 33
    }
  ],
  "total_count": 1,
  "page": 1,
  "total_pages": 1
}
```

### POST /api/v1/projects

Invalidate projects cache.

**Request Body:**
```json
{
  "org": "hscheema1979",
  "repo": "ultrapilot-dashboard" // optional
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"org": "hscheema1979"}'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Cache invalidated for hscheema1979"
}
```

## React Components

### ProjectBoard Component

Main component for displaying a Kanban-style project board.

**Usage:**
```tsx
import { ProjectBoard } from '@/components/projects/project-board'

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <ProjectBoard
        initialOrg="hscheema1979"
        autoRefresh={true}
        refreshInterval={60}
      />
    </div>
  )
}
```

**Props:**
- `initialOrg` (string, optional): Initial organization to filter by
- `initialRepo` (string, optional): Initial repository to filter by
- `initialProject` (number, optional): Initial project ID to select
- `autoRefresh` (boolean, default: `true`): Enable auto-refresh
- `refreshInterval` (number, default: `60`): Refresh interval in seconds

### ProjectCard Component

Individual card component for displaying issues/PRs.

**Usage:**
```tsx
import { ProjectCard } from '@/components/projects/project-card'

function Column({ cards }) {
  return (
    <div className="space-y-2">
      {cards.map(card => (
        <ProjectCard
          key={card.id}
          card={card}
          onCardClick={(card) => {
            // Handle card click
            window.open(card.content.html_url, '_blank')
          }}
        />
      ))}
    </div>
  )
}
```

## Programmatic Usage

### Using the Projects API functions

```typescript
import { listProjects, getProject, invalidateProjectsCache } from '@/lib/github/projects'

// Fetch all projects for an organization
const projects = await listProjects({
  org: 'hscheema1979',
  state: 'open',
  page: 1,
  per_page: 30,
})

console.log(projects.projects[0].name) // "Healthcare Platform"

// Fetch repository-specific projects
const repoProjects = await listProjects({
  org: 'hscheema1979',
  repo: 'ultrapilot-dashboard',
  state: 'open',
})

// Fetch a single project by ID
const project = await getProject(123456, 'hscheema1979')

console.log(project?.columns) // Array of columns with cards

// Invalidate cache
await invalidateProjectsCache('hscheema1979', 'ultrapilot-dashboard')
```

### Using the Cache

```typescript
import { ProjectCache } from '@/lib/cache'

// Get cached projects
const cached = await ProjectCache.getList('hscheema1979', 'ultrapilot-dashboard')

// Set projects in cache
await ProjectCache.setList('hscheema1979', 'ultrapilot-dashboard', projects, {
  ttl: 600, // 10 minutes
})

// Invalidate cache
await ProjectCache.invalidateList('hscheema1979', 'ultrapilot-dashboard')
```

## Configuration

### Environment Variables

Set these in your `.env.local` file:

```env
# GitHub App Configuration
GITHUB_APP_ID=your_app_id
GITHUB_APP_INSTALLATION_ID=your_installation_id
GITHUB_APP_PRIVATE_KEY_PATH=/path/to/private-key.pem
GITHUB_OWNER=hscheema1979
GITHUB_REPO=ultrapilot-dashboard
```

### Cache Configuration

The Projects API uses a 10-minute TTL (600 seconds) by default. Projects change less frequently than issues, so they can be cached longer.

To adjust cache TTL:

```typescript
await ProjectCache.setList('hscheema1979', 'ultrapilot-dashboard', projects, {
  ttl: 1200, // 20 minutes
})
```

## Features

### 1. Organization-Level Projects

Fetch projects at the organization level:

```typescript
const orgProjects = await listProjects({
  org: 'hscheema1979',
  state: 'open',
})
```

### 2. Repository-Level Projects

Fetch projects for a specific repository:

```typescript
const repoProjects = await listProjects({
  org: 'hscheema1979',
  repo: 'ultrapilot-dashboard',
  state: 'open',
})
```

### 3. Project Columns and Cards

Projects include columns with nested cards:

```typescript
const project = projects.projects[0]
console.log(project.columns)
// [
//   {
//     id: 789,
//     name: "To Do",
//     cards: [...],
//     cardCount: 5
//   },
//   {
//     id: 790,
//     name: "In Progress",
//     cards: [...],
//     cardCount: 3
//   }
// ]
```

### 4. Card Enrichment

Cards are enriched with computed fields:

```typescript
const card = column.cards[0]
console.log(card.contentType) // "issue", "pull_request", or "note"
console.log(card.isClosed) // true/false
console.log(card.priority) // "high", "medium", or "low"
console.log(card.assigneeAvatars) // Array of avatar URLs
```

### 5. Progress Tracking

Projects compute completion percentage:

```typescript
const project = projects.projects[0]
console.log(project.progress) // 0-100
```

Progress is calculated based on columns with names like "Done", "Completed", or "Closed".

### 6. Real-Time Updates

The ProjectBoard component supports auto-refresh:

```tsx
<ProjectBoard
  initialOrg="hscheema1979"
  autoRefresh={true}
  refreshInterval={60} // Refresh every 60 seconds
/>
```

### 7. Caching and Coalescing

Concurrent requests are coalesced to reduce API calls:

```typescript
// Both calls will use the same request
const [projects1, projects2] = await Promise.all([
  listProjects({ org: 'hscheema1979' }),
  listProjects({ org: 'hscheema1979' }),
])
```

## Error Handling

### API Errors

The API returns descriptive error messages:

```json
{
  "error": "Bad Request",
  "message": "Either org or org+repo must be specified",
  "documentation_url": "/api/v1/projects"
}
```

### Authentication Errors

```json
{
  "error": "Authentication Error",
  "message": "Failed to authenticate with GitHub",
  "documentation_url": "/api/v1/projects"
}
```

### GitHub API Errors

```json
{
  "error": "GitHub API Error",
  "message": "Failed to fetch organization projects",
  "documentation_url": "/api/v1/projects"
}
```

## Testing

Run the test suite:

```bash
npm test src/lib/github/projects.test.ts
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Troubleshooting

### Projects Not Showing

1. Check GitHub App credentials
2. Verify the org/repo has projects enabled
3. Check browser console for errors
4. Try invalidating the cache: `POST /api/v1/projects`

### Auto-Refresh Not Working

1. Check browser console for errors
2. Verify `autoRefresh` prop is `true`
3. Check network tab for failed requests
4. Ensure refresh interval is reasonable (60s recommended)

### Performance Issues

1. Reduce `refreshInterval` (default: 60s)
2. Use pagination: `page=1&per_page=30`
3. Filter by state: `state=open`
4. Use cache invalidation strategically

## Best Practices

1. **Use pagination** for large projects: `page=1&per_page=30`
2. **Filter by state** to reduce payload: `state=open`
3. **Cache results** appropriately (default: 10 minutes)
4. **Invalidate cache** strategically after updates
5. **Use auto-refresh** sparingly (every 60s is reasonable)
6. **Handle errors** gracefully in production
7. **Monitor rate limits** with GitHub API
8. **Use specific repos** when possible vs. org-level queries

## Examples

### Example 1: Simple Projects Dashboard

```tsx
'use client'

import { ProjectBoard } from '@/components/projects/project-board'

export default function ProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Projects Dashboard</h1>
      <ProjectBoard
        initialOrg="hscheema1979"
        autoRefresh={true}
      />
    </div>
  )
}
```

### Example 2: Multi-Organization Dashboard

```tsx
'use client'

import { useState } from 'react'
import { ProjectBoard } from '@/components/projects/project-board'

export default function MultiOrgDashboard() {
  const [org, setOrg] = useState('hscheema1979')

  return (
    <div className="container mx-auto py-8">
      <select value={org} onChange={(e) => setOrg(e.target.value)}>
        <option value="hscheema1979">hscheema1979</option>
        <option value="creative-adventures">creative-adventures</option>
      </select>

      <ProjectBoard
        initialOrg={org}
        autoRefresh={true}
      />
    </div>
  )
}
```

### Example 3: Filtered Projects View

```tsx
'use client'

import { useState } from 'react'
import { ProjectBoard } from '@/components/projects/project-board'

export default function FilteredProjects() {
  const [org, setOrg] = useState('hscheema1979')
  const [repo, setRepo] = useState<string | undefined>()
  const [state, setState] = useState<'open' | 'closed' | 'all'>('open')

  return (
    <div className="container mx-auto py-8 space-y-4">
      <div className="flex gap-4">
        <input
          placeholder="Organization"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
        />
        <input
          placeholder="Repository (optional)"
          value={repo || ''}
          onChange={(e) => setRepo(e.target.value || undefined)}
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value as any)}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
      </div>

      <ProjectBoard
        initialOrg={org}
        initialRepo={repo}
        autoRefresh={true}
      />
    </div>
  )
}
```

## Support

For issues or questions:
1. Check the console/browser dev tools for errors
2. Verify GitHub App credentials
3. Check network requests in browser dev tools
4. Review the error messages from the API
5. Consult GitHub Projects API documentation

## References

- [GitHub Projects API Documentation](https://docs.github.com/en/rest/reference/projects)
- [GitHub Projects Preview Header](https://docs.github.com/en/rest/overview/api-previews#projects-preview)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [shadcn/ui Components](https://ui.shadcn.com/)
