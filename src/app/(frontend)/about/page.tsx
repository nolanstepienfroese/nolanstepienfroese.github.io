import { RichText } from '@payloadcms/richtext-lexical/react'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { asMedia, mediaUrl } from '@/lib/media'

export const metadata = {
  title: 'About',
}

export default async function AboutPage() {
  const payload = await getPayload({ config: await config })
  const about = await payload.findGlobal({ slug: 'about' })

  const photo = asMedia(about.photo)
  const photoSrc = mediaUrl(about.photo, 'card')

  return (
    <section className="about-page">
      <div className="container">
        <span className="mono-label mono-label--accent">About</span>
        <h1>{about.headline || 'About'}</h1>

        <div className="about-layout">
          <div>
            {about.bio ? (
              <RichText className="rich-text" data={about.bio} />
            ) : (
              <div className="empty-state">
                Write your bio in the admin panel under Globals → About Page.
              </div>
            )}

            {about.skillGroups && about.skillGroups.length > 0 && (
              <div className="skill-groups">
                {about.skillGroups.map((group) => (
                  <div className="skill-group" key={group.id}>
                    <span className="mono-label">{group.group}</span>
                    <ul>
                      {group.skills.map((skill) => (
                        <li className="tag" key={skill}>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {photoSrc && (
            <div className="about-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={photo?.alt ?? 'Portrait'} src={photoSrc} />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
