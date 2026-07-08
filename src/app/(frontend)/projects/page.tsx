import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ProjectCard } from '@/components/ProjectCard'
import { PROJECT_TYPES } from '@/collections/Projects'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Projects',
}

type Props = {
  searchParams: Promise<{ type?: string }>
}

export default async function ProjectsPage({ searchParams }: Props) {
  const { type } = await searchParams
  const activeType = PROJECT_TYPES.some((t) => t.value === type) ? type : undefined

  const payload = await getPayload({ config: await config })
  // The local API bypasses access control, so drafts must be excluded explicitly
  const result = await payload.find({
    collection: 'projects',
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(activeType ? [{ type: { equals: activeType } }] : []),
      ],
    },
    sort: '-date',
    limit: 100,
  })

  return (
    <section className="section">
      <div className="container">
        <span className="mono-label mono-label--accent">Index</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.7rem)', marginTop: '0.5rem' }}>Projects</h1>

        <div className="filter-row">
          <Link aria-current={!activeType} className="filter-chip" href="/projects">
            All
          </Link>
          {PROJECT_TYPES.map((t) => (
            <Link
              aria-current={activeType === t.value}
              className="filter-chip"
              href={`/projects?type=${t.value}`}
              key={t.value}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {result.docs.length > 0 ? (
          <div className="project-grid">
            {result.docs.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {activeType
              ? 'No published projects of this type yet.'
              : 'No published projects yet — add one in the admin panel.'}
          </div>
        )}
      </div>
    </section>
  )
}
