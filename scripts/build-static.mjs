/**
 * Builds the static site into `out/` for GitHub Pages.
 *
 * Three things have to happen that a plain `next build` won't do:
 *
 *  1. The Payload admin panel and REST API under `src/app/(payload)` cannot be
 *     statically exported — they need a running server. They are moved aside
 *     for the duration of the build and restored afterwards, so local `/admin`
 *     is untouched.
 *  2. Payload serves uploads from `/api/media/file/<name>`. With the API gone
 *     those URLs 404, so the media directory is copied to that exact path
 *     inside `out/` and the existing URLs keep resolving unchanged.
 *  3. GitHub Pages skips directories beginning with an underscore unless a
 *     `.nojekyll` marker is present — and Next puts every asset in `_next/`.
 *
 * Usage: npm run build:static
 */
import { execFileSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const ADMIN_SRC = path.resolve('src/app/(payload)')
// Parked outside src/app so Next's router never sees it. Leading dot keeps it
// out of the way; it is gitignored.
const ADMIN_PARKED = path.resolve('.payload-admin-parked')
const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR || 'media')
const OUT_DIR = path.resolve('out')
const DB_FILE = path.resolve('content.db')

const step = (msg) => console.log(`\n  → ${msg}`)

// If a previous run was killed mid-build, put the admin panel back first.
if (existsSync(ADMIN_PARKED)) {
  if (existsSync(ADMIN_SRC)) rmSync(ADMIN_PARKED, { recursive: true, force: true })
  else renameSync(ADMIN_PARKED, ADMIN_SRC)
}

if (!existsSync(DB_FILE)) {
  console.error(
    `\n  build:static FAILED — content.db not found.\n` +
      `  Run \`npm run publish:content\` first to generate it from portfolio.db.\n`,
  )
  process.exit(1)
}

let parked = false
try {
  if (existsSync(ADMIN_SRC)) {
    step('parking the admin panel and API (not statically exportable)')
    renameSync(ADMIN_SRC, ADMIN_PARKED)
    parked = true
  }

  step('running next build (static export)')
  rmSync(OUT_DIR, { recursive: true, force: true })
  execFileSync('npx', ['next', 'build'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      STATIC_EXPORT: 'true',
      DATABASE_URL: `file:${DB_FILE}`,
      // Only used to satisfy config validation; nothing is signed in a static build.
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || 'static-build-placeholder',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-deprecation --max-old-space-size=8000`.trim(),
    },
  })
} finally {
  // Always restore, even if the build threw — otherwise local /admin disappears.
  if (parked && existsSync(ADMIN_PARKED)) {
    renameSync(ADMIN_PARKED, ADMIN_SRC)
    step('admin panel restored')
  }
}

step('copying media to /api/media/file/')
const mediaOut = path.join(OUT_DIR, 'api', 'media', 'file')
mkdirSync(mediaOut, { recursive: true })
let mediaCount = 0
if (existsSync(MEDIA_DIR)) {
  for (const entry of readdirSync(MEDIA_DIR, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name.startsWith('.')) continue
    cpSync(path.join(MEDIA_DIR, entry.name), path.join(mediaOut, entry.name))
    mediaCount += 1
  }
}

step('writing .nojekyll')
writeFileSync(path.join(OUT_DIR, '.nojekyll'), '')

const pages = []
const walk = (dir, base = '') => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '_next' || rel.startsWith('api')) continue
      walk(path.join(dir, entry.name), rel)
    } else if (entry.name.endsWith('.html')) {
      pages.push(rel)
    }
  }
}
walk(OUT_DIR)

console.log(`\n  static site ready in out/`)
console.log(`  ${pages.length} page(s): ${pages.sort().join(', ')}`)
console.log(`  ${mediaCount} media file(s) copied\n`)
