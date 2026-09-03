import type { Media } from '@/payload-types'

type SizeName = 'thumbnail' | 'card' | 'full'

// Set from `basePath` in next.config.ts. Empty for local dev, the Docker image,
// and a <user>.github.io repo; '/<repo>' for a project repo served from a
// subdirectory. Inlined at build time, so it is identical on server and client.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Prefixes a root-relative URL with the deployment's base path.
 *
 * Payload stores upload URLs as `/api/media/file/<name>`, which is correct at
 * the root but 404s when the site is served from a subdirectory. Next rewrites
 * <Link> hrefs and its own assets automatically; these strings come from the
 * database, so they have to be handled here.
 */
export function withBasePath(url: string | null | undefined): string | null {
  if (!url) return null
  // Leave absolute URLs (external or already-prefixed) and data URIs alone.
  if (!url.startsWith('/') || url.startsWith('//')) return url
  if (!BASE_PATH) return url
  if (url === BASE_PATH || url.startsWith(`${BASE_PATH}/`)) return url
  return `${BASE_PATH}${url}`
}

export function asMedia(value: Media | number | null | undefined): Media | null {
  if (!value || typeof value === 'number') return null
  return value
}

export function mediaUrl(value: Media | number | null | undefined, size?: SizeName): string | null {
  const media = asMedia(value)
  if (!media) return null
  if (size) {
    const sized = media.sizes?.[size]
    if (sized?.url) return withBasePath(sized.url)
  }
  return withBasePath(media.url)
}

export function isVideo(value: Media | number | null | undefined): boolean {
  const media = asMedia(value)
  return Boolean(media?.mimeType?.startsWith('video/'))
}

export type ResolvedImage = {
  src: string
  width: number | null
  height: number | null
  alt: string
}

/**
 * Resolves an upload to the src and intrinsic dimensions of a single size.
 *
 * Payload skips a configured size when the source is narrower than it, so a
 * request for `card` on a 641px-wide upload returns nothing; the original is
 * used instead. Returning the URL and the dimensions together keeps them
 * describing the same file, which is what lets the browser reserve the right
 * space before the image loads.
 */
export function mediaImage(
  value: Media | number | null | undefined,
  size?: SizeName,
): ResolvedImage | null {
  const media = asMedia(value)
  if (!media) return null
  const sized = size ? media.sizes?.[size] : undefined
  const source = sized?.url ? sized : media
  const src = withBasePath(source.url)
  if (!src) return null
  return {
    src,
    width: source.width ?? null,
    height: source.height ?? null,
    alt: media.alt,
  }
}
