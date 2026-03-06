/**
 * SQLite Database Layer with WAL Mode
 *
 * Provides:
 * - SQLite database initialization with better-sqlite3
 * - WAL mode for concurrent reads/writes
 * - Connection pooling (single DB instance)
 * - Automatic cleanup of expired entries
 * - Graceful error handling
 */

import Database from 'better-sqlite3'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Types
// ============================================================================

/**
 * Database configuration
 */
export interface DatabaseConfig {
  /** Path to database file (default: ./data/cache.db) */
  path?: string
  /** Enable WAL mode (default: true) */
  walMode?: boolean
  /** Enable foreign keys (default: true) */
  foreignKeys?: boolean
  /** Vacuum on startup (default: false) */
  vacuum?: boolean
}

/**
 * Cache entry from database
 */
export interface CacheRow {
  key: string
  value: string
  expires_at: number
  version: number
  event_id: string | null
}

/**
 * Coalescing queue entry from database
 */
export interface CoalescingRow {
  request_key: string
  consumers: number
  created_at: number
}

// ============================================================================
// Database Instance
// ============================================================================

let db: Database.Database | null = null
let dbPath: string

/**
 * Get or create database instance
 *
 * @param config - Database configuration
 * @returns Database instance
 *
 * @example
 * ```ts
 * const database = getDatabase()
 * ```
 */
export function getDatabase(config: DatabaseConfig = {}): Database.Database {
  if (db) {
    return db
  }

  // Determine database path
  const defaultPath = process.env.DATABASE_PATH || './data/cache.db'
  dbPath = config.path || defaultPath

  // Ensure data directory exists
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    try {
      mkdirSync(dataDir, { mode: 0o700 }) // Secure permissions
      console.debug(`[DB] Created data directory: ${dataDir}`)
    } catch (error) {
      console.error('[DB] Failed to create data directory:', error)
      // Fall back to temp directory
      dbPath = join('/tmp', 'ultrapilot-cache.db')
    }
  }

  try {
    // Open database
    db = new Database(dbPath)

    // Configure database
    if (config.walMode !== false) {
      db.pragma('journal_mode = WAL')
      console.debug('[DB] WAL mode enabled')
    }

    if (config.foreignKeys !== false) {
      db.pragma('foreign_keys = ON')
      console.debug('[DB] Foreign keys enabled')
    }

    // Performance optimizations
    db.pragma('synchronous = NORMAL')
    db.pragma('cache_size = -64000') // 64MB cache
    db.pragma('temp_store = MEMORY')
    db.pragma('mmap_size = 30000000000') // 30GB mmap

    // Optional vacuum on startup
    if (config.vacuum) {
      db.exec('VACUUM')
      console.debug('[DB] Database vacuumed')
    }

    // Initialize schema
    initializeSchema(db)

    // Cleanup expired entries
    cleanupExpiredEntries(db)

    console.debug(`[DB] Database initialized: ${dbPath}`)
    return db
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error)
    throw error
  }
}

/**
 * Close database connection
 *
 * @example
 * ```ts
 * closeDatabase()
 * ```
 */
export function closeDatabase(): void {
  if (db) {
    try {
      db.close()
      db = null
      console.debug('[DB] Database closed')
    } catch (error) {
      console.error('[DB] Error closing database:', error)
    }
  }
}

// ============================================================================
// Schema Initialization
// ============================================================================

/**
 * Initialize database schema
 *
 * Creates tables and indexes if they don't exist.
 */
function initializeSchema(database: Database.Database): void {
  database.exec(`
    -- Cache table
    CREATE TABLE IF NOT EXISTS cache (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      event_id TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'subloop'))
    ) WITHOUT ROWID;

    -- Coalescing queue table
    CREATE TABLE IF NOT EXISTS coalescing_queue (
      request_key TEXT PRIMARY KEY,
      consumers INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'subloop'))
    ) WITHOUT ROWID;

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);
    CREATE INDEX IF NOT EXISTS idx_cache_event_id ON cache(event_id);
    CREATE INDEX IF NOT EXISTS idx_cache_version ON cache(version);

    -- Index for coalescing queue cleanup
    CREATE INDEX IF NOT EXISTS idx_coalescing_created_at ON coalescing_queue(created_at);
  `)

  console.debug('[DB] Schema initialized')
}

/**
 * Cleanup expired cache entries
 *
 * Removes entries that have expired based on expires_at timestamp.
 */
function cleanupExpiredEntries(database: Database.Database): void {
  const now = Math.floor(Date.now() / 1000)

  const stmt = database.prepare(`
    DELETE FROM cache
    WHERE expires_at < ?
  `)

  const result = stmt.run(now)
  console.debug(`[DB] Cleaned up ${result.changes} expired entries`)

  // Cleanup old coalescing queue entries (older than 5 minutes)
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300

  const coalesceStmt = database.prepare(`
    DELETE FROM coalescing_queue
    WHERE created_at < ?
  `)

  const coalesceResult = coalesceStmt.run(fiveMinutesAgo)
  console.debug(`[DB] Cleaned up ${coalesceResult.changes} old coalescing entries`)
}

