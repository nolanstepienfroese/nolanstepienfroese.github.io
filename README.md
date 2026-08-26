# Portfolio

Personal engineering portfolio — projects, about, and contact — with a built-in admin panel for adding content without touching code.

**Stack:** Next.js 16 + [Payload CMS 3](https://payloadcms.com) running inside the same app, SQLite database, media stored on local disk. One process, one Docker container, fully self-hosted.

## How content works

Everything on the site is editable at **`/admin`**:

- **Projects** — one entry per project: title, type (Mechatronics / Structural / Software / Content), tags, summary, thumbnail, story sections (Problem / Approach / Results, each with rich text and images/videos), and external links. Save as **draft** while writing; only **published** projects appear on the site. The `type` field drives the filter chips on the projects page; **featured** projects appear on the home page.
- **Media** — upload images and videos once, reuse anywhere. Images get resized variants automatically.
- **Globals → Site Settings** — name, tagline, hero intro, contact email, social links (footer).
- **Globals → About Page** — headline, photo, bio, skill groups.

Workflow after finishing a project: log into `/admin` → Projects → Create New → fill in the form, upload renders/photos/clips → Publish. Done.

## Local development

```bash
npm install
npm run seed      # optional: sample placeholder content (skips if projects exist)
npm run dev
```

Open http://localhost:3000 — visit `/admin` and follow the prompt to create your admin user on first run.

`.env` needs:

```
DATABASE_URL=file:./portfolio.db
PAYLOAD_SECRET=<long random string — regenerate for production>
```

After changing collections/globals in `src/collections` or `src/globals`, run `npm run generate:types`.

## Checks

```bash
npm run build         # production build + TypeScript
npm run build:static  # the static export that GitHub Pages actually serves
npm run lint
npm run test:int      # Payload integration test (vitest)
npm run test:e2e      # Playwright — needs `npx playwright install` and a running dev server
```

## Publishing to GitHub Pages

The live site is a **static export** hosted free on GitHub Pages. Pages only serves
files — it cannot run the admin panel or the REST API, both of which need a live
server. So the admin panel is **local-only**: you edit content on your machine, and
a GitHub Actions workflow bakes the result into plain HTML.

### Publishing a content change

```bash
npm run dev                 # edit at localhost:3000/admin, publish your project
npm run publish:content     # regenerate content.db from portfolio.db
git add -A && git commit -m "Add project X" && git push
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and
deploys it. It takes about two minutes; watch it in the repo's **Actions** tab. If the
build fails the live site is left untouched, still serving the last good version.

### The two databases

| file | contains | committed? |
| --- | --- | --- |
| `portfolio.db` | your content **and** the admin user (email, password hash, salt) | **no** — gitignored |
| `content.db` | the same content with every user row removed | **yes** — this is what Actions builds from |

`npm run publish:content` derives the second from the first. It copies via SQLite's
`VACUUM INTO` rather than deleting rows, because a plain `DELETE` leaves the old bytes
readable in the file's free pages — then it scans the raw bytes to confirm no
credential survived, and refuses to write the file if one did.

**Re-run `npm run publish:content` after every content change**, or the site will
deploy with stale content.

### Building the static site locally

```bash
npm run build:static        # writes out/
npx serve out               # or any static file server
```

`scripts/build-static.mjs` moves `src/app/(payload)` aside for the duration of the
build (it isn't statically exportable), copies `media/` to `/api/media/file/` so
Payload's upload URLs keep resolving, and writes `.nojekyll` so Pages serves the
`_next/` directory. The admin panel is restored afterwards, including on failure.

### One-time repo setup

The repo must be **public** (Pages needs a paid plan for private repos), and under
**Settings → Pages**, *Source* must be set to **GitHub Actions** — not "Deploy from a
branch".

## Deploying with a server instead (Docker)

Still supported, and the only option if you ever want the admin panel reachable online.
Needs a host with a **persistent disk** — the SQLite file and uploads live on disk, so
platforms with ephemeral filesystems (Vercel, Netlify) will discard your content.

```bash
docker compose up -d --build
```

The compose file builds the standalone image and mounts a named volume at `/data`
holding both the SQLite database and uploaded media. Set a strong `PAYLOAD_SECRET` in
`.env` before deploying.

**Backups:** everything lives in the `/data` volume — copy `portfolio.db*` and the
`media/` folder.

Note that the frontend pages are now prerendered at build time rather than rendered per
request, so a server deployment needs a rebuild to pick up content changes.

## Project layout

```
.github/workflows/
  deploy.yml       builds the static site and publishes it to GitHub Pages
scripts/
  publish-content.mjs  portfolio.db -> content.db, with user rows scrubbed
  build-static.mjs     static export into out/ (media + .nojekyll wiring)
src/
  collections/     Projects, Media, Users (admin schema)
  globals/         Site Settings, About Page
  app/(frontend)/  public site: home, /projects (+filter), /projects/[slug], /about
  app/(payload)/   admin panel + API (generated wiring)
  components/      ProjectCard, MediaFigure
  seed.ts          sample content (npm run seed)
```
