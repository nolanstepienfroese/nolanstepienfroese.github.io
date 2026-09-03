import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ProjectCard } from '@/components/ProjectCard'
import { mediaImage } from '@/lib/media'

export default async function HomePage() {
  const payload = await getPayload({ config: await config })

  const settings = await payload.findGlobal({ slug: 'site-settings' })

  // Rendered 212px wide. Prefers the 640px variant; a portrait narrower than
  // that has none generated, and mediaImage falls back to the original file.
  const portrait = mediaImage(settings.heroPortrait, 'thumbnail')

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
          <div className="hero-layout">
            <div className="hero-copy">
              <span className="mono-label mono-label--accent">Portfolio</span>
              <h1>{settings.siteName || 'Your Name'}</h1>
              {settings.tagline && <p className="tagline">{settings.tagline}</p>}
              {settings.heroIntro && <p className="intro">{settings.heroIntro}</p>}
              <Link className="hero-cta" href="/projects">
                View projects →
              </Link>
            </div>

            {portrait && (
              <div className="hero-portrait">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={portrait.alt}
                  height={portrait.height ?? undefined}
                  src={portrait.src}
                  width={portrait.width ?? undefined}
                />
              </div>
            )}
          </div>
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
