import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

// GitHub Pages serves static files only, so the deploy build exports plain HTML
// instead of a Node server. Everything else (npm run dev, the Docker image, and
// therefore the /admin panel) is unaffected — those leave STATIC_EXPORT unset.
const isStaticExport = process.env.STATIC_EXPORT === 'true'

// A GitHub *project* repo is served from a subdirectory —
// https://<user>.github.io/<repo>/ — so every path needs that prefix. A repo
// named <user>.github.io is served from the root and needs no prefix at all.
// scripts/build-static.mjs works this out from GITHUB_REPOSITORY in CI, so the
// site keeps working if the repo is ever renamed. Normalised here to either ''
// or '/name' (leading slash, no trailing slash), which is what Next expects.
const rawBasePath = isStaticExport ? (process.env.BASE_PATH ?? '') : ''
const basePath = rawBasePath === '' || rawBasePath === '/' ? '' : `/${rawBasePath.replace(/^\/+|\/+$/g, '')}`

const nextConfig: NextConfig = {
  output: isStaticExport ? 'export' : 'standalone',
  basePath,
  // Next rewrites <Link> and its own assets, but not raw strings such as the
  // upload URLs Payload stores in the database. Exposing the value to the
  // bundle lets lib/media.ts prefix those consistently on server and client.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // Pages has no rewrite layer, so emit `projects/index.html` rather than
  // `projects.html` — the form every static host resolves the same way.
  trailingSlash: isStaticExport,
  images: isStaticExport
    ? // No server means no on-demand image optimizer. The site uses plain <img>
      // tags with Payload's pre-generated sizes, so nothing is lost here.
      { unoptimized: true }
    : {
        localPatterns: [
          {
            pathname: '/api/media/file/**',
          },
        ],
      },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
