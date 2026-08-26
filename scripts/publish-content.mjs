/**
 * Builds `content.db` — the publishable copy of the site database.
 *
 * `portfolio.db` contains the Payload `users` row: admin email, password hash,
 * salt and reset token. `content.db` is committed to a public repo, so those
 * must not merely be deleted — a plain DELETE leaves the old bytes readable in
 * the file's free pages. Instead every copy step goes through `VACUUM INTO`,
 * which writes a fresh file from live rows only, so purged data is never
 * carried across. The result is then byte-scanned to prove it.
 *
 * Usage: npm run publish:content
 */
import { DatabaseSync } from 'node:sqlite'
import { existsSync, readFileSync, rmSync } from 'node:fs'
import path from 'node:path'

const SOURCE = path.resolve('portfolio.db')
const OUTPUT = path.resolve('content.db')
const STAGING = path.resolve('content.db.staging')

// Emptied in the published copy: credentials, sessions, and admin-UI state
// that references the user. Order matters — children before parents.
const PURGE = [
  'users_sessions',
  'users',
  'payload_preferences_rels',
  'payload_preferences',
  'payload_locked_documents_rels',
  'payload_locked_documents',
  'payload_kv',
]

// Must survive the purge, or the built site would be empty.
const CONTENT = ['projects', 'media', 'site_settings', 'about']

const fail = (msg) => {
  console.error(`\n  publish:content FAILED — ${msg}\n`)
  process.exit(1)
}

if (!existsSync(SOURCE)) fail(`${SOURCE} not found. Run \`npm run dev\` and add content first.`)

for (const leftover of [STAGING, `${STAGING}-wal`, `${STAGING}-shm`]) {
  rmSync(leftover, { force: true })
}

// ---------------------------------------------------------------- 1. snapshot
// VACUUM INTO (not copyFile) so any pending WAL content is folded in and the
// staging file starts clean.
const source = new DatabaseSync(SOURCE)

/** Values that must not appear anywhere in the published file. */
const secrets = []
const userCols = source
  .prepare(`pragma table_info(users)`)
  .all()
  .map((c) => c.name)

for (const row of source.prepare('select * from users').all()) {
  for (const col of ['email', 'hash', 'salt', 'reset_password_token']) {
    if (userCols.includes(col) && typeof row[col] === 'string' && row[col].length > 0) {
      secrets.push({ column: col, value: row[col] })
    }
  }
}

const expected = Object.fromEntries(
  CONTENT.map((t) => [t, source.prepare(`select count(*) as n from ${t}`).get().n]),
)

source.exec(`vacuum into '${STAGING.replace(/'/g, "''")}'`)
source.close()

// ------------------------------------------------------------------ 2. purge
const staging = new DatabaseSync(STAGING)
const staged = staging
  .prepare("select name from sqlite_master where type='table'")
  .all()
  .map((r) => r.name)

let purged = 0
staging.exec('begin')
for (const table of PURGE) {
  if (!staged.includes(table)) continue // table may not exist in older schemas
  const { n } = staging.prepare(`select count(*) as n from ${table}`).get()
  staging.exec(`delete from ${table}`)
  purged += n
}
staging.exec('commit')

// Second VACUUM INTO: the final file is rebuilt from what remains, so the
// purged rows have no representation in it at all.
rmSync(OUTPUT, { force: true })
staging.exec(`vacuum into '${OUTPUT.replace(/'/g, "''")}'`)
staging.close()

for (const leftover of [STAGING, `${STAGING}-wal`, `${STAGING}-shm`]) {
  rmSync(leftover, { force: true })
}

// ----------------------------------------------------------------- 3. verify
const check = new DatabaseSync(OUTPUT, { readOnly: true })

for (const table of PURGE) {
  if (!staged.includes(table)) continue
  const { n } = check.prepare(`select count(*) as n from ${table}`).get()
  if (n !== 0) fail(`${table} still has ${n} row(s) after purge`)
}

for (const [table, want] of Object.entries(expected)) {
  const { n } = check.prepare(`select count(*) as n from ${table}`).get()
  if (n !== want) fail(`${table} lost rows in copy (${want} -> ${n})`)
}
check.close()

// The real test: no secret survives anywhere in the raw bytes, including any
// free pages, overflow pages or stale journal content.
const bytes = readFileSync(OUTPUT)
for (const { column, value } of secrets) {
  if (bytes.includes(Buffer.from(value, 'utf8'))) {
    fail(`users.${column} is still present in the raw bytes of ${path.basename(OUTPUT)}`)
  }
}

// Drafts never render on the site, but they do sit inside the committed file,
// which is readable by anyone in a public repo. Warn rather than delete: which
// unfinished work is safe to publish is the author's call, not this script's.
const drafts = []
const inspect = new DatabaseSync(OUTPUT, { readOnly: true })
for (const table of ['projects', '_projects_v']) {
  const cols = inspect.prepare(`pragma table_info(${table})`).all().map((c) => c.name)
  const statusCol = cols.find((c) => c === '_status' || c.endsWith('_status'))
  const titleCol = cols.find((c) => c === 'title' || c.endsWith('_title'))
  if (!statusCol) continue
  const rows = inspect
    .prepare(
      `select ${titleCol ?? statusCol} as label from ${table} ` +
        `where ${statusCol} is not null and ${statusCol} <> 'published'`,
    )
    .all()
  for (const r of rows) drafts.push(`${r.label} (${table})`)
}
inspect.close()

const kb = (bytes.length / 1024).toFixed(0)
console.log(`\n  content.db written — ${kb} KB`)
console.log(`  purged ${purged} row(s) across ${PURGE.length} table(s)`)
console.log(`  verified ${secrets.length} credential value(s) absent from raw bytes`)
console.log(`  content intact: ${Object.entries(expected).map(([t, n]) => `${t} ${n}`).join(', ')}`)

if (drafts.length > 0) {
  console.log(
    `\n  NOTE: ${drafts.length} unpublished draft(s) are inside content.db.\n` +
      `  They will not appear on the site, but anyone can read them in a public repo:\n` +
      drafts.map((d) => `    - ${d}`).join('\n') +
      `\n  Delete them in /admin first if that matters.`,
  )
}
console.log('')
