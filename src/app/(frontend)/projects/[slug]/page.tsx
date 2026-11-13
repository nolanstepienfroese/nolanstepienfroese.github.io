import { RichText } from '@payloadcms/richtext-lexical/react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { MediaFigure } from '@/components/MediaFigure'
import { asMedia } from '@/lib/media'

// Any slug not listed by generateStaticParams has no HTML file to serve, so
// fail the build rather than silently dropping a project from the site.
export const dynamicParams = false

const TYPE_LABELS: Record<string, string> = {
  mechanical: 'Mechanical',
  mechatronics: 'Mechatronics',
  structural: 'Structural',
  software: 'Software',
  content: 'Content',
}

type Props = {
  params: Promise<{ slug: string }>
}

async function getProject(slug: string) {
  const payload = await getPayload({ config: await config })
  // The local API bypasses access control, so drafts must be excluded explicitly
  const result = await payload.find({
    collection: 'projects',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
  })
  return result.docs[0] ?? null
}

// Enumerates the pages to pre-render at build time — one HTML file per
// published project. Drafts are excluded, so they never reach the public site.
export async function generateStaticParams() {
  const payload = await getPayload({ config: await config })
  const result = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    pagination: false,
    select: { slug: true },
  })

  return result.docs
    .map((doc) => doc.slug)
    .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.summary,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const date = project.date
    ? new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null

  return (
    <article className="project-page">
      <div className="container">
        <Link className="back-link" href="/projects">
          ← All projects
        </Link>

        <div className="project-meta">
          <span className="mono-label mono-label--accent">
            {TYPE_LABELS[project.type] ?? project.type}
          </span>
          {date && <span className="mono-label">{date}</span>}
          {(project.tags ?? []).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>

        <h1>{project.title}</h1>
        <p className="project-lede">{project.summary}</p>

        {project.links && project.links.length > 0 && (
          <div className="link-row">
            {project.links.map((link) => (
              <a
                className="link-button"
                href={link.url}
                key={link.id}
                rel="noopener noreferrer"
                target="_blank"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}

        {(project.sections ?? []).map((section, index) => {
          const media = (section.media ?? [])
            .map((item) => asMedia(item))
            .filter((item) => item !== null)

          return (
            <section className="project-section" key={section.id}>
              <div className="project-section-head">
                <span className="section-number">{String(index + 1).padStart(2, '0')}</span>
                <h2>{section.heading}</h2>
              </div>
              {section.content && <RichText className="rich-text" data={section.content} />}
              {media.length > 0 && (
                <div className={`media-grid${media.length > 1 ? ' media-grid--multi' : ''}`}>
                  {media.map((item) => (
                    <MediaFigure key={item.id} media={item} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </article>
  )
}
