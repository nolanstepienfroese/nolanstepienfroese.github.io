import React from 'react'

import type { Resume } from '@/payload-types'

type Entry = NonNullable<Resume['experience']>[number]

function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li className="timeline-entry" key={entry.id}>
          <span className="mono-label mono-label--accent">{entry.dates}</span>
          <h3>{entry.title}</h3>
          <p className="timeline-org">
            {entry.organization}
            {entry.location && ` · ${entry.location}`}
          </p>
          {entry.highlights && entry.highlights.length > 0 && (
            <ul>
              {entry.highlights.map((highlight) => (
                <li key={highlight.id}>{highlight.text}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  )
}

function Group({ label, entries }: { label: string; entries: Entry[] }) {
  if (entries.length === 0) return null
  return (
    <div className="resume-group">
      <div className="section-head">
        <span className="mono-label">{label}</span>
      </div>
      <Timeline entries={entries} />
    </div>
  )
}

/**
 * Experience on the left; education and awards on the right. Empty groups are
 * left out, and the whole section disappears if the résumé has no entries.
 */
export function ResumeSection({ resume }: { resume: Resume }) {
  const experience = resume.experience ?? []
  const education = resume.education ?? []
  const awards = resume.awards ?? []

  if (experience.length + education.length + awards.length === 0) return null

  return (
    <section className="section" id="experience">
      <div className="container">
        <div className="resume-layout">
          {experience.length > 0 && (
            <div>
              <Group entries={experience} label="Experience" />
            </div>
          )}
          {education.length + awards.length > 0 && (
            <div>
              <Group entries={education} label="Education" />
              <Group entries={awards} label="Awards" />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
