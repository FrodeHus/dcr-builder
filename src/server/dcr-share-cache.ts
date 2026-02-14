import { randomUUID } from 'node:crypto'

const DEFAULT_TTL_MS = 1000 * 60 * 30

type CacheEntry = {
  json: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

function cleanupExpired() {
  const now = Date.now()
  for (const [key, entry] of cache) {
    if (entry.expiresAt <= now) {
      cache.delete(key)
    }
  }
}

export function storeDcrJson(json: string, ttlMs = DEFAULT_TTL_MS) {
  cleanupExpired()
  const id = randomUUID()
  cache.set(id, { json, expiresAt: Date.now() + ttlMs })
  return id
}

export function setDcrJson(id: string, json: string, ttlMs = DEFAULT_TTL_MS) {
  cleanupExpired()
  cache.set(id, { json, expiresAt: Date.now() + ttlMs })
}

export function getDcrJson(id: string) {
  const entry = cache.get(id)
  if (!entry) return null
  if (entry.expiresAt <= Date.now()) {
    cache.delete(id)
    return null
  }
  return entry.json
}
