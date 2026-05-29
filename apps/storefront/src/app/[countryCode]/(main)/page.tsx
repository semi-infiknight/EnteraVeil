import { Metadata } from 'next'

import { getCategoriesList } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import {
  getCollectionsData,
  getExploreBlogData,
  getHeroBannerData,
  getMidBannerData,
} from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { Container } from '@modules/common/components/container'
import { Marquee } from '@modules/common/components/marquee'
import { SectionDivider } from '@modules/common/components/section-heading'
import { Banner } from '@modules/home/components/banner'
import BrandBanner from '@modules/home/components/brand-banner'
import Collections from '@modules/home/components/collections'
import { ExploreBlog } from '@modules/home/components/explore-blog'
import FeaturedCategories from '@modules/home/components/featured-categories'
import FeaturedCollections from '@modules/home/components/featured-collections'
import Hero from '@modules/home/components/hero'
import HeroFallback from '@modules/home/components/hero-fallback'
import Lookbook from '@modules/home/components/lookbook'
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

  const [{ collections: collectionsList }, { products }, { product_categories }] =
    await Promise.all([
      safe(() => getCollectionsList(), { collections: [], count: 0 } as any),
      safe(
        () =>
          getProductsList({
            pageParam: 0,
            queryParams: { limit: 9 },
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

  // CMS data
  const [
    strapiCollections,
    heroRes,
    midRes,
    postsRes,
  ] = await Promise.all([
    safe(() => getCollectionsData(), { data: null } as any),
    safe(() => getHeroBannerData(), { data: { HeroBanner: null } } as any),
    safe(() => getMidBannerData(), { data: { MidBanner: null } } as any),
    safe(() => getExploreBlogData(), { data: null } as any),
  ])
  const HeroBanner = heroRes?.data?.HeroBanner
  const MidBanner = midRes?.data?.MidBanner
  const posts = postsRes?.data

  return (
    <>
      {HeroBanner ? <Hero data={HeroBanner} /> : <HeroFallback />}

      {/* Inline ticker between hero and collections — editorial flourish */}
      <Marquee
        speed="slow"
        items={[
          '★ Drop 001 ★',
          'EnteraVeil',
          'beyond the veil',
          'anime streetwear',
          'made in Bangalore',
          'numbered runs',
          'small batch',
        ]}
      />

      <Container className="!py-0">
        <SectionDivider index="01" label="Collections" />
      </Container>
      {strapiCollections?.data ? (
        <Collections
          cmsCollections={strapiCollections}
          medusaCollections={collectionsList}
        />
      ) : (
        <FeaturedCollections />
      )}

      <Container className="!py-0">
        <SectionDivider index="02" label="Categories" />
      </Container>
      <FeaturedCategories categories={product_categories ?? []} />

      {region && products?.length > 0 && (
        <>
          <Container className="!py-0">
            <SectionDivider index="03" label="Best of the drop" />
          </Container>
          <ProductCarousel
            testId="our-bestsellers-section"
            products={products}
            regionId={region.id}
            title="Best of the drop"
            viewAll={{
              link: '/shop',
              text: 'View all',
            }}
          />
        </>
      )}

      {/* Mid-page ticker — heavier graphic statements */}
      <Marquee
        items={[
          'Hand-printed',
          'Numbered',
          'Small batch',
          'Anime DNA',
          'Shipped from BLR',
          'Made for the void',
        ]}
      />

      <Container className="!py-0">
        <SectionDivider index="04" label="Brand notes" />
      </Container>
      {MidBanner ? <Banner data={MidBanner} /> : <BrandBanner />}

      <Container className="!py-0">
        <SectionDivider index="05" label="Lookbook" />
      </Container>
      <Lookbook />

      {posts && posts.length > 0 && (
        <>
          <Container className="!py-0">
            <SectionDivider index="06" label="Journal" />
          </Container>
          <ExploreBlog posts={posts} />
        </>
      )}
    </>
  )
}
