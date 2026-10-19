'use client'

import React, { useCallback, useEffect, useState } from 'react'

import type { ReferenceLetter } from '@/payload-types'

type Reference = NonNullable<ReferenceLetter['items']>[number]

const ADVANCE_MS = 5000

// The card adds its own curly quotes, so strip any the quote was pasted with.
const unquote = (text: string) => text.trim().replace(/^["“”]+|["“”]+$/g, '')

/**
 * Signed distance from the active slide, wrapped around the ends so the
 * active card has a neighbour on both sides (the last card sits to the left
 * of the first).
 */
function offsetFrom(active: number, index: number, count: number): number {
  const ahead = (index - active + count) % count
  return ahead > count / 2 ? ahead - count : ahead
}

/**
 * Reference-letter quotes with the active card centred and its neighbours
 * faded out on either side, looping in both directions.
 *
 * Every quote is in the prerendered HTML; the browser only moves the cards.
 * It advances on its own, except while the visitor is hovering over or has
 * focused inside it, or prefers reduced motion.
 */
export function ReferencesCarousel({ items }: { items: Reference[] }) {
  // `previous` lets a card that wraps from one side to the other skip the
  // slide animation instead of visibly crossing the row.
  const [{ active, previous }, setPosition] = useState({ active: 0, previous: 0 })
  // Tracked separately so moving the mouse away doesn't resume rotation while
  // keyboard focus is still inside, and vice versa.
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const paused = hovered || focused
  const count = items.length

  const move = useCallback(
    (to: (current: number) => number) =>
      setPosition((position) => ({
        active: (to(position.active) + count) % count,
        previous: position.active,
      })),
    [count],
  )

  // Keyed on `active` so a manual step restarts the countdown rather than
  // being overtaken by an advance that was already nearly due.
  useEffect(() => {
    if (count < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setTimeout(() => move((index) => index + 1), ADVANCE_MS)
    return () => window.clearTimeout(timer)
  }, [active, count, paused, move])

  if (count === 0) return null

  return (
    <section
      aria-label="References"
      aria-roledescription="carousel"
      className="references"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
      }}
      onFocus={() => setFocused(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="references-viewport">
        <div className="references-track">
          {items.map((item, index) => {
            const offset = offsetFrom(active, index, count)
            const jumped = Math.abs(offset - offsetFrom(previous, index, count)) > 1
            return (
              <div
                aria-hidden={offset !== 0}
                aria-label={`${index + 1} of ${count}`}
                aria-roledescription="slide"
                className="references-slide"
                data-jump={jumped || undefined}
                data-position={offset === 0 ? 'active' : Math.abs(offset) === 1 ? 'near' : 'far'}
                key={item.id ?? index}
                role="group"
                style={{ '--offset': offset } as React.CSSProperties}
              >
                <figure className="reference-card">
                  <blockquote>
                    <p>“{unquote(item.quote)}”</p>
                  </blockquote>
                  <figcaption>
                    <span className="reference-name">{item.name}</span>
                    {(item.role || item.organization) && (
                      <span className="reference-role">
                        {[item.role, item.organization].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </figcaption>
                </figure>
              </div>
            )
          })}
        </div>
      </div>

      {count > 1 && (
        <div className="references-controls">
          <button
            aria-label="Previous reference"
            className="references-arrow"
            onClick={() => move((index) => index - 1)}
            type="button"
          >
            ←
          </button>
          {items.map((item, index) => (
            <button
              aria-current={index === active}
              aria-label={`Show reference ${index + 1}`}
              className="references-dot"
              key={item.id ?? index}
              onClick={() => move(() => index)}
              type="button"
            />
          ))}
          <button
            aria-label="Next reference"
            className="references-arrow"
            onClick={() => move((index) => index + 1)}
            type="button"
          >
            →
          </button>
        </div>
      )}
    </section>
  )
}
