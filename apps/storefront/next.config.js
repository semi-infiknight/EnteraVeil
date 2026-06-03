const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output keeps the runner image small (~180 MB).
  // The Dockerfile runner stage COPYs from .next/standalone/.
  output: 'standalone',

  // Help Next trace deps from the pnpm workspace root.
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // CI gates: typecheck + lint are run as separate jobs (and as part
  // of pre-commit). Don't block the production build for them — they
  // already passed before this commit landed.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

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
