import { createRequire } from 'module'
import { app } from 'electron'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3') as typeof import('better-sqlite3').default
import { existsSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'

let db: Database.Database | null = null

export function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'library.trove')
}

export function getCoversPath(): string {
  return join(dirname(getDbPath()), 'covers')
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

export function initDatabase(dbPath?: string): Database.Database {
  const path = dbPath ?? getDbPath()

  // Ensure parent directory exists
  const dir = dirname(path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  db = new Database(path)

  // Enable WAL mode for better concurrent read performance
  db.pragma('journal_mode = WAL')

  // Ensure foreign keys are enforced
  db.pragma('foreign_keys = ON')

  // Create sibling /covers directory
  const coversPath = join(dirname(path), 'covers')
  if (!existsSync(coversPath)) {
    mkdirSync(coversPath, { recursive: true })
  }

  return db
}

export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
