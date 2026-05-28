import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'

import { getLookbookEntryBySlug, strapiMediaUrl } from '@lib/strapi'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = await getLookbookEntryBySlug(slug)
  return {
    title: entry?.title ?? 'Lookbook',
    description: entry?.body?.replace(/<[^>]+>/g, '').slice(0, 160),
  }
}

export default async function LookbookEntryPage({ params }: Props) {
  const { slug } = await params
  const entry = await getLookbookEntryBySlug(slug)
  if (!entry) notFound()

  return (
    <Container className="py-16">
      <Heading as="h1" className="text-4xl">
        {entry.title}
      </Heading>

      {entry.gallery && entry.gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-6 medium:grid-cols-2">
          {entry.gallery.map((image, idx) => {
            const url = strapiMediaUrl(image)
            if (!url) return null
            return (
              <Image
                key={image.id ?? idx}
                src={url}
                alt={image.alternativeText ?? entry.title}
                width={image.width ?? 1200}
                height={image.height ?? 1600}
                className="h-auto w-full rounded-md"
              />
            )
          })}
        </div>
      )}

      {entry.body && (
        <div
          className="prose prose-invert mt-10 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: entry.body }}
        />
      )}
    </Container>
  )
}
