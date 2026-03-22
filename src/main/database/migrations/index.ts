import type { Migration } from '../migrate'
import { migration as createItems } from './001_create_items'
import { migration as createMediaTypes } from './002_create_media_types'

export const allMigrations: Migration[] = [createItems, createMediaTypes]
