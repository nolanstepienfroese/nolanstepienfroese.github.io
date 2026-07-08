import type { Media } from '@/payload-types'

type SizeName = 'thumbnail' | 'card' | 'full'

export function asMedia(value: Media | number | null | undefined): Media | null {
  if (!value || typeof value === 'number') return null
  return value
}

export function mediaUrl(value: Media | number | null | undefined, size?: SizeName): string | null {
  const media = asMedia(value)
  if (!media) return null
  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.url) return sized.url
  }
  return media.url ?? null
}

export function isVideo(value: Media | number | null | undefined): boolean {
  const media = asMedia(value)
  return Boolean(media?.mimeType?.startsWith('video/'))
}
