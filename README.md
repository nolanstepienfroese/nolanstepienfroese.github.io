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
npm run build      # production build + TypeScript
npm run lint
npm run test:int   # Payload integration test (vitest)
npm run test:e2e   # Playwright — needs `npx playwright install` and a running dev server
```

## Deploying (Docker)

```bash
docker compose up -d --build
```

The compose file builds the standalone image and mounts a named volume at `/data` holding both the SQLite database and uploaded media. Set a strong `PAYLOAD_SECRET` in `.env` before deploying.

**Backups:** everything lives in the `/data` volume — copy `portfolio.db*` and the `media/` folder.

**Hosting options** (undecided as of scaffold):

- **Home server** — runs alongside existing containers; expose via reverse proxy or a Cloudflare Tunnel. Free, but the portfolio is down when the server is.
- **Small VPS (~$5/mo)** — same compose file, always up. Recommended once the site is on a resume.

## Project layout

```
src/
  collections/     Projects, Media, Users (admin schema)
  globals/         Site Settings, About Page
  app/(frontend)/  public site: home, /projects (+filter), /projects/[slug], /about
  app/(payload)/   admin panel + API (generated wiring)
  components/      ProjectCard, MediaFigure
  seed.ts          sample content (npm run seed)
```
