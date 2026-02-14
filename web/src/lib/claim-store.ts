import { writeFile, readFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { dirname } from "node:path"

export interface SessionData {
  verified: boolean
  proof?: string
  wallet?: string
  createdAt: number
}

export interface ClaimStore {
  getLastClaim(nullifierHash: string): Promise<number | null>
  recordClaim(nullifierHash: string, timestamp: number): Promise<void>
  getSession(sessionId: string): Promise<SessionData | null>
  setSession(sessionId: string, data: SessionData): Promise<void>
  deleteSession(sessionId: string): Promise<void>
}

interface FileStoreData {
  claims: Record<string, number>
  sessions: Record<string, SessionData>
}

/**
 * File-based store for development
 * Data persists across server restarts
 */
export function createFileStore(path: string): ClaimStore {
  let cache: FileStoreData | null = null

  async function ensureDir() {
    const dir = dirname(path)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
  }

  async function load(): Promise<FileStoreData> {
    if (cache) return cache

    try {
      const content = await readFile(path, "utf-8")
      cache = JSON.parse(content) as FileStoreData
    } catch {
      cache = { claims: {}, sessions: {} }
    }

    return cache
  }

  async function save(data: FileStoreData): Promise<void> {
    await ensureDir()
    cache = data
    await writeFile(path, JSON.stringify(data, null, 2), "utf-8")
  }

  return {
    async getLastClaim(nullifierHash: string): Promise<number | null> {
      const data = await load()
      return data.claims[nullifierHash] ?? null
    },

    async recordClaim(nullifierHash: string, timestamp: number): Promise<void> {
      const data = await load()
      data.claims[nullifierHash] = timestamp
      await save(data)
    },

    async getSession(sessionId: string): Promise<SessionData | null> {
      const data = await load()
      const session = data.sessions[sessionId]

      if (!session) return null

      // Session expires after 1 hour
      const SESSION_TTL = 60 * 60 * 1000
      if (Date.now() - session.createdAt > SESSION_TTL) {
        delete data.sessions[sessionId]
        await save(data)
        return null
      }

      return session
    },

    async setSession(sessionId: string, sessionData: SessionData): Promise<void> {
      const data = await load()
      data.sessions[sessionId] = sessionData
      await save(data)
    },

    async deleteSession(sessionId: string): Promise<void> {
      const data = await load()
      delete data.sessions[sessionId]
      await save(data)
    },
  }
}

/**
 * In-memory store for testing
 * Data is lost on restart
 */
export function createMemoryStore(): ClaimStore {
  const claims = new Map<string, number>()
  const sessions = new Map<string, SessionData>()

  return {
    async getLastClaim(nullifierHash: string): Promise<number | null> {
      return claims.get(nullifierHash) ?? null
    },

    async recordClaim(nullifierHash: string, timestamp: number): Promise<void> {
      claims.set(nullifierHash, timestamp)
    },

    async getSession(sessionId: string): Promise<SessionData | null> {
      const session = sessions.get(sessionId)

      if (!session) return null

      // Session expires after 1 hour
      const SESSION_TTL = 60 * 60 * 1000
      if (Date.now() - session.createdAt > SESSION_TTL) {
        sessions.delete(sessionId)
        return null
      }

      return session
    },

    async setSession(sessionId: string, data: SessionData): Promise<void> {
      sessions.set(sessionId, data)
    },

    async deleteSession(sessionId: string): Promise<void> {
      sessions.delete(sessionId)
    },
  }
}

// Default store instance - uses file store in dev, can be replaced with Redis/Postgres in production
let defaultStore: ClaimStore | null = null

export function getStore(): ClaimStore {
  if (!defaultStore) {
    // Use file store by default for persistence across restarts
    const storePath = process.env.CLAIM_STORE_PATH || "./.data/claims.json"
    defaultStore = createFileStore(storePath)
  }
  return defaultStore
}

// For testing: reset the default store
export function resetStore(store?: ClaimStore): void {
  defaultStore = store ?? null
}
