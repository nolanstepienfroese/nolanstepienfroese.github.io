'use client'

import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import type { Project } from '@/payload-types'
import { ProjectCard } from '@/components/ProjectCard'
import { PROJECT_TYPES } from '@/collections/Projects'

const isListedType = (types: readonly { value: string }[], value: string | null): value is string =>
  types.some((t) => t.value === value)

/**
 * Filter chips for the projects index.
 *
 * Only types with a published project get a chip, and the row stays hidden
 * until there are at least two to choose between. A type reappears on its own
 * once a project of that type is published.
 *
 * The site is statically exported, so there is no server to read `?type=` from
 * the request — the filtering happens in the browser instead.
 *
 * Deliberately NOT `useSearchParams()`: that opts the whole subtree out of
 * prerendering, which would ship a projects page whose HTML contained no
 * projects (bad for search engines, and a visible flash of empty state). By
 * starting with no filter and reading the URL in an effect, the prerendered
 * HTML holds every published project and the browser only ever hides some.
 */
export function ProjectsBrowser({ projects }: { projects: Project[] }) {
  const [activeType, setActiveType] = useState<string | undefined>(undefined)
  const types = useMemo(
    () => PROJECT_TYPES.filter((t) => projects.some((p) => p.type === t.value)),
    [projects],
  )

  // Runs after hydration, so the server and first client render agree.
  // A link to a type with nothing published falls back to showing everything.
  useEffect(() => {
    const readUrl = () => {
      const type = new URLSearchParams(window.location.search).get('type')
      setActiveType(isListedType(types, type) ? type : undefined)
    }
    readUrl()
    // Keep the chips in sync with the browser's back/forward buttons.
    window.addEventListener('popstate', readUrl)
    return () => window.removeEventListener('popstate', readUrl)
  }, [types])

  const select = useCallback((event: React.MouseEvent<HTMLAnchorElement>, value?: string) => {
    // Let modified clicks (new tab, new window) behave as real navigations —
    // the target URL renders correctly on its own, so nothing is lost.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    // Next's Link checks defaultPrevented and skips its own navigation, so the
    // filter stays on the current page instead of re-fetching a route.
    event.preventDefault()
    setActiveType(value)
    window.history.pushState(null, '', value ? `?type=${value}` : window.location.pathname)
  }, [])

  const visible = activeType ? projects.filter((p) => p.type === activeType) : projects

  return (
    <>
      {types.length > 1 && (
        <div className="filter-row">
          <Link
            aria-current={!activeType}
            className="filter-chip"
            href="/projects"
            onClick={(e) => select(e, undefined)}
          >
            All
          </Link>
          {types.map((t) => (
            <Link
              aria-current={activeType === t.value}
              className="filter-chip"
              href={`/projects?type=${t.value}`}
              key={t.value}
              onClick={(e) => select(e, t.value)}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      <div className="project-results">
        {visible.length > 0 ? (
          <div className="project-grid">
            {visible.map((project) => (
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
    </>
  )
}
