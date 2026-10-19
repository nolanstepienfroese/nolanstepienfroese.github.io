import type { GlobalConfig } from 'payload'

// Slug is not "references": that is an SQL keyword, and scripts/publish-content.mjs
// queries table names unquoted.
export const ReferenceLetters: GlobalConfig = {
  slug: 'reference-letters',
  label: 'References',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Quotes from reference letters, shown as a row of cards under the home page intro. Hidden until "Show on home page" is checked.',
  },
  fields: [
    {
      name: 'showOnSite',
      type: 'checkbox',
      label: 'Show on home page',
      defaultValue: false,
      admin: {
        description: 'Leave unchecked while the quotes are being collected. Nothing appears on the site until this is on.',
      },
    },
    {
      name: 'items',
      type: 'array',
      labels: { singular: 'Reference', plural: 'References' },
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          admin: {
            description: 'The excerpt to show. Quotation marks are added automatically.',
          },
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Who wrote the letter.' },
        },
        {
          name: 'role',
          type: 'text',
          admin: { description: 'Their title, e.g. "Project Engineer".' },
        },
        {
          name: 'organization',
          type: 'text',
          admin: { description: 'Where they work, e.g. "Quantum Engineering Ltd.".' },
        },
      ],
    },
  ],
}
