import type {
  Item,
  MediaType,
  ItemFilter,
  CreateItemInput,
  UpdateItemInput,
  PaginatedResult,
  IpcResult,
} from '../../../shared/types'

export class TroveError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = 'TroveError'
    this.code = code
  }
}

function unwrap<T>(result: IpcResult<T>): T {
  if (!result.success) {
    throw new TroveError(result.error.code, result.error.message)
  }
  return result.data
}

export async function getItems(filter?: ItemFilter): Promise<PaginatedResult<Item>> {
  const result = (await window.trove.invoke('trove:items:list', filter)) as IpcResult<
    PaginatedResult<Item>
  >
  return unwrap(result)
}

export async function getItem(id: string): Promise<Item> {
  const result = (await window.trove.invoke('trove:items:get', id)) as IpcResult<Item>
  return unwrap(result)
}

export async function createItem(data: CreateItemInput): Promise<Item> {
  const result = (await window.trove.invoke('trove:items:create', data)) as IpcResult<Item>
  return unwrap(result)
}

export async function updateItem(id: string, data: UpdateItemInput): Promise<Item> {
  const result = (await window.trove.invoke('trove:items:update', id, data)) as IpcResult<Item>
  return unwrap(result)
}

export async function deleteItem(id: string): Promise<{ id: string }> {
  const result = (await window.trove.invoke('trove:items:delete', id)) as IpcResult<{ id: string }>
  return unwrap(result)
}

export async function getMediaTypes(): Promise<MediaType[]> {
  const result = (await window.trove.invoke('trove:media-types:list')) as IpcResult<MediaType[]>
  return unwrap(result)
}
