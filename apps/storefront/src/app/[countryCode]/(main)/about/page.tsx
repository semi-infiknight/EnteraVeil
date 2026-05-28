import { Metadata } from 'next'

import { getAbout, strapiMediaUrl } from '@lib/strapi'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'About',
  description: 'Anime streetwear from beyond the veil.',
}

export default async function AboutPage() {
  const about = await getAbout()

  if (!about) {
    return (
      <Container className="py-16">
        <Heading as="h1" className="text-4xl">
          About EnteraVeil
        </Heading>
        <p className="mt-6 max-w-2xl text-secondary">
          Anime streetwear from beyond the veil. Hand-printed, limited runs, shipped from Bangalore.
        </p>
      </Container>
    )
  }

  const heroUrl = strapiMediaUrl(about.hero_image)

  return (
    <Container className="py-16">
      {heroUrl && (
        <Image
          src={heroUrl}
          alt={about.hero_image?.alternativeText ?? about.title}
          width={about.hero_image?.width ?? 1600}
          height={about.hero_image?.height ?? 800}
          className="mb-10 h-auto w-full rounded-md"
        />
      )}
      <Heading as="h1" className="text-4xl">
        {about.title}
      </Heading>
      {about.body && (
        <div
          className="prose prose-invert mt-6 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: about.body }}
        />
      )}
    </Container>
  )
}
