import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Database from 'better-sqlite3'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdtempSync, rmSync } from 'fs'
import { runMigrations } from '../../migrate'
import { allMigrations } from '../../migrations'
import { seedBuiltinMediaTypes } from '../../seeds/media-types'
import {
  findItems,
  findItemById,
  insertItem,
  updateItem,
  deleteItem,
  computeCoverHue,
} from '../items'

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

describe('computeCoverHue', () => {
  it('should return a value between 0 and 359', () => {
    const hue = computeCoverHue('Test Title')
    expect(hue).toBeGreaterThanOrEqual(0)
    expect(hue).toBeLessThan(360)
  })

  it('should be deterministic — same title always produces same hue', () => {
    expect(computeCoverHue('The Way of Kings')).toBe(computeCoverHue('The Way of Kings'))
  })

  it('should produce different hues for different titles', () => {
    const hue1 = computeCoverHue('Book A')
    const hue2 = computeCoverHue('Book B')
    expect(hue1).not.toBe(hue2)
  })
})

describe('insertItem', () => {
  it('should create an item with auto-generated ULID, timestamps, and cover_hue', () => {
    const item = insertItem(db, { type: 'books', title: 'The Way of Kings' })

    expect(item.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/)
    expect(item.type).toBe('books')
    expect(item.title).toBe('The Way of Kings')
    expect(item.status).toBe('Owned')
    expect(item.rating).toBe(0)
    expect(item.cover_hue).toBe(computeCoverHue('The Way of Kings'))
    expect(item.cover_path).toBeNull()
    expect(item.metadata).toEqual({})
    expect(item.notes).toBeNull()
    expect(item.date_added).toBeTruthy()
    expect(item.date_modified).toBe(item.date_added)
  })

  it('should store and retrieve metadata as a parsed object', () => {
    const meta = { author: 'Brandon Sanderson', genre: 'Fantasy', pages: 1007 }
    const item = insertItem(db, {
      type: 'books',
      title: 'The Way of Kings',
      metadata: meta,
    })

    expect(item.metadata).toEqual(meta)
  })

  it('should respect optional fields when provided', () => {
    const item = insertItem(db, {
      type: 'music',
      title: 'OK Computer',
      status: 'Wishlist',
      rating: 5,
      notes: 'Classic album',
    })

    expect(item.status).toBe('Wishlist')
    expect(item.rating).toBe(5)
    expect(item.notes).toBe('Classic album')
  })
})

describe('findItemById', () => {
  it('should return the item when found', () => {
    const created = insertItem(db, { type: 'books', title: 'Dune' })
    const found = findItemById(db, created.id)

    expect(found).toEqual(created)
  })

  it('should return null for a non-existent ID', () => {
    expect(findItemById(db, 'NONEXISTENT_ID')).toBeNull()
  })
})

