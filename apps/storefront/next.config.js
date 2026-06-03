/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is required by apps/storefront/Dockerfile — the
  // runner stage COPYs from .next/standalone/ to keep the production
  // image small. Without this, `pnpm build` doesn't emit standalone/
  // and the Docker build fails.
  output: 'standalone',

  // The standalone output needs to know where the repo root is so it
  // can trace and include all workspace deps in the bundle. Required
  // for pnpm-workspaces.
  outputFileTracingRoot: require('path').join(__dirname, '../../'),

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'medusa-public-images.s3.eu-west-1.amazonaws.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
    ],
  },
}

module.exports = nextConfig
