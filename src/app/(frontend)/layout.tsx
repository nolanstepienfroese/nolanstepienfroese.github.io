import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export const metadata = {
  title: 'Portfolio',
  description: 'Mechanical engineering, mechatronics, and structural projects.',
  icons: { icon: '/favicon.svg' },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const payload = await getPayload({ config: await config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })

  const siteName = settings.siteName || 'Portfolio'
  const year = new Date().getFullYear()

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link className="wordmark" href="/">
              {siteName}
              <span>_</span>
            </Link>
            <nav className="site-nav">
              <Link href="/projects">Projects</Link>
              <Link href="/about">About</Link>
              <a href="#contact">Contact</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer" id="contact">
          <div className="container">
            <div className="title-block">
              <div>
                <span className="mono-label">Name</span>
                <p>{siteName}</p>
                {settings.tagline && <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>{settings.tagline}</p>}
              </div>
              <div>
                <span className="mono-label">Contact</span>
                {settings.email ? (
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                ) : (
                  <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                    Set an email in Site Settings
                  </p>
                )}
              </div>
              <div>
                <span className="mono-label">Elsewhere</span>
                <ul>
                  {(settings.socials ?? []).map((social) => (
                    <li key={social.id}>
                      <a href={social.url} rel="noopener noreferrer" target="_blank">
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-colophon">
            <span className="mono-label">
              {siteName} · Rev {year}
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
