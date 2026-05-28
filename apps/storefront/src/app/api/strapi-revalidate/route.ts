import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Strapi webhook → revalidate Next ISR tags.
// Configure in Strapi admin: Settings → Webhooks → Add new
//   URL:    https://<storefront-host>/api/strapi-revalidate?secret=<STRAPI_WEBHOOK_REVALIDATION_SECRET>
//   Events: entry.publish, entry.unpublish, entry.update, entry.delete
//
// Body shape (Strapi 5):
//   { model: 'about' | 'blog-post' | 'lookbook-entry' | 'homepage-section' | 'legal-page',
//     entry: { slug?: string, ... }, event: 'entry.publish' | ... }

const MODEL_TAGS: Record<string, (slug?: string) => string[]> = {
  about: () => ['about'],
  'blog-post': (slug) =>
    slug ? ['blog-posts', `blog-post:${slug}`] : ['blog-posts'],
  'lookbook-entry': (slug) =>
    slug ? ['lookbook-entries', `lookbook-entry:${slug}`] : ['lookbook-entries'],
  'homepage-section': () => ['homepage-sections'],
  'legal-page': (slug) => (slug ? [`legal-page:${slug}`] : []),

  // Legacy Solace content types — kept for backwards compat with the existing
  // /api/data/fetch.ts client. Will be removed once that file is retired.
  blog: (slug) => (slug ? [`blog-${slug}`, 'blog'] : ['blog']),
  'blog-post-category': () => [
    'blog',
    'explore-blog',
    'blog-categories',
    'blog-slugs',
  ],
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.STRAPI_WEBHOOK_REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const model: string | undefined = body?.model
  const slug: string | undefined = body?.entry?.slug ?? body?.entry?.Slug

  if (!model || !MODEL_TAGS[model]) {
    return NextResponse.json({ message: 'No revalidation needed', model })
  }

  const tags = MODEL_TAGS[model](slug)
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 })
  }

  return NextResponse.json({ revalidated: true, tags, now: Date.now() })
}
