import type { Migration } from '../migrate'

export const migration: Migration = {
  version: 2,
  name: 'create_media_types',
  up(db) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS media_types (
        key TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        fields_schema TEXT NOT NULL DEFAULT '[]',
        is_builtin INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `)
  },
  down(db) {
    db.exec('DROP TABLE IF EXISTS media_types')
  },
}
