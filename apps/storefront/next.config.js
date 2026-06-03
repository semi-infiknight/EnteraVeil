/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output was attempted but failed in the Docker build
  // because pnpm workspace traversal + Next 16's file tracing don't
  // play nicely together in CI. Falling back to a full .next + prod
  // node_modules ship (Dockerfile copies both). Image is ~600 MB
  // instead of ~180 MB — acceptable trade.

  // CI typecheck + lint run as separate jobs.
  // (Next 16 dropped the eslint config key; use `next lint` standalone.)
  typescript: {
    ignoreBuildErrors: true,
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
