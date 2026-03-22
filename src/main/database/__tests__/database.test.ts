import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtempSync, existsSync, rmSync } from 'fs'
import { ulid } from 'ulid'
import { runMigrations, getAppliedMigrations, rollbackMigration } from '../migrate'
import { allMigrations } from '../migrations'
import { seedBuiltinMediaTypes, builtinMediaTypes } from '../seeds/media-types'

let db: Database.Database
let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'trove-test-'))
  db = new Database(join(tmpDir, 'test.trove'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
})

afterEach(() => {
  db.close()
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('Migration System', () => {
  it('should run all migrations and create tables', () => {
    runMigrations(db, allMigrations)

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as { name: string }[]
    const tableNames = tables.map((t) => t.name)

    expect(tableNames).toContain('items')
    expect(tableNames).toContain('media_types')
    expect(tableNames).toContain('_migrations')
  })

  it('should track applied migrations', () => {
    runMigrations(db, allMigrations)
    const applied = getAppliedMigrations(db)

    expect(applied).toEqual([1, 2])
  })

  it('should be idempotent — running twice has no effect', () => {
    runMigrations(db, allMigrations)
    runMigrations(db, allMigrations)

    const applied = getAppliedMigrations(db)
    expect(applied).toEqual([1, 2])
  })

  it('should support rollback', () => {
    runMigrations(db, allMigrations)

    rollbackMigration(db, allMigrations)
    const applied = getAppliedMigrations(db)
    expect(applied).toEqual([1])

    // media_types table should be dropped
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='media_types'")
      .all()
    expect(tables).toHaveLength(0)
  })
})

describe('Items Table Schema', () => {
  beforeEach(() => {
    runMigrations(db, allMigrations)
  })

  it('should have all expected columns', () => {
    const columns = db.prepare('PRAGMA table_info(items)').all() as { name: string }[]
    const colNames = columns.map((c) => c.name)

    expect(colNames).toEqual([
      'id',
      'type',
      'title',
      'status',
      'rating',
      'cover_path',
      'cover_hue',
      'metadata',
      'notes',
      'date_added',
      'date_modified',
    ])
  })

  it('should enforce NOT NULL on required fields', () => {
    expect(() => {
      db.prepare('INSERT INTO items (id, type, title, date_added, date_modified) VALUES (?, ?, ?, ?, ?)').run(
        ulid(),
        'books',
        'Test Book',
        new Date().toISOString(),
        new Date().toISOString(),
      )
    }).not.toThrow()

    expect(() => {
      db.prepare('INSERT INTO items (id, title, date_added, date_modified) VALUES (?, ?, ?, ?)').run(
        ulid(),
        'Test',
        new Date().toISOString(),
        new Date().toISOString(),
      )
    }).toThrow()
  })

  it('should default status to Owned and rating to 0', () => {
    const id = ulid()
    const now = new Date().toISOString()
    db.prepare('INSERT INTO items (id, type, title, date_added, date_modified) VALUES (?, ?, ?, ?, ?)').run(
      id,
      'books',
      'Test',
      now,
      now,
    )

    const item = db.prepare('SELECT status, rating FROM items WHERE id = ?').get(id) as {
      status: string
      rating: number
    }
    expect(item.status).toBe('Owned')
    expect(item.rating).toBe(0)
  })

  it('should support JSON metadata via json_extract', () => {
    const id = ulid()
    const now = new Date().toISOString()
    const metadata = JSON.stringify({ author: 'Brandon Sanderson', genre: 'Fantasy' })

    db.prepare(
      'INSERT INTO items (id, type, title, metadata, date_added, date_modified) VALUES (?, ?, ?, ?, ?, ?)',
    ).run(id, 'books', 'The Way of Kings', metadata, now, now)

    const result = db
      .prepare("SELECT json_extract(metadata, '$.author') as author FROM items WHERE id = ?")
      .get(id) as { author: string }
    expect(result.author).toBe('Brandon Sanderson')
  })
})

describe('Media Types Table Schema', () => {
  beforeEach(() => {
    runMigrations(db, allMigrations)
  })

  it('should have all expected columns', () => {
    const columns = db.prepare('PRAGMA table_info(media_types)').all() as { name: string }[]
    const colNames = columns.map((c) => c.name)

    expect(colNames).toEqual(['key', 'label', 'icon', 'color', 'fields_schema', 'is_builtin', 'sort_order'])
  })
})

describe('Seed Data', () => {
  beforeEach(() => {
    runMigrations(db, allMigrations)
    seedBuiltinMediaTypes(db)
  })

  it('should seed all 5 built-in media types', () => {
    const types = db.prepare('SELECT * FROM media_types ORDER BY sort_order').all() as {
      key: string
      is_builtin: number
    }[]

    expect(types).toHaveLength(5)
    expect(types.map((t) => t.key)).toEqual(['books', 'music', 'movies', 'tv', 'games'])
    expect(types.every((t) => t.is_builtin === 1)).toBe(true)
  })

  it('should be idempotent — seeding twice has no effect', () => {
    seedBuiltinMediaTypes(db)
    const types = db.prepare('SELECT * FROM media_types').all()
    expect(types).toHaveLength(5)
  })

  it('should have valid fields_schema JSON for each type', () => {
    const types = db.prepare('SELECT key, fields_schema FROM media_types').all() as {
      key: string
      fields_schema: string
    }[]

    for (const type of types) {
      const schema = JSON.parse(type.fields_schema)
      expect(Array.isArray(schema)).toBe(true)
      expect(schema.length).toBeGreaterThan(0)

      for (const field of schema) {
        expect(field).toHaveProperty('key')
        expect(field).toHaveProperty('label')
        expect(field).toHaveProperty('type')
        expect(['text', 'number', 'select', 'combobox']).toContain(field.type)

        if (field.type === 'select') {
          expect(field.options).toBeDefined()
          expect(Array.isArray(field.options)).toBe(true)
          expect(field.options.length).toBeGreaterThan(0)
        }
      }
    }
  })

  it('should have genre, sub_genre, and format fields on every type', () => {
    const types = db.prepare('SELECT key, fields_schema FROM media_types').all() as {
      key: string
      fields_schema: string
    }[]

    for (const type of types) {
      const schema = JSON.parse(type.fields_schema) as { key: string }[]
      const keys = schema.map((f) => f.key)

      expect(keys).toContain('genre')
      expect(keys).toContain('sub_genre')
      expect(keys).toContain('format')
    }
  })

  it('should have combobox fields for creator/entity fields', () => {
    const types = db.prepare('SELECT key, fields_schema FROM media_types').all() as {
      key: string
      fields_schema: string
    }[]

    const expectedComboboxFields: Record<string, string[]> = {
      books: ['author', 'publisher'],
      music: ['artist', 'album', 'label'],
      movies: ['director', 'studio', 'cast'],
      tv: ['creator', 'network'],
      games: ['developer', 'publisher'],
    }

    for (const type of types) {
      const schema = JSON.parse(type.fields_schema) as { key: string; type: string }[]
      const comboboxKeys = schema.filter((f) => f.type === 'combobox').map((f) => f.key)
      expect(comboboxKeys).toEqual(expectedComboboxFields[type.key])
    }
  })

  it('should have the creator field as the first field in each schema', () => {
    const expectedFirstFields: Record<string, string> = {
      books: 'author',
      music: 'artist',
      movies: 'director',
      tv: 'creator',
      games: 'developer',
    }

    const types = db.prepare('SELECT key, fields_schema FROM media_types').all() as {
      key: string
      fields_schema: string
    }[]

    for (const type of types) {
      const schema = JSON.parse(type.fields_schema) as { key: string }[]
      expect(schema[0].key).toBe(expectedFirstFields[type.key])
    }
  })

  it('should extract fields_schema via json_extract', () => {
    const result = db
      .prepare("SELECT json_extract(fields_schema, '$[0].key') as first_key FROM media_types WHERE key = ?")
      .get('books') as { first_key: string }

    expect(result.first_key).toBe('author')
  })
})

describe('ULID Generation', () => {
  it('should generate unique IDs with correct format', () => {
    const id1 = ulid()
    const id2 = ulid()

    expect(id1).not.toBe(id2)
    expect(id1.length).toBe(26)
    expect(id2.length).toBe(26)
    // ULIDs are Crockford Base32 encoded
    expect(id1).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
  })

  it('should generate sortable IDs across different timestamps', async () => {
    const id1 = ulid()
    await new Promise((r) => setTimeout(r, 2))
    const id2 = ulid()

    expect(id1 < id2).toBe(true)
  })
})