/**
 * Periodic cleanup task
 *
 * Should be called periodically to keep database size under control.
 *
 * @param intervalMs - Interval between cleanups in milliseconds (default: 5 minutes)
 *
 * @example
 * ```ts
 * // Start periodic cleanup
 * const interval = startPeriodicCleanup(300000)
 *
 * // Later, stop cleanup
 * clearInterval(interval)
 * ```
 */
export function startPeriodicCleanup(intervalMs: number = 300000): NodeJS.Timeout {
  return setInterval(() => {
    try {
      const database = getDatabase()
      cleanupExpiredEntries(database)
    } catch (error) {
      console.error('[DB] Error during periodic cleanup:', error)
    }
  }, intervalMs)
}

// ============================================================================
// Prepared Statements (Cache)
// ============================================================================

const preparedStatements = {
  get: null as Database.Statement | null,
  set: null as Database.Statement | null,
  delete: null as Database.Statement | null,
  clear: null as Database.Statement | null,
  getExpired: null as Database.Statement | null,
}

/**
 * Get a prepared statement for cache operations
 */
function prepareStatement(
  database: Database.Database,
  name: keyof typeof preparedStatements,
  sql: string
): Database.Statement {
  if (!preparedStatements[name]) {
    preparedStatements[name] = database.prepare(sql)
  }
  return preparedStatements[name]!
}

/**
 * Get cache entry by key
 */
export function cacheGet(key: string): CacheRow | null {
  const database = getDatabase()
  const stmt = prepareStatement(
    database,
    'get',
    `
    SELECT key, value, expires_at, version, event_id
    FROM cache
    WHERE key = ? AND expires_at > ?
    `
  )

  const now = Math.floor(Date.now() / 1000)
  const row = stmt.get(key, now) as CacheRow | undefined

  return row || null
}

/**
 * Set cache entry
 */
export function cacheSet(
  key: string,
  value: string,
  expiresIn: number,
  version: number = 1,
  eventId: string | null = null
): void {
  const database = getDatabase()
  const stmt = prepareStatement(
    database,
    'set',
    `
    INSERT OR REPLACE INTO cache (key, value, expires_at, version, event_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    `
  )

  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn
  const createdAt = Math.floor(Date.now() / 1000)

  stmt.run(key, value, expiresAt, version, eventId, createdAt)
}

/**
 * Delete cache entry
 */
export function cacheDelete(key: string): boolean {
  const database = getDatabase()
  const stmt = prepareStatement(
    database,
    'delete',
    `
    DELETE FROM cache
    WHERE key = ?
    `
  )

  const result = stmt.run(key)
  return result.changes > 0
}

/**
 * Clear all cache entries
 */
export function cacheClear(): boolean {
  const database = getDatabase()
  const stmt = prepareStatement(
    database,
    'clear',
    `
    DELETE FROM cache
    `
  )

  const result = stmt.run()
  return result.changes > 0
}

/**
 * Get all keys matching a pattern
 */
export function cacheKeys(pattern: string = '%'): string[] {
  const database = getDatabase()

  // Convert Redis-style pattern to SQL LIKE
  const sqlPattern = pattern.replace(/\*/g, '%')

  const stmt = database.prepare(`
    SELECT key FROM cache
    WHERE key LIKE ?
    AND expires_at > ?
  `)

  const now = Math.floor(Date.now() / 1000)
  const rows = stmt.all(sqlPattern, now) as Array<{ key: string }>

  return rows.map(row => row.key)
}

// ============================================================================
// Prepared Statements (Coalescing)
// ============================================================================

/**
 * Get coalescing queue entry
 */
export function coalescingGet(key: string): CoalescingRow | null {
  const database = getDatabase()

  const stmt = database.prepare(`
    SELECT request_key, consumers, created_at
    FROM coalescing_queue
    WHERE request_key = ?
  `)

  const row = stmt.get(key) as CoalescingRow | undefined

  return row || null
}

/**
 * Set coalescing queue entry
 */
