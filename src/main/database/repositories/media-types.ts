import type Database from 'better-sqlite3'
import type { MediaType } from '@shared/types'

interface RawMediaTypeRow {
  key: string
  label: string
  icon: string
  color: string
  fields_schema: string
  is_builtin: number
  sort_order: number
}

function parseMediaTypeRow(row: RawMediaTypeRow): MediaType {
  return {
    ...row,
    fields_schema: JSON.parse(row.fields_schema),
    is_builtin: row.is_builtin === 1,
  }
}

export function findAllMediaTypes(db: Database.Database): MediaType[] {
  const rows = db
    .prepare('SELECT * FROM media_types ORDER BY sort_order')
    .all() as RawMediaTypeRow[]
  return rows.map(parseMediaTypeRow)
}
