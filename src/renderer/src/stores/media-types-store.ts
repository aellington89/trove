import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { MediaType } from '../../../shared/types'
import * as troveApi from '../lib/trove-api'

interface MediaTypesState {
  mediaTypes: MediaType[]
  isLoading: boolean
  error: string | null
}

interface MediaTypesActions {
  fetchMediaTypes: () => Promise<void>
  getMediaType: (key: string) => MediaType | undefined
  _reset: () => void
}

const initialState: MediaTypesState = {
  mediaTypes: [],
  isLoading: false,
  error: null,
}

export const useMediaTypesStore = create<MediaTypesState & MediaTypesActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      fetchMediaTypes: async () => {
        set({ isLoading: true, error: null })
        try {
          const mediaTypes = await troveApi.getMediaTypes()
          set({ mediaTypes, isLoading: false })
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch media types',
            isLoading: false,
          })
        }
      },
      getMediaType: (key) => get().mediaTypes.find((mt) => mt.key === key),
      _reset: () => set(initialState),
    }),
    { name: 'MediaTypesStore' },
  ),
)
