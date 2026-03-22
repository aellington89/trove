import type Database from 'better-sqlite3'

export interface Migration {
  version: number
  name: string
  up: (db: Database.Database) => void
  down: (db: Database.Database) => void
}

function ensureMigrationsTable(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
}

export function getAppliedMigrations(db: Database.Database): number[] {
  ensureMigrationsTable(db)
  const rows = db.prepare('SELECT version FROM _migrations ORDER BY version').all() as {
    version: number
  }[]
  return rows.map((r) => r.version)
}

export function runMigrations(db: Database.Database, migrations: Migration[]): void {
  ensureMigrationsTable(db)

  const applied = new Set(getAppliedMigrations(db))
  const pending = migrations
    .filter((m) => !applied.has(m.version))
    .sort((a, b) => a.version - b.version)

  for (const migration of pending) {
    const runMigration = db.transaction(() => {
      migration.up(db)
      db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(
        migration.version,
        migration.name,
      )
    })
    runMigration()
  }
}

export function rollbackMigration(db: Database.Database, migrations: Migration[]): void {
  ensureMigrationsTable(db)

  const applied = getAppliedMigrations(db)
  if (applied.length === 0) return

  const lastVersion = applied[applied.length - 1]
  const migration = migrations.find((m) => m.version === lastVersion)
  if (!migration) return

  const rollback = db.transaction(() => {
    migration.down(db)
    db.prepare('DELETE FROM _migrations WHERE version = ?').run(migration.version)
  })
  rollback()
}
