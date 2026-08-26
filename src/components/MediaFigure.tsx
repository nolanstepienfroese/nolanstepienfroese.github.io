import React from 'react'

import type { Media } from '@/payload-types'
import { isVideo, mediaUrl, withBasePath } from '@/lib/media'

export function MediaFigure({ media }: { media: Media }) {
  // Videos have no generated sizes, so the raw upload URL is used — but it
  // still needs the base path when the site is served from a subdirectory.
  const src = isVideo(media) ? withBasePath(media.url) : mediaUrl(media, 'full')
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
