import { notFound } from 'next/navigation'

import { getAllBlogSlugs, getBlogPostBySlug } from '@lib/data/fetch'
import { listRegions } from '@lib/data/regions'
import { StoreRegion } from '@medusajs/types'
import BlogPostTemplate from '@modules/blog/templates/blogPostTemplate'

export async function generateStaticParams() {
  // Strapi may be offline — treat any failure as "no slugs".
  const slugs = await getAllBlogSlugs().catch(() => [] as string[])
  if (!slugs?.length) return []

  const countryCodes = await listRegions()
    .then((regions: StoreRegion[]) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )
    .catch(() => [] as string[])
  if (!countryCodes?.length) return []

  return slugs.flatMap((slug) =>
    (countryCodes as string[]).filter(Boolean).map((countryCode) => ({
      slug,
      countryCode,
    }))
  )
}

export async function generateMetadata(props) {
  const params = await props.params
  const article = await getBlogPostBySlug(params.slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.Title,
  }
}

export default async function BlogPost(props: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const params = await props.params
  const { slug, countryCode } = params
  const article = await getBlogPostBySlug(slug)

  if (!article) {
    notFound()
  }

  return <BlogPostTemplate article={article} countryCode={countryCode} />
}
