import type { Item, MediaType } from '../../../shared/types'

/**
 * Extracts the creator/subtitle value from an item's metadata
 * by reading the first field in the media type's fields_schema.
 * e.g. Books → author, Music → artist, Movies → director
 */
export function getCreator(item: Item, mediaType: MediaType | undefined): string | null {
  if (!mediaType || mediaType.fields_schema.length === 0) return null
  const firstField = mediaType.fields_schema[0]
  const value = item.metadata[firstField.key]
  return typeof value === 'string' && value.length > 0 ? value : null
}
