import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { runMigrations } from '../../migrate'
import { allMigrations } from '../../migrations'
import { seedBuiltinMediaTypes } from '../../seeds/media-types'
import { findAllMediaTypes } from '../media-types'

let db: Database.Database
let tmpDir: string

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'trove-test-'))
  db = new Database(join(tmpDir, 'test.trove'))
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  runMigrations(db, allMigrations)
  seedBuiltinMediaTypes(db)
})

afterEach(() => {
  db.close()
  rmSync(tmpDir, { recursive: true, force: true })
})

describe('findAllMediaTypes', () => {
  it('should return all 5 seeded media types in sort_order', () => {
    const types = findAllMediaTypes(db)

    expect(types).toHaveLength(5)
    expect(types.map((t) => t.key)).toEqual(['books', 'music', 'movies', 'tv', 'games'])
  })

  it('should parse fields_schema from JSON string to array', () => {
    const types = findAllMediaTypes(db)

    for (const type of types) {
      expect(Array.isArray(type.fields_schema)).toBe(true)
      expect(type.fields_schema.length).toBeGreaterThan(0)
      expect(type.fields_schema[0]).toHaveProperty('key')
      expect(type.fields_schema[0]).toHaveProperty('label')
      expect(type.fields_schema[0]).toHaveProperty('type')
    }
  })

  it('should convert is_builtin from integer to boolean', () => {
    const types = findAllMediaTypes(db)

    for (const type of types) {
      expect(typeof type.is_builtin).toBe('boolean')
      expect(type.is_builtin).toBe(true)
    }
  })
})
