import { initDatabase, closeDatabase, getDatabase } from './connection'
import { runMigrations } from './migrate'
import { allMigrations } from './migrations'
import { seedBuiltinMediaTypes } from './seeds/media-types'

export function setupDatabase(dbPath?: string): void {
  const db = initDatabase(dbPath)
  runMigrations(db, allMigrations)
  seedBuiltinMediaTypes(db)
}

export { closeDatabase, getDatabase }
