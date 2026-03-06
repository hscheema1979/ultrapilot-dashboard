# SQLite Cache - Quick Reference

## File Locations

| File | Description |
|------|-------------|
| `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/db.ts` | SQLite database layer |
| `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/cache.ts` | Cache implementation |
| `/home/ubuntu/hscheema1979/ultrapilot-dashboard/src/lib/coalescing.ts` | Request coalescing |
| `/home/ubuntu/hscheema1979/ultrapilot-dashboard/data/cache.db` | Database file (auto-created) |

## Quick Start

### Basic Usage

```typescript
import { cache } from '@/lib/cache'

// Set cache
await cache.set('key', data, { ttl: 600 })

// Get cache
const cached = await cache.get('key')

// Delete cache
await cache.delete('key')
```

### With Coalescing

```typescript
import { coalesce } from '@/lib/coalescing'

const data = await coalesce('key', async () => {
  return await fetchData()
}, { ttl: 600 })
```

### Specialized Helpers

```typescript
import { RepositoryCache, IssueCache } from '@/lib/cache'

// Repository cache
await RepositoryCache.set('owner', 'repo', repoData)
const repo = await RepositoryCache.get('owner', 'repo')

// Issue cache
await IssueCache.set('owner', 'repo', 123, issueData)
const issue = await IssueCache.get('owner', 'repo', 123)
```

## Database Operations

### Health Check

```typescript
import { healthCheck, getDatabaseStats } from '@/lib/db'

const health = healthCheck()
console.log(health.healthy) // true/false

const stats = getDatabaseStats()
console.log(stats.cacheEntries) // number of entries
```

### Manual Operations

```typescript
import {
  vacuumDatabase,
  backupDatabase,
  resetDatabase
} from '@/lib/db'

// Vacuum (reclaim space)
await vacuumDatabase()

// Backup
await backupDatabase('./backup.db')

// Reset (dev/test only)
await resetDatabase()
```

## Monitoring

### Cache Statistics

```typescript
import { getStats } from '@/lib/cache'

const stats = getStats()
console.log({
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hits / (stats.hits + stats.misses)
})
```

### Coalescing Statistics

```typescript
import { getCoalescingStats } from '@/lib/coalescing'

const stats = getCoalescingStats()
console.log({
  queueSize: stats.queueSize,
  pendingRequests: stats.pendingRequests
})
```

## Webhook Integration

### Parse Events

```typescript
import {
  parseWebhookEvent,
  buildInvalidationPlan,
  executeInvalidation
} from '@/lib/coalescing'

const event = parseWebhookEvent(webhookPayload)
if (event) {
  const plan = buildInvalidationPlan(event)
  await executeInvalidation(plan, 'immediate')
}
```

## Environment Variables

```bash
# .env
DATABASE_PATH=./data/cache.db  # Default
NODE_ENV=development           # Required for resetDatabase()
```

## CLI Commands

### Inspect Database

```bash
# Open database
sqlite3 data/cache.db

# View cache entries
SELECT key, version,
  datetime(expires_at, 'unixepoch') as expires
FROM cache
WHERE expires_at > strftime('%s', 'now')
ORDER BY expires DESC;

# View coalescing queue
SELECT * FROM coalescing_queue;

# Database size
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

### Backup Database

```bash
# Simple backup
cp data/cache.db data/cache.db.backup

# Compressed backup
gzip -c data/cache.db > cache.db.backup.gz
```

### Vacuum Database

```bash
# Using sqlite3 CLI
sqlite3 data/cache.db 'VACUUM;'
```

## Common Tasks

### Clear All Cache

```typescript
import { cache } from '@/lib/cache'
await cache.clear()
```

### Clear Specific Pattern

```typescript
import { getKeys, delete_ } from '@/lib/cache'

const keys = await getKeys('repo:owner:*')
await Promise.all(keys.map(key => delete_(key)))
```

### Warm Cache

```typescript
import { warmCache } from '@/lib/coalescing'

await warmCache([
  { key: 'repo:owner:repo', data: repoData, ttl: 600 },
  { key: 'issues:owner:repo:open', data: issues, ttl: 300 }
])
```

## Troubleshooting

### Database Locked

```bash
# Check for other processes
lsof data/cache.db

# Kill if needed
kill -9 <PID>
```

### Permission Denied

```bash
# Fix permissions
chmod 0700 data/
chmod 0600 data/cache.db
```

### High Disk Usage

```typescript
import { vacuumDatabase } from '@/lib/db'
await vacuumDatabase()
```

## Performance Tips

1. **Use coalescing** for concurrent requests
2. **Set appropriate TTL** to prevent stale data
3. **Monitor hit rate** (>80% is good)
4. **Vacuum periodically** (weekly/bi-weekly)
5. **Use specialized helpers** for better type safety

## Migration from Vercel KV

See [SQLITE-MIGRATION-GUIDE.md](./SQLITE-MIGRATION-GUIDE.md) for full migration instructions.

## Performance Comparison

See [SQLITE-PERFORMANCE-BENCHMARKS.md](./SQLITE-PERFORMANCE-BENCHMARKS.md) for detailed performance analysis.

---

**Need Help?**
- Migration Guide: `SQLITE-MIGRATION-GUIDE.md`
- Performance: `SQLITE-PERFORMANCE-BENCHMARKS.md`
- Issues: Check database health with `healthCheck()`