describe('findItems', () => {
  beforeEach(() => {
    insertItem(db, { type: 'books', title: 'Alpha', status: 'Owned', metadata: { author: 'Zoe' } })
    insertItem(db, {
      type: 'books',
      title: 'Bravo',
      status: 'Wishlist',
      metadata: { author: 'Amy' },
    })
    insertItem(db, {
      type: 'movies',
      title: 'Charlie',
      status: 'Owned',
      metadata: { director: 'Nolan' },
    })
  })

  it('should return all items with total when no filter', () => {
    const result = findItems(db)
    expect(result.total).toBe(3)
    expect(result.items).toHaveLength(3)
  })

  it('should default sort by date_added DESC', () => {
    const result = findItems(db)
    // Last inserted first
    expect(result.items[0].title).toBe('Charlie')
    expect(result.items[2].title).toBe('Alpha')
  })

  it('should filter by type', () => {
    const result = findItems(db, { type: 'books' })
    expect(result.total).toBe(2)
    expect(result.items.every((i) => i.type === 'books')).toBe(true)
  })

  it('should filter by status', () => {
    const result = findItems(db, { status: 'Wishlist' })
    expect(result.total).toBe(1)
    expect(result.items[0].title).toBe('Bravo')
  })

  it('should search by title (case-insensitive)', () => {
    const result = findItems(db, { search: 'alpha' })
    expect(result.total).toBe(1)
    expect(result.items[0].title).toBe('Alpha')
  })

  it('should combine multiple filters', () => {
    const result = findItems(db, { type: 'books', status: 'Owned' })
    expect(result.total).toBe(1)
    expect(result.items[0].title).toBe('Alpha')
  })

  it('should sort by a shared column', () => {
    const result = findItems(db, { sortBy: 'title', sortDirection: 'asc' })
    expect(result.items.map((i) => i.title)).toEqual(['Alpha', 'Bravo', 'Charlie'])
  })

  it('should sort by a metadata field via json_extract', () => {
    const result = findItems(db, { type: 'books', sortBy: 'author', sortDirection: 'asc' })
    expect(result.items[0].title).toBe('Bravo') // Amy < Zoe
    expect(result.items[1].title).toBe('Alpha')
  })

  it('should support pagination with limit and offset', () => {
    const page1 = findItems(db, { limit: 2, offset: 0 })
    expect(page1.items).toHaveLength(2)
    expect(page1.total).toBe(3)

    const page2 = findItems(db, { limit: 2, offset: 2 })
    expect(page2.items).toHaveLength(1)
    expect(page2.total).toBe(3)
  })

  it('should return empty results when no matches', () => {
    const result = findItems(db, { type: 'games' })
    expect(result.total).toBe(0)
    expect(result.items).toEqual([])
  })
})

describe('updateItem', () => {
  it('should update only specified fields and refresh date_modified', () => {
    const item = insertItem(db, { type: 'books', title: 'Old Title', rating: 0 })
    const originalModified = item.date_modified

    // Small delay so timestamp differs
    const updated = updateItem(db, item.id, { title: 'New Title', rating: 4 })

    expect(updated).not.toBeNull()
    expect(updated!.title).toBe('New Title')
    expect(updated!.rating).toBe(4)
    expect(updated!.type).toBe('books') // unchanged
    expect(updated!.status).toBe('Owned') // unchanged
    expect(updated!.date_modified >= originalModified).toBe(true)
  })

  it('should update metadata without affecting other fields', () => {
    const item = insertItem(db, {
      type: 'books',
      title: 'Dune',
      metadata: { author: 'Herbert' },
    })

    const updated = updateItem(db, item.id, {
      metadata: { author: 'Frank Herbert', pages: 412 },
    })

    expect(updated!.metadata).toEqual({ author: 'Frank Herbert', pages: 412 })
    expect(updated!.title).toBe('Dune')
  })

  it('should return null for a non-existent ID', () => {
    expect(updateItem(db, 'NONEXISTENT_ID', { title: 'Nope' })).toBeNull()
  })
})

describe('deleteItem', () => {
  it('should delete an existing item and return deleted: true', () => {
    const item = insertItem(db, { type: 'books', title: 'To Delete' })
    const result = deleteItem(db, item.id)

    expect(result.deleted).toBe(true)
    expect(result.coverPath).toBeNull()
    expect(findItemById(db, item.id)).toBeNull()
  })

  it('should return the cover_path of the deleted item', () => {
    const item = insertItem(db, {
      type: 'books',
      title: 'With Cover',
      cover_path: 'abc123.jpg',
    })

    const result = deleteItem(db, item.id)
    expect(result.deleted).toBe(true)
    expect(result.coverPath).toBe('abc123.jpg')
  })

  it('should return deleted: false for a non-existent ID', () => {
    const result = deleteItem(db, 'NONEXISTENT_ID')
    expect(result.deleted).toBe(false)
    expect(result.coverPath).toBeNull()
  })
})
