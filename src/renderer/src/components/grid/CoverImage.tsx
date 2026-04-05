import { memo, useState } from 'react'
import type { ReactElement } from 'react'
import type { Item } from '../../../../shared/types'
import { ProceduralCover } from '../covers'

export interface CoverImageProps {
  item: Item
  size?: 'xs' | 'sm' | 'md'
}

export const CoverImage = memo(function CoverImage({ item, size = 'md' }: CoverImageProps): ReactElement {
  const [imgError, setImgError] = useState(false)

  if (!item.cover_path || imgError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ProceduralCover
          title={item.title}
          type={item.type}
          hue={item.cover_hue ?? 0}
          size={size}
        />
      </div>
    )
  }

  return (
    <img
      src={item.cover_path}
      alt={`Cover art for ${item.title}`}
      className="h-full w-full object-cover"
      onError={() => setImgError(true)}
    />
  )
})
