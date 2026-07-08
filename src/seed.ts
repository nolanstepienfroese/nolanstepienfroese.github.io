/**
 * Seeds sample content so the site renders meaningfully on first run.
 * Run with: npm run seed
 * Skips if any projects already exist. All text is placeholder — edit it in /admin.
 */
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '@payload-config'

function richText(...paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal' as const,
            style: '',
            text,
            version: 1,
          },
        ],
      })),
    },
  }
}

async function placeholderPng(label: string): Promise<Buffer> {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
    <rect width="1200" height="800" fill="#fafaf7"/>
    <g stroke="#e0e1da" stroke-width="1">
      ${Array.from({ length: 30 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="800"/>`).join('')}
      ${Array.from({ length: 20 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="1200" y2="${i * 40}"/>`).join('')}
    </g>
    <rect x="40" y="40" width="1120" height="720" fill="none" stroke="#191b1f" stroke-width="2"/>
    <text x="80" y="420" font-family="monospace" font-size="64" fill="#191b1f" font-weight="bold">${label}</text>
    <text x="80" y="480" font-family="monospace" font-size="28" fill="#d84a05">PLACEHOLDER — REPLACE IN ADMIN</text>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function run() {
  const payload = await getPayload({ config })

  const existing = await payload.count({ collection: 'projects' })
  if (existing.totalDocs > 0) {
    payload.logger.info('Projects already exist — skipping seed.')
    process.exit(0)
  }

  payload.logger.info('Seeding sample content...')

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Nolan',
      tagline: 'Mechanical engineering student · mechatronics maker · structural EIT',
      heroIntro:
        'I design and build things that move — from a machine that sorts playing cards to browser-based structural analysis tools. This is placeholder text: edit it in the admin panel under Globals → Site Settings.',
    },
  })

  await payload.updateGlobal({
    slug: 'about',
    data: {
      headline: 'Engineer & maker',
      bio: richText(
        'This is placeholder bio text — replace it in the admin panel under Globals → About Page.',
        'Talk about your UBC Mech Eng path, your work as a junior engineer, and how personal projects feed your professional tools.',
      ),
      skillGroups: [
        { group: 'CAD', skills: ['SOLIDWORKS'] },
        { group: 'Analysis', skills: ['SAP2000', 'FEA'] },
        { group: 'Codes', skills: ['CSA S16', 'CSA A23.3', 'CSA O86'] },
        { group: 'Programming', skills: ['TypeScript', 'React', 'Python'] },
        { group: 'Fabrication', skills: ['3D printing', 'Machining'] },
      ],
    },
  })

  const sorterThumb = await payload.create({
    collection: 'media',
    data: { alt: 'Placeholder thumbnail for the card sorter project' },
    file: {
      data: await placeholderPng('CARD SORTER'),
      mimetype: 'image/png',
      name: 'card-sorter-placeholder.png',
      size: 0,
    },
  })

  const mechabacusThumb = await payload.create({
    collection: 'media',
    data: { alt: 'Placeholder thumbnail for the MechAbacus project' },
    file: {
      data: await placeholderPng('MECHABACUS'),
      mimetype: 'image/png',
      name: 'mechabacus-placeholder.png',
      size: 0,
    },
  })

  await payload.create({
    collection: 'projects',
    data: {
      title: 'Playing Card Sorter',
      slug: 'card-sorter',
      type: 'mechatronics',
      tags: ['Computer vision', 'Stepper motors', '3D printing'],
      date: '2026-06-01',
      featured: true,
      summary:
        'A machine that feeds, recognizes, and sorts playing cards — spring-loaded feeder, vision pipeline, and sorting logic. (Placeholder — edit in admin.)',
      thumbnail: sorterThumb.id,
      _status: 'published',
      sections: [
        {
          heading: 'Problem',
          content: richText(
            'Placeholder: describe why you built it and what the machine needs to do — feed one card at a time, identify it reliably, and route it to the right bin.',
          ),
        },
        {
          heading: 'Approach',
          content: richText(
            'Placeholder: the spring feeder design, the vision pipeline, the sorting mechanism — each of these deserves its own paragraph and a photo or clip.',
          ),
        },
        {
          heading: 'Results',
          content: richText(
            'Placeholder: sorting speed, recognition accuracy, what you would change next.',
          ),
        },
      ],
    },
  })

  await payload.create({
    collection: 'projects',
    data: {
      title: 'MechAbacus',
      slug: 'mechabacus',
      type: 'software',
      tags: ['React', 'TypeScript', 'FEA'],
      date: '2026-07-01',
      featured: true,
      summary:
        'A browser-based engineering toolbox: 2-D truss and frame FEA with a direct stiffness solver, plus electromagnetics and controls modules. (Placeholder — edit in admin.)',
      thumbnail: mechabacusThumb.id,
      _status: 'published',
      sections: [
        {
          heading: 'Problem',
          content: richText(
            'Placeholder: why hand calcs and heavyweight desktop tools both fall short for quick structural checks, and what a browser-native tool solves.',
          ),
        },
        {
          heading: 'Approach',
          content: richText(
            'Placeholder: the direct stiffness method implementation, the diagram rendering, module architecture.',
          ),
        },
        {
          heading: 'Results',
          content: richText('Placeholder: what it can solve today and what is on the roadmap.'),
        },
      ],
    },
  })

  payload.logger.info('Seed complete. Create your admin user at /admin.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
