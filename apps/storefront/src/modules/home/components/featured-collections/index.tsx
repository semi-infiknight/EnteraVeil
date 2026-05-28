import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// Until real collections are seeded in Medusa, route the "drop" tiles to the
// closest category page so the click doesn't 500.
const COLLECTIONS = [
  {
    title: 'Abyss',
    href: '/categories/shirts',
    blurb: 'Inked-black drops, heavyweight cotton.',
    image:
      'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1200&q=70',
  },
  {
    title: 'Mirage',
    href: '/categories/sweatshirts',
    blurb: 'Pastel haze, glitch graphics.',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=70',
  },
  {
    title: 'Genesis',
    href: '/categories/pants',
    blurb: 'Day-one classics from the founding drop.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=70',
  },
]

const FeaturedCollections = () => (
  <Container className="flex flex-col gap-6 small:gap-10">
    <Box className="flex flex-col gap-2 small:flex-row small:items-end small:justify-between">
      <Heading className="text-3xl text-basic-primary small:text-4xl">
        Featured collections
      </Heading>
      <Button asChild variant="tonal" className="w-max">
        <LocalizedClientLink href="/shop">View all</LocalizedClientLink>
      </Button>
    </Box>
    <Box className="grid grid-cols-1 gap-3 small:grid-cols-3 small:gap-5">
      {COLLECTIONS.map((c) => (
        <LocalizedClientLink
          key={c.title}
          href={c.href}
          className="group relative block aspect-[3/4] overflow-hidden"
        >
          <Image
            src={c.image}
            alt={`${c.title} collection`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Box className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <Box className="absolute bottom-5 left-5 right-5 flex flex-col gap-1">
            <Heading
              as="h3"
              className="text-2xl text-static small:text-3xl"
            >
              {c.title}
            </Heading>
            <span className="text-sm text-static/80">{c.blurb}</span>
          </Box>
        </LocalizedClientLink>
      ))}
    </Box>
  </Container>
)

export default FeaturedCollections
