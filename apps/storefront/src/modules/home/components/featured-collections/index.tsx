import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SectionHeading } from '@modules/common/components/section-heading'

// Asymmetric editorial collection grid. Tile 0 spans 2 rows on desktop.
const COLLECTIONS = [
  {
    title: 'Abyss',
    tagline: 'Inked black, heavyweight cotton.',
    href: '/categories/shirts',
    image:
      'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1400&q=70',
    badge: 'Drop 001',
  },
  {
    title: 'Mirage',
    tagline: 'Pastel haze, glitch graphics.',
    href: '/categories/sweatshirts',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=70',
    badge: 'Sweats',
  },
  {
    title: 'Genesis',
    tagline: 'Day-one classics. Numbered.',
    href: '/categories/pants',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=70',
    badge: 'Bottoms',
  },
]

const FeaturedCollections = () => (
  <Container className="flex flex-col gap-8 small:gap-12">
    <SectionHeading
      eyebrow="Collections"
      title="Born from the veil."
      description="Three capsules, one universe. Pick your faction — bigger silhouettes, heavier weights, weirder graphics."
      action={
        <Button asChild variant="tonal" className="w-max">
          <LocalizedClientLink href="/shop">All drops →</LocalizedClientLink>
        </Button>
      }
    />
    <Box className="grid grid-cols-1 gap-3 small:grid-cols-2 small:grid-rows-2 small:gap-5 large:h-[720px]">
      {COLLECTIONS.map((c, i) => (
        <LocalizedClientLink
          key={c.title}
          href={c.href}
          className={
            'group relative block overflow-hidden ev-card-lift ' +
            (i === 0
              ? 'aspect-[4/5] small:row-span-2 small:aspect-auto'
              : 'aspect-[16/9] small:aspect-auto')
          }
        >
          <Image
            src={c.image}
            alt={`${c.title} — ${c.tagline}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
          <span className="absolute left-4 top-4 z-10 inline-flex h-7 items-center rounded-full bg-static/95 px-3 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {c.badge}
          </span>
          <Box className="absolute bottom-5 left-5 right-5 flex flex-col gap-1">
            <h3 className="ev-display text-3xl text-static small:text-4xl medium:text-5xl">
              {c.title}
            </h3>
            <span className="text-sm text-static/80">{c.tagline}</span>
            <span className="mt-3 inline-flex items-center gap-2 text-sm text-action-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Discover{' '}
              <span aria-hidden className="-translate-x-1 transition-transform duration-300 group-hover:translate-x-0">
                →
              </span>
            </span>
          </Box>
        </LocalizedClientLink>
      ))}
    </Box>
  </Container>
)

export default FeaturedCollections
