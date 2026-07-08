import type { CollectionConfig, FieldHook } from 'payload'

const formatSlug: FieldHook = ({ value, data }) => {
  if (typeof value === 'string' && value.length > 0) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
  if (typeof data?.title === 'string') {
    return data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }
  return value
}

export const PROJECT_TYPES = [
  { label: 'Mechatronics', value: 'mechatronics' },
  { label: 'Structural', value: 'structural' },
  { label: 'Software', value: 'software' },
  { label: 'Content', value: 'content' },
] as const

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'date', '_status'],
    description: 'One entry per project. Save as draft while writing; publish when ready.',
  },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL path, e.g. "card-sorter". Auto-generated from the title if left blank.',
      },
      hooks: {
        beforeValidate: [formatSlug],
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [...PROJECT_TYPES],
      admin: {
        position: 'sidebar',
        description: 'Primary discipline — used for filtering on the projects page.',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        position: 'sidebar',
        description: 'Freeform tags, e.g. SOLIDWORKS, OpenCV, CSA S16.',
      },
    },
    {
      name: 'date',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Completion (or last major update) date. Newest projects list first.',
        date: { pickerAppearance: 'monthOnly', displayFormat: 'MMM yyyy' },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Featured projects appear on the home page.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: {
        description: 'One or two sentences shown on the project card.',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Card image. Landscape works best (roughly 3:2).',
      },
    },
    {
      name: 'sections',
      type: 'array',
      labels: { singular: 'Section', plural: 'Sections' },
      admin: {
        description:
          'The project story, one section at a time — e.g. Problem, Approach, Key decisions, Challenges, Results.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          required: true,
        },
        {
          name: 'content',
          type: 'richText',
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          admin: {
            description: 'Images or videos shown below this section’s text.',
          },
        },
      ],
    },
    {
      name: 'links',
      type: 'array',
      labels: { singular: 'Link', plural: 'Links' },
      admin: {
        description: 'External links — GitHub repo, live demo, write-up, video.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
