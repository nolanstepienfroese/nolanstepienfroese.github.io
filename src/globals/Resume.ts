import type { Field, GlobalConfig } from 'payload'

// Experience, education and awards share one shape so the home page can
// render all three with the same markup.
const entryFields = (titleDescription: string, organizationDescription: string): Field[] => [
  {
    name: 'title',
    type: 'text',
    required: true,
    admin: { description: titleDescription },
  },
  {
    name: 'organization',
    type: 'text',
    required: true,
    admin: { description: organizationDescription },
  },
  {
    name: 'location',
    type: 'text',
    admin: { description: 'Optional, e.g. "Chilliwack, BC".' },
  },
  {
    name: 'dates',
    type: 'text',
    required: true,
    admin: {
      description: 'Shown exactly as typed, e.g. "May 2026 – Aug 2026", "Expected May 2029" or "2024".',
    },
  },
  {
    name: 'highlights',
    type: 'array',
    labels: { singular: 'Bullet', plural: 'Bullets' },
    fields: [{ name: 'text', type: 'textarea', required: true }],
  },
]

export const Resume: GlobalConfig = {
  slug: 'resume',
  label: 'Résumé',
  access: {
    read: () => true,
  },
  admin: {
    description:
      'Experience, education and awards shown on the home page, below the featured projects. Drag rows to reorder.',
  },
  fields: [
    {
      name: 'experience',
      type: 'array',
      labels: { singular: 'Position', plural: 'Experience' },
      fields: entryFields('Role, e.g. "Engineering Student".', 'Company, e.g. "Quantum Engineering Ltd.".'),
    },
    {
      name: 'education',
      type: 'array',
      labels: { singular: 'Program', plural: 'Education' },
      fields: entryFields(
        'Program, e.g. "Bachelor of Applied Science – Mechanical Engineering".',
        'School, e.g. "University of British Columbia".',
      ),
    },
    {
      name: 'awards',
      type: 'array',
      labels: { singular: 'Award', plural: 'Awards' },
      fields: entryFields('Award, e.g. "4th Place, National Competition".', 'Awarded by, e.g. "Skills Canada".'),
    },
  ],
}
