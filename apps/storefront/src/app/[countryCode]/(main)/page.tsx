import { Metadata } from 'next'

import { getCategoriesList } from '@lib/data/categories'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import {
  findHomepageSection,
  getHomepageSections,
} from '@lib/strapi'
import BrandQuote from '@modules/home/components/brand-quote'
import CmsHero from '@modules/home/components/cms-hero'
import CmsPromo from '@modules/home/components/cms-promo'
import FeaturedCategories from '@modules/home/components/featured-categories'
import HeroFallback from '@modules/home/components/hero-fallback'
import Lookbook from '@modules/home/components/lookbook'
import StatusStrip from '@modules/home/components/status-strip'
import { ProductCarousel } from '@modules/products/components/product-carousel'

export const metadata: Metadata = {
  title: 'EnteraVeil — anime streetwear from beyond the veil',
  description:
    'Anime-inspired streetwear. Limited drops, graphic tees, ships from Bangalore across India.',
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  // Degrade gracefully if Medusa or Strapi is unreachable.
  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn()
    } catch {
      return fallback
    }
  }

  const [{ products }, { product_categories }] = await Promise.all([
    safe(
      () =>
        getProductsList({
          pageParam: 0,
          queryParams: { limit: 12 },
          countryCode: countryCode,
        }).then(({ response }) => response),
      { products: [], count: 0 } as any
    ),
    safe(
      () => getCategoriesList(0, 100),
      { product_categories: [], count: 0 } as any
    ),
  ])

  const region = await safe(() => getRegion(countryCode), null as any)

  const homepageSections = await safe(() => getHomepageSections(), [])
  const heroSection = findHomepageSection(homepageSections, 'hero')
  const promoSection = findHomepageSection(homepageSections, 'promo')

  // Split products into two carousels: lead with first 6, second carousel
  // shows remaining (or repeats if we don't have enough). Matches the
  // xenpachi multi-strip pattern documented in
  // docs/structure-comparison.md.
  const lead = products?.slice(0, 6) ?? []
  const second = products?.slice(6, 12) ?? []

  return (
    <>
      {/* 1. HERO — left-asymmetric, sharp CTAs (Pass anti-Claude #1, #2) */}
      {heroSection ? <CmsHero section={heroSection} /> : <HeroFallback />}

      {/* 2. LEAD PRODUCT CAROUSEL — comicsense/xenpachi pattern of leading
            with merchandise above any abstract section. */}
      {region && lead.length > 0 && (
        <ProductCarousel
          testId="lead-products"
          products={lead}
          regionId={region.id}
          title="Best of the drop"
          viewAll={{ link: '/shop', text: 'View all' }}
        />
      )}

      {/* 3. CATEGORIES — 4 tiles, no display headline above (xenpachi
            uses bare category-name h3 per strip; we collapse the brand
            voice into the tile itself). */}
      <FeaturedCategories categories={product_categories ?? []} />

      {/* 4. SECOND PRODUCT CAROUSEL — second strip below categories,
            xenpachi multi-strip pattern. Filters to a different
            angle (latest drops vs bestsellers). */}
      {region && second.length > 0 && (
        <ProductCarousel
          testId="second-products"
          products={second}
          regionId={region.id}
          title="New this drop"
          viewAll={{ link: '/shop?sort=latest', text: 'Latest' }}
        />
      )}

      {/* 5. LOOKBOOK STRIP — trimmed to fewer looks + arrow link.
            See modules/home/components/lookbook/index.tsx. */}
      <Lookbook />

      {/* 6. BRAND QUOTE — slim band, no image, replaces the prior full
            BrandBanner. Keeps the editorial brand voice but in 1/3 the
            vertical real estate. */}
      {promoSection ? <CmsPromo section={promoSection} /> : <BrandQuote />}

      {/* 7. STATUS STRIP — trust/policy band above the footer. */}
      <StatusStrip />

      {/* Footer comes from the (main) layout. */}
    </>
  )
}
