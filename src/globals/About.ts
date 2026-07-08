import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Page',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      admin: {
        description: 'Heading at the top of the About page.',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'bio',
      type: 'richText',
      admin: {
        description: 'Your background, path, and maker philosophy.',
      },
    },
    {
      name: 'skillGroups',
      type: 'array',
      labels: { singular: 'Skill group', plural: 'Skill groups' },
      admin: {
        description: 'Grouped skills, e.g. "CAD" → SOLIDWORKS; "Analysis" → SAP2000; "Codes" → CSA S16, A23.3, O86.',
      },
      fields: [
        { name: 'group', type: 'text', required: true },
        { name: 'skills', type: 'text', hasMany: true, required: true },
      ],
    },
  ],
}
