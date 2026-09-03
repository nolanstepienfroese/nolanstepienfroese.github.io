import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Name, tagline, and contact links shown across the site.',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Nolan',
    },
    {
      name: 'tagline',
      type: 'text',
      admin: {
        description:
          'One-line positioning statement for the hero, e.g. "Mechanical engineering student · mechatronics maker · structural EIT".',
      },
    },
    {
      name: 'heroIntro',
      type: 'textarea',
      admin: {
        description: 'A short paragraph under the tagline on the home page.',
      },
    },
    {
      name: 'heroPortrait',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Optional headshot shown to the right of the intro on the home page. Displayed 212px wide, so upload at least 425px wide for a sharp result on high-DPI screens.',
      },
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'socials',
      type: 'array',
      labels: { singular: 'Social link', plural: 'Social links' },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
