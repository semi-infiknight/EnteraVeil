import { Metadata } from 'next'
import Image from 'next/image'

import {
  getAbout,
  getLegacyBlogPosts,
  strapiMediaUrl,
} from '@lib/strapi'
import AboutFallback from '@modules/content/components/about-fallback'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { ExploreBlog } from '@modules/home/components/explore-blog'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'At EnteraVeil, we craft anime-inspired streetwear that lets you carry a piece of the veil into the everyday.',
}

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=2400&q=70'

export default async function AboutUsPage() {
  const about = await getAbout()
  const blogRes = await getLegacyBlogPosts({}).catch(() => ({ data: [] }))
  const posts = blogRes.data?.length ? blogRes.data : null

  if (!about) {
    return <AboutFallback />
  }

  const heroUrl = strapiMediaUrl(about.hero_image) ?? FALLBACK_HERO

  return (
    <>
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={heroUrl}
          alt={about.hero_image?.alternativeText ?? about.title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />
        <Container className="!relative !z-10 flex h-full !max-w-[1328px] flex-col justify-end !pb-12 small:!pb-20">
          <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
            <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
            About EnteraVeil
          </span>
          <Heading
            as="h1"
            className="ev-display-collapsed mt-4 max-w-[16ch] text-5xl text-ev-primary small:text-7xl medium:text-8xl"
          >
            {about.title}
          </Heading>
        </Container>
      </section>

      <Container className="py-16">
        {about.body && (
          <div
            className="prose prose-invert max-w-2xl"
            dangerouslySetInnerHTML={{ __html: about.body }}
          />
        )}
      </Container>

      {posts && <ExploreBlog posts={posts} />}
    </>
  )
}