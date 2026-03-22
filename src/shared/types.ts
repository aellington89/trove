// ─── Field Definitions ───────────────────────────────────────────────────────

export interface FieldDefinition {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'combobox'
  options?: string[]
}

// ─── Domain Types ────────────────────────────────────────────────────────────

export interface Item {
  id: string
  type: string
  title: string
  status: string
  rating: number
  cover_path: string | null
  cover_hue: number | null
  metadata: Record<string, unknown>
  notes: string | null
  date_added: string
  date_modified: string
}

export interface MediaType {
  key: string
  label: string
  icon: string
  color: string
  fields_schema: FieldDefinition[]
  is_builtin: boolean
  sort_order: number
}

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CreateItemInput {
  type: string
  title: string
  status?: string
  rating?: number
  cover_path?: string
  metadata?: Record<string, unknown>
  notes?: string
}

export interface UpdateItemInput {
  title?: string
  status?: string
  rating?: number
  cover_path?: string
  cover_hue?: number
  metadata?: Record<string, unknown>
  notes?: string
}

// ─── Query Types ─────────────────────────────────────────────────────────────

export interface ItemFilter {
  type?: string
  status?: string
  search?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

// ─── IPC Result Envelope ─────────────────────────────────────────────────────

export type IpcResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: TroveErrorCode; message: string } }

export type TroveErrorCode = 'ITEM_NOT_FOUND' | 'VALIDATION_ERROR' | 'DB_ERROR'
