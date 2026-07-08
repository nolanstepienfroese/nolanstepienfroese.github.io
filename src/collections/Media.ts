import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Images and videos. Images are resized automatically; videos are served as uploaded.',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Short description of the image/video, used for accessibility and SEO.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption shown under the media on project pages.',
      },
    },
  ],
  upload: {
    // MEDIA_DIR lets Docker point uploads at a mounted volume; falls back to ./media in dev
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../media'),
    mimeTypes: ['image/*', 'video/*'],
    imageSizes: [
      { name: 'thumbnail', width: 640 },
      { name: 'card', width: 960 },
      { name: 'full', width: 1920 },
    ],
    adminThumbnail: 'thumbnail',
  },
}
