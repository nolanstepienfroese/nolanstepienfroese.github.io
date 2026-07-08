import React from 'react'

import type { Media } from '@/payload-types'
import { isVideo, mediaUrl } from '@/lib/media'

export function MediaFigure({ media }: { media: Media }) {
  const src = isVideo(media) ? (media.url ?? null) : mediaUrl(media, 'full')
  if (!src) return null

  return (
    <figure className="media-figure">
      {isVideo(media) ? (
        <video controls preload="metadata" src={src} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={media.alt} src={src} loading="lazy" />
      )}
      {media.caption && <figcaption>{media.caption}</figcaption>}
    </figure>
  )
}
