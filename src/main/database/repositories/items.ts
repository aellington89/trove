import type Database from 'better-sqlite3'
import { ulid } from 'ulid'
import type {
  Item,
  CreateItemInput,
  UpdateItemInput,
  ItemFilter,
  PaginatedResult,
} from '@shared/types'
import { computeCoverHue } from '../../../shared/hash'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Raw row shape from SQLite (metadata is a JSON string). */
interface RawItemRow {
  id: string
  type: string
  title: string
  status: string
  rating: number
  cover_path: string | null
  cover_hue: number | null
  metadata: string
  notes: string | null
  date_added: string
  date_modified: string
}

function parseItemRow(row: RawItemRow): Item {
  return {
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
  }
}

export { computeCoverHue } from '../../../shared/hash'

/** Shared columns that are safe to use directly in ORDER BY. */
const SORTABLE_COLUMNS = new Set([
  'title',
  'type',
  'status',
  'rating',
  'date_added',
  'date_modified',
])

/** Strip anything that isn't a letter, digit, or underscore. */
function sanitizeFieldKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_]/g, '')
}

// ─── Repository Functions ────────────────────────────────────────────────────

export function findItems(db: Database.Database, filter: ItemFilter = {}): PaginatedResult<Item> {
  const conditions: string[] = []
  const params: (string | number)[] = []

  if (filter.type) {
    conditions.push('type = ?')
    params.push(filter.type)
  }
  if (filter.status) {
    conditions.push('status = ?')
    params.push(filter.status)
  }
  if (filter.search) {
    conditions.push('title LIKE ?')
    params.push(`%${filter.search}%`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // Sorting
  let orderClause = 'ORDER BY date_added DESC'
  if (filter.sortBy) {
    const dir = filter.sortDirection === 'asc' ? 'ASC' : 'DESC'
    if (SORTABLE_COLUMNS.has(filter.sortBy)) {
      orderClause = `ORDER BY ${filter.sortBy} ${dir}`
    } else {
      const safeKey = sanitizeFieldKey(filter.sortBy)
      if (safeKey) {
        orderClause = `ORDER BY json_extract(metadata, '$.${safeKey}') ${dir}`
      }
    }
  }

  // Count (uses only WHERE params)
  const countSql = `SELECT COUNT(*) as count FROM items ${whereClause}`
  const total = (db.prepare(countSql).get(...params) as { count: number }).count

  // Data query
  let dataSql = `SELECT * FROM items ${whereClause} ${orderClause}`
  const dataParams = [...params]

  if (filter.limit != null) {
    dataSql += ' LIMIT ?'
    dataParams.push(filter.limit)
    dataSql += ' OFFSET ?'
    dataParams.push(filter.offset ?? 0)
  }

  const rows = db.prepare(dataSql).all(...dataParams) as RawItemRow[]

  return { items: rows.map(parseItemRow), total }
}

export function findItemById(db: Database.Database, id: string): Item | null {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as RawItemRow | undefined
  return row ? parseItemRow(row) : null
}

export function insertItem(db: Database.Database, input: CreateItemInput): Item {
  const id = ulid()
  const now = new Date().toISOString()
  const coverHue = computeCoverHue(input.title)

  const stmt = db.prepare(`
    INSERT INTO items (id, type, title, status, rating, cover_path, cover_hue, metadata, notes, date_added, date_modified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  stmt.run(
    id,
    input.type,
    input.title,
    input.status ?? 'Owned',
    input.rating ?? 0,
    input.cover_path ?? null,
    coverHue,
    JSON.stringify(input.metadata ?? {}),
    input.notes ?? null,
    now,
    now,
  )

  return findItemById(db, id)!
}

export function updateItem(db: Database.Database, id: string, input: UpdateItemInput): Item | null {
  // Verify item exists
  const existing = findItemById(db, id)
  if (!existing) return null

  const sets: string[] = []
  const params: (string | number | null)[] = []

  if (input.title !== undefined) {
    sets.push('title = ?')
    params.push(input.title)
  }
  if (input.status !== undefined) {
    sets.push('status = ?')
    params.push(input.status)
  }
  if (input.rating !== undefined) {
    sets.push('rating = ?')
    params.push(input.rating)
  }
  if (input.cover_path !== undefined) {
    sets.push('cover_path = ?')
    params.push(input.cover_path)
  }
  if (input.cover_hue !== undefined) {
    sets.push('cover_hue = ?')
    params.push(input.cover_hue)
  }
  if (input.metadata !== undefined) {
    sets.push('metadata = ?')
    params.push(JSON.stringify(input.metadata))
  }
  if (input.notes !== undefined) {
    sets.push('notes = ?')
    params.push(input.notes)
  }

  // Always update date_modified
  sets.push('date_modified = ?')
  const now = new Date().toISOString()
  params.push(now)

  if (sets.length > 1) {
    // More than just date_modified
    params.push(id)
    db.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  }

  return findItemById(db, id)!
}

export function countItemsByType(db: Database.Database): Record<string, number> {
  const rows = db.prepare('SELECT type, COUNT(*) as count FROM items GROUP BY type').all() as {
    type: string
    count: number
  }[]
  const counts: Record<string, number> = {}
  for (const row of rows) {
    counts[row.type] = row.count
  }
  return counts
}

export function deleteItem(
  db: Database.Database,
  id: string,
): { deleted: boolean; coverPath: string | null } {
  // Fetch cover_path before deleting
  const row = db.prepare('SELECT cover_path FROM items WHERE id = ?').get(id) as
    | { cover_path: string | null }
    | undefined

  if (!row) return { deleted: false, coverPath: null }

  db.prepare('DELETE FROM items WHERE id = ?').run(id)
  return { deleted: true, coverPath: row.cover_path }
}
