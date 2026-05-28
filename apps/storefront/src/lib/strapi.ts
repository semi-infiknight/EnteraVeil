// Strapi 5 client for the EnteraVeil content types defined in apps/strapi.
// All functions return `null` if Strapi is unreachable or returns a non-2xx —
// the storefront should degrade gracefully when Strapi is down rather than
// throwing in a server component.

const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337'
const TOKEN =
  process.env.STRAPI_API_TOKEN ?? process.env.NEXT_PUBLIC_STRAPI_READ_TOKEN

type StrapiResponse<T> = {
  data: T
  meta?: unknown
} | null

async function strapiFetch<T>(
  endpoint: string,
  init?: RequestInit & { tags?: string[]; revalidate?: number }
): Promise<StrapiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`
  const headers: HeadersInit = {}
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

  try {
    const res = await fetch(url, {
      headers,
      ...init,
      next: {
        tags: init?.tags,
        revalidate: init?.revalidate ?? 60,
      },
    })
    if (!res.ok) {
      console.warn(`Strapi ${endpoint} → ${res.status}`)
      return null
    }
    return (await res.json()) as StrapiResponse<T>
  } catch (err: any) {
    console.warn(`Strapi ${endpoint} failed: ${err.message ?? err}`)
    return null
  }
}

// ---------- Domain types (lean — only fields the storefront renders) ----------

export type StrapiMedia = {
  id: number
  url: string
  alternativeText?: string | null
  width?: number
  height?: number
}

export type StrapiAbout = {
  id: number
  title: string
  body?: string | null
  hero_image?: StrapiMedia | null
}

export type StrapiBlogPost = {
  id: number
  documentId: string
  title: string
  slug: string
  body?: string | null
  author?: string | null
  tags?: string[] | null
  hero_image?: StrapiMedia | null
  publishedAt?: string
}

export type StrapiLookbookEntry = {
  id: number
  documentId: string
  title: string
  slug: string
  body?: string | null
  gallery?: StrapiMedia[]
  linked_product_skus?: string[]
}

export type StrapiHomepageSection = {
  id: number
  type: 'hero' | 'featured' | 'lookbook' | 'promo' | 'newsletter'
  title?: string | null
  body?: string | null
  image?: StrapiMedia | null
  cta_text?: string | null
  cta_url?: string | null
  sort_order: number
}

export type StrapiLegalPage = {
  id: number
  slug: string
  title: string
  body?: string | null
}

// ---------- Public API ----------

export async function getAbout() {
  const res = await strapiFetch<StrapiAbout>('/api/about?populate=*', {
    tags: ['about'],
  })
  return res?.data ?? null
}

export async function getBlogPosts() {
  const res = await strapiFetch<StrapiBlogPost[]>(
    '/api/blog-posts?populate=*&sort=publishedAt:desc',
    { tags: ['blog-posts'] }
  )
  return res?.data ?? []
}

export async function getBlogPostBySlug(slug: string) {
  const res = await strapiFetch<StrapiBlogPost[]>(
    `/api/blog-posts?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { tags: [`blog-post:${slug}`] }
  )
  return res?.data?.[0] ?? null
}

export async function getLookbookEntries() {
  const res = await strapiFetch<StrapiLookbookEntry[]>(
    '/api/lookbook-entries?populate=*&sort=publishedAt:desc',
    { tags: ['lookbook-entries'] }
  )
  return res?.data ?? []
}

export async function getLookbookEntryBySlug(slug: string) {
  const res = await strapiFetch<StrapiLookbookEntry[]>(
    `/api/lookbook-entries?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { tags: [`lookbook-entry:${slug}`] }
  )
  return res?.data?.[0] ?? null
}

export async function getHomepageSections() {
  const res = await strapiFetch<StrapiHomepageSection[]>(
    '/api/homepage-sections?populate=*&sort=sort_order:asc',
    { tags: ['homepage-sections'] }
  )
  return res?.data ?? []
}

export async function getLegalPage(slug: string) {
  const res = await strapiFetch<StrapiLegalPage[]>(
    `/api/legal-pages?filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { tags: [`legal-page:${slug}`] }
  )
  return res?.data?.[0] ?? null
}

export function strapiMediaUrl(media: StrapiMedia | null | undefined) {
  if (!media?.url) return null
  // Strapi stores absolute URLs when using S3-compatible storage; otherwise
  // they're relative to the Strapi host.
  return /^https?:\/\//.test(media.url) ? media.url : `${BASE_URL}${media.url}`
}
