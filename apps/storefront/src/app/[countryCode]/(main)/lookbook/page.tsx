import { Metadata } from 'next'

import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { getLookbookEntries, strapiMediaUrl } from '@lib/strapi'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Lookbook',
  description: 'Editorial drops and lookbook stories.',
}

export default async function LookbookPage() {
  const entries = await getLookbookEntries()

  return (
    <Container className="py-16">
      <Heading as="h1" className="text-4xl">
        Lookbook
      </Heading>
      <Text className="mt-2 text-secondary">
        Stories, fits, behind the drop.
      </Text>

      {entries.length === 0 ? (
        <Text className="mt-12 text-secondary">No entries yet.</Text>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 medium:grid-cols-2 large:grid-cols-3">
          {entries.map((entry) => {
            const cover = strapiMediaUrl(entry.gallery?.[0])
            return (
              <LocalizedClientLink
                key={entry.documentId}
                href={`/lookbook/${entry.slug}`}
                className="group block"
              >
                {cover && (
                  <Image
                    src={cover}
                    alt={entry.gallery?.[0]?.alternativeText ?? entry.title}
                    width={entry.gallery?.[0]?.width ?? 800}
                    height={entry.gallery?.[0]?.height ?? 1000}
                    className="aspect-[4/5] h-auto w-full rounded-md object-cover transition-opacity group-hover:opacity-90"
                  />
                )}
                <Heading as="h2" className="mt-4 text-xl">
                  {entry.title}
                </Heading>
              </LocalizedClientLink>
            )
          })}
        </div>
      )}
    </Container>
  )
}
