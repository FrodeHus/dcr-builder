import { randomUUID } from 'node:crypto'

/**
 * Default time-to-live for cached DCR entries (30 minutes)
 */
const DEFAULT_TTL_MS = 1000 * 60 * 30

/**
 * Maximum number of entries in cache before cleanup
 */
const MAX_CACHE_ENTRIES = 10000

/**
 * Maximum size per entry (5MB)
 */
const MAX_ENTRY_SIZE = 5 * 1024 * 1024

type CacheEntry = {
  json: string
  expiresAt: number
  createdAt: number
  accessCount: number
  lastAccessedAt: number
}

const cache = new Map<string, CacheEntry>()

/**
 * Cleans up expired entries and enforces cache size limits
 * Uses LRU (Least Recently Used) eviction when cache exceeds max entries
 */
function cleanupExpired() {
  const now = Date.now()
  let removed = 0

  // Remove expired entries
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key)
      removed++
    }
  }

  // If cache exceeds max size, remove least recently used entries
  if (cache.size > MAX_CACHE_ENTRIES) {
    const entriesToRemove = cache.size - MAX_CACHE_ENTRIES
    const sortedByAccess = Array.from(cache.entries())
      .sort(
        ([, a], [, b]) =>
          a.lastAccessedAt - b.lastAccessedAt,
      )

    for (let i = 0; i < entriesToRemove; i++) {
      const [key] = sortedByAccess[i]
      cache.delete(key)
    }
  }

  if (removed > 0 || cache.size > MAX_CACHE_ENTRIES) {
    console.log(
      `[Cache] Cleanup: removed ${removed} expired entries, cache size: ${cache.size}`,
    )
  }
}

/**
 * Validates cache entry size before storing
 * @throws Error if entry exceeds size limit
 */
function validateEntrySize(json: string) {
  const sizeBytes = new Blob([json]).size
  if (sizeBytes > MAX_ENTRY_SIZE) {
    throw new Error(
      `Cache entry exceeds maximum size of ${MAX_ENTRY_SIZE / 1024 / 1024}MB. Size: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB`,
    )
  }
}

/**
 * Stores DCR JSON in cache and returns a share ID
 * @param json - DCR JSON to cache
 * @param ttlMs - Time-to-live in milliseconds
 * @returns Share ID for retrieving the cached JSON
 * @throws Error if JSON exceeds size limit
 */
export function storeDcrJson(json: string, ttlMs = DEFAULT_TTL_MS) {
  validateEntrySize(json)
  cleanupExpired()
  const id = randomUUID()
  const now = Date.now()
  cache.set(id, {
    json,
    expiresAt: now + ttlMs,
    createdAt: now,
    accessCount: 0,
    lastAccessedAt: now,
  })
  return id
}

/**
 * Updates existing cache entry with new JSON
 * @param id - Cache entry ID
 * @param json - New DCR JSON
 * @param ttlMs - Time-to-live in milliseconds
 * @throws Error if JSON exceeds size limit
 */
export function setDcrJson(id: string, json: string, ttlMs = DEFAULT_TTL_MS) {
  validateEntrySize(json)
  cleanupExpired()
  const now = Date.now()
  cache.set(id, {
    json,
    expiresAt: now + ttlMs,
    createdAt: now,
    accessCount: 0,
    lastAccessedAt: now,
  })
}

/**
 * Retrieves cached DCR JSON by ID
 * @param id - Cache entry ID
 * @returns DCR JSON string or null if not found/expired
 */
export function getDcrJson(id: string) {
  const entry = cache.get(id)
  if (!entry) return null

  if (entry.expiresAt <= Date.now()) {
    cache.delete(id)
    return null
  }

  // Update access tracking for LRU
  entry.accessCount++
  entry.lastAccessedAt = Date.now()

  return entry.json
}

/**
 * Gets cache statistics for monitoring
 */
export function getCacheStats() {
  cleanupExpired()
  return {
    size: cache.size,
    maxSize: MAX_CACHE_ENTRIES,
    entries: Array.from(cache.entries()).map(([id, entry]) => ({
      id,
      createdAt: entry.createdAt,
      expiresAt: entry.expiresAt,
      accessCount: entry.accessCount,
      jsonSize: new Blob([entry.json]).size,
    })),
  }
}
