import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getLegalPage } from '@lib/strapi'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'

type Props = {
  params: Promise<{ countryCode: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await getLegalPage(slug)
  return { title: page?.title ?? 'Legal' }
}

// Catch-all for privacy / terms / shipping / refund / contact, looked up by
// slug from the Strapi `legal-page` collection. Add new ones via the Strapi
// admin without touching code.
export default async function LegalPage({ params }: Props) {
  const { slug } = await params
  const page = await getLegalPage(slug)
  if (!page) notFound()

  return (
    <Container className="py-16">
      <Heading as="h1" className="text-4xl">
        {page.title}
      </Heading>
      {page.body && (
        <div
          className="prose prose-invert mt-6 max-w-2xl"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      )}
    </Container>
  )
}
