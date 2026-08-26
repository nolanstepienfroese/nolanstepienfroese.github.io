import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { ProjectsBrowser } from '@/components/ProjectsBrowser'

export const metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  const payload = await getPayload({ config: await config })
  // The local API bypasses access control, so drafts must be excluded explicitly
  const result = await payload.find({
    collection: 'projects',
    where: { _status: { equals: 'published' } },
    sort: '-date',
    limit: 100,
  })

  return (
    <section className="section">
      <div className="container">
        <span className="mono-label mono-label--accent">Index</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.7rem)', marginTop: '0.5rem' }}>Projects</h1>

        {/* Every published project is prerendered here; the browser filters. */}
        <ProjectsBrowser projects={result.docs} />
      </div>
    </section>
  )
}
