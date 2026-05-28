import { Metadata } from 'next'

import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

export const metadata: Metadata = {
  title: '404',
  description: 'Something went wrong',
}

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <span className="ev-eyebrow text-action-primary">
        Beyond the veil · error 404
      </span>
      <Heading as="h1" className="ev-display text-6xl text-basic-primary small:text-8xl medium:text-9xl">
        Lost in
        <br />
        <span className="text-action-primary">the void.</span>
      </Heading>
      <Text className="max-w-[480px] text-secondary" size="lg">
        This page doesn&apos;t exist — yet. Try the shop, the lookbook, or head
        back home.
      </Text>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild className="!h-12 !px-6 text-base">
          <LocalizedClientLink href="/">Back home →</LocalizedClientLink>
        </Button>
        <Button asChild variant="tonal" className="!h-12 !px-6 text-base">
          <LocalizedClientLink href="/shop">Shop the drop</LocalizedClientLink>
        </Button>
      </div>
    </Container>
  )
}