export function coalescingSet(key: string, consumers: number = 1): void {
  const database = getDatabase()

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO coalescing_queue (request_key, consumers, created_at)
    VALUES (?, ?, ?)
  `)

  const createdAt = Math.floor(Date.now() / 1000)
  stmt.run(key, consumers, createdAt)
}

/**
 * Increment coalescing queue consumers
 */
export function coalescingIncrement(key: string): number {
  const database = getDatabase()

  const stmt = database.prepare(`
    INSERT OR REPLACE INTO coalescing_queue (request_key, consumers, created_at)
    VALUES (?, COALESCE((SELECT consumers FROM coalescing_queue WHERE request_key = ?), 0) + 1, ?)
  `)

  const createdAt = Math.floor(Date.now() / 1000)
  stmt.run(key, key, createdAt)

  // Get updated value
  const row = coalescingGet(key)
  return row?.consumers || 1
}

/**
 * Delete coalescing queue entry
 */
export function coalescingDelete(key: string): boolean {
  const database = getDatabase()

  const stmt = database.prepare(`
    DELETE FROM coalescing_queue
    WHERE request_key = ?
  `)

  const result = stmt.run(key)
  return result.changes > 0
}

/**
 * Clear all coalescing queue entries
 */
export function coalescingClear(): boolean {
  const database = getDatabase()

  const stmt = database.prepare(`
    DELETE FROM coalescing_queue
  `)

  const result = stmt.run()
  return result.changes > 0
}

/**
 * Get all coalescing queue entries
 */
export function coalescingGetAll(): CoalescingRow[] {
  const database = getDatabase()

  const stmt = database.prepare(`
    SELECT request_key, consumers, created_at
    FROM coalescing_queue
    ORDER BY created_at DESC
  `)

  return stmt.all() as CoalescingRow[]
}

// ============================================================================
// Database Statistics
// ============================================================================

/**
 * Get database statistics
 */
export function getDatabaseStats(): {
  path: string
  cacheEntries: number
  coalescingEntries: number
  databaseSize: number
  walMode: string
} {
  const database = getDatabase()

  const cacheCount = database.prepare(`
    SELECT COUNT(*) as count FROM cache
  `).get() as { count: number }

  const coalescingCount = database.prepare(`
    SELECT COUNT(*) as count FROM coalescing_queue
  `).get() as { count: number }

  const walMode = database.pragma('journal_mode', { simple: true })

  return {
    path: dbPath,
    cacheEntries: cacheCount.count,
    coalescingEntries: coalescingCount.count,
    databaseSize: database.pragma('page_count', { simple: true }) * database.pragma('page_size', { simple: true }),
    walMode: walMode as string,
  }
}

/**
 * Vacuum database to reclaim space
 */
export function vacuumDatabase(): void {
  const database = getDatabase()

  try {
    database.exec('VACUUM')
    console.debug('[DB] Database vacuumed successfully')
  } catch (error) {
    console.error('[DB] Error vacuuming database:', error)
    throw error
  }
}

/**
 * Backup database to a file
 */
export function backupDatabase(backupPath: string): void {
  const database = getDatabase()

  try {
    database.backup(backupPath).step(-1) // Backup entire database
    console.debug(`[DB] Database backed up to: ${backupPath}`)
  } catch (error) {
    console.error('[DB] Error backing up database:', error)
    throw error
  }
}

// ============================================================================
// Database Health Check
// ============================================================================

/**
 * Perform health check on database
 */
export function healthCheck(): {
  healthy: boolean
  error?: string
  stats?: ReturnType<typeof getDatabaseStats>
} {
  try {
    const database = getDatabase()

    // Try to execute a simple query
    database.prepare('SELECT 1').get()

    return {
      healthy: true,
      stats: getDatabaseStats(),
    }
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ============================================================================
// Graceful Shutdown
// ============================================================================

/**
 * Setup graceful shutdown handlers
 *
 * Ensures database is properly closed on process exit.
 */
export function setupGracefulShutdown(): void {
  const shutdown = () => {
    console.debug('[DB] Shutting down database...')
    closeDatabase()
  }

  process.on('exit', shutdown)
  process.on('SIGINT', () => {
    shutdown()
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    shutdown()
    process.exit(0)
  })
}

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Reset database (drop all tables)
 *
 * WARNING: This will delete all data. Only use in development.
 */
export function resetDatabase(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production')
  }

  const database = getDatabase()

  database.exec(`
    DROP TABLE IF EXISTS cache;
    DROP TABLE IF EXISTS coalescing_queue;
  `)

  console.debug('[DB] Database reset')

  // Reinitialize schema
  initializeSchema(database)
}

/**
 * Seed database with test data
 *
 * Only use in development/testing.
 */
export function seedDatabase(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot seed database in production')
  }

  const database = getDatabase()

  // Add some test cache entries
  const testEntries = [
    { key: 'test:1', value: '{"data":"test1"}', expiresIn: 3600 },
    { key: 'test:2', value: '{"data":"test2"}', expiresIn: 3600 },
    { key: 'test:3', value: '{"data":"test3"}', expiresIn: 3600 },
  ]

  for (const entry of testEntries) {
    cacheSet(entry.key, entry.value, entry.expiresIn)
  }

  console.debug('[DB] Database seeded with test data')
}
