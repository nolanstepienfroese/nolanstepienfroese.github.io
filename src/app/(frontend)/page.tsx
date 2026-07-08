import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ProjectCard } from '@/components/ProjectCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const settings = await payload.findGlobal({ slug: 'site-settings' })

  // The local API bypasses access control, so drafts must be excluded explicitly
  const featured = await payload.find({
    collection: 'projects',
    where: {
      and: [{ featured: { equals: true } }, { _status: { equals: 'published' } }],
    },
    sort: '-date',
    limit: 6,
  })

  // Fall back to the latest projects if nothing is marked featured yet
  const projects =
    featured.docs.length > 0
      ? featured.docs
      : (
          await payload.find({
            collection: 'projects',
            where: { _status: { equals: 'published' } },
            sort: '-date',
            limit: 3,
          })
        ).docs

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="mono-label mono-label--accent">Portfolio</span>
          <h1>{settings.siteName || 'Your Name'}</h1>
          {settings.tagline && <p className="tagline">{settings.tagline}</p>}
          {settings.heroIntro && <p className="intro">{settings.heroIntro}</p>}
          <Link className="hero-cta" href="/projects">
            View projects →
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="mono-label">Featured projects</span>
            <Link href="/projects">All projects →</Link>
          </div>
          {projects.length > 0 ? (
            <div className="project-grid">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              No published projects yet — add one in the <Link href="/admin">admin panel</Link>.
            </div>
          )}
        </div>
      </section>
    </>
  )
}
