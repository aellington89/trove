import { ipcMain } from 'electron'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { getDatabase, getCoversPath } from '../database/connection'
import {
  findItems,
  findItemById,
  insertItem,
  updateItem,
  deleteItem,
} from '../database/repositories/items'
import { findAllMediaTypes } from '../database/repositories/media-types'
import type { IpcResult, ItemFilter, CreateItemInput, UpdateItemInput } from '@shared/types'

function ok<T>(data: T): IpcResult<T> {
  return { success: true, data }
}

function fail(
  code: 'ITEM_NOT_FOUND' | 'VALIDATION_ERROR' | 'DB_ERROR',
  message: string,
): IpcResult<never> {
  return { success: false, error: { code, message } }
}

export function registerIpcHandlers(): void {
  ipcMain.handle('trove:items:list', (_event, filter?: ItemFilter) => {
    try {
      return ok(findItems(getDatabase(), filter))
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })

  ipcMain.handle('trove:items:get', (_event, id: string) => {
    try {
      const item = findItemById(getDatabase(), id)
      if (!item) return fail('ITEM_NOT_FOUND', `Item not found: ${id}`)
      return ok(item)
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })

  ipcMain.handle('trove:items:create', (_event, data: CreateItemInput) => {
    if (!data?.type || !data?.title) {
      return fail('VALIDATION_ERROR', 'type and title are required')
    }
    try {
      return ok(insertItem(getDatabase(), data))
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })

  ipcMain.handle('trove:items:update', (_event, id: string, data: UpdateItemInput) => {
    try {
      const item = updateItem(getDatabase(), id, data)
      if (!item) return fail('ITEM_NOT_FOUND', `Item not found: ${id}`)
      return ok(item)
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })

  ipcMain.handle('trove:items:delete', (_event, id: string) => {
    try {
      const result = deleteItem(getDatabase(), id)
      if (!result.deleted) return fail('ITEM_NOT_FOUND', `Item not found: ${id}`)

      // Clean up cover file if it exists
      if (result.coverPath) {
        try {
          const fullPath = join(getCoversPath(), result.coverPath)
          if (existsSync(fullPath)) unlinkSync(fullPath)
        } catch {
          // File cleanup failure is non-fatal — log but don't fail the delete
        }
      }

      return ok({ id })
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })

  ipcMain.handle('trove:media-types:list', () => {
    try {
      return ok(findAllMediaTypes(getDatabase()))
    } catch (err) {
      return fail('DB_ERROR', (err as Error).message)
    }
  })
}
