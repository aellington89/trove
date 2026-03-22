import type { Migration } from '../migrate'

export const migration: Migration = {
  version: 1,
  name: 'create_items',
  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Owned',
        rating INTEGER NOT NULL DEFAULT 0,
        cover_path TEXT,
        cover_hue INTEGER,
        metadata TEXT NOT NULL DEFAULT '{}',
        notes TEXT,
        date_added TEXT NOT NULL,
        date_modified TEXT NOT NULL
      )
    `)

    // Index for filtering by type
    db.exec('CREATE INDEX IF NOT EXISTS idx_items_type ON items (type)')

    // Index for filtering by status
    db.exec('CREATE INDEX IF NOT EXISTS idx_items_status ON items (status)')

    // Index for sorting by date_added
    db.exec('CREATE INDEX IF NOT EXISTS idx_items_date_added ON items (date_added)')
  },
  down(db) {
    db.exec('DROP TABLE IF EXISTS items')
  },
}
