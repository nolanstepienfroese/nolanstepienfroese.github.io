import Link from 'next/link'
import React from 'react'

import type { Project } from '@/payload-types'
import { mediaUrl, asMedia } from '@/lib/media'

const TYPE_LABELS: Record<string, string> = {
  mechanical: 'Mechanical',
  mechatronics: 'Mechatronics',
  structural: 'Structural',
  software: 'Software',
  content: 'Content',
}

function initials(title: string): string {
  return title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function ProjectCard({ project }: { project: Project }) {
  const thumb = asMedia(project.thumbnail)
  const thumbSrc = mediaUrl(project.thumbnail, 'card')
  const year = project.date ? new Date(project.date).getFullYear() : null

  return (
    <Link className="project-card" href={`/projects/${project.slug}`}>
      {thumbSrc ? (
        <div className="card-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={thumb?.alt ?? project.title} src={thumbSrc} loading="lazy" />
        </div>
      ) : (
        <div className="card-thumb card-thumb--placeholder" aria-hidden="true">
          {initials(project.title)}
        </div>
      )}
      <div className="card-body">
        <div className="card-meta">
          <span className="mono-label mono-label--accent">
            {TYPE_LABELS[project.type] ?? project.type}
          </span>
          {year && <span className="mono-label">{year}</span>}
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        {project.tags && project.tags.length > 0 && (
          <div className="tag-row">
            {project.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
