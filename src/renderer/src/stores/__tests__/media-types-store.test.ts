import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { MediaType } from '../../../../shared/types'
import { useMediaTypesStore } from '../media-types-store'

vi.mock('../../lib/trove-api')

import * as troveApi from '../../lib/trove-api'

const mockMediaTypes: MediaType[] = [
  {
    key: 'books',
    label: 'Books',
    icon: '📚',
    color: '#4F7942',
    fields_schema: [{ key: 'author', label: 'Author', type: 'text' }],
    is_builtin: true,
    sort_order: 0,
  },
  {
    key: 'music',
    label: 'Music',
    icon: '🎵',
    color: '#8B5CF6',
    fields_schema: [{ key: 'artist', label: 'Artist', type: 'text' }],
    is_builtin: true,
    sort_order: 1,
  },
]

describe('Media Types Store', () => {
  beforeEach(() => {
    useMediaTypesStore.getState()._reset()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useMediaTypesStore.getState()
      expect(state.mediaTypes).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('fetchMediaTypes', () => {
    it('fetches and stores media types', async () => {
      vi.mocked(troveApi.getMediaTypes).mockResolvedValue(mockMediaTypes)

      await useMediaTypesStore.getState().fetchMediaTypes()

      const state = useMediaTypesStore.getState()
      expect(state.mediaTypes).toEqual(mockMediaTypes)
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('sets isLoading during fetch', async () => {
      let resolvePromise: (value: MediaType[]) => void
      vi.mocked(troveApi.getMediaTypes).mockImplementation(
        () => new Promise((resolve) => (resolvePromise = resolve)),
      )

      const promise = useMediaTypesStore.getState().fetchMediaTypes()
      expect(useMediaTypesStore.getState().isLoading).toBe(true)

      resolvePromise!(mockMediaTypes)
      await promise
      expect(useMediaTypesStore.getState().isLoading).toBe(false)
    })

    it('handles errors', async () => {
      vi.mocked(troveApi.getMediaTypes).mockRejectedValue(new Error('Network error'))

      await useMediaTypesStore.getState().fetchMediaTypes()

      const state = useMediaTypesStore.getState()
      expect(state.error).toBe('Network error')
      expect(state.isLoading).toBe(false)
      expect(state.mediaTypes).toEqual([])
    })
  })

  describe('getMediaType', () => {
    it('returns the media type by key', async () => {
      vi.mocked(troveApi.getMediaTypes).mockResolvedValue(mockMediaTypes)
      await useMediaTypesStore.getState().fetchMediaTypes()

      const result = useMediaTypesStore.getState().getMediaType('books')
      expect(result).toEqual(mockMediaTypes[0])
    })

    it('returns undefined for missing key', async () => {
      vi.mocked(troveApi.getMediaTypes).mockResolvedValue(mockMediaTypes)
      await useMediaTypesStore.getState().fetchMediaTypes()

      const result = useMediaTypesStore.getState().getMediaType('podcasts')
      expect(result).toBeUndefined()
    })
  })
})
