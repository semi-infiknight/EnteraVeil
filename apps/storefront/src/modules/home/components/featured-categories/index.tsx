import Image from 'next/image'

import { StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SectionHeading } from '@modules/common/components/section-heading'

const CATEGORY_IMAGES: Record<string, string> = {
  shirts:
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=70',
  merch:
    'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1100&q=70',
  sweatshirts:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1100&q=70',
  pants:
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1100&q=70',
  hoodies:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1100&q=70',
}

const FALLBACK =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=70'

const FeaturedCategories = ({
  categories,
}: {
  categories: StoreProductCategory[]
}) => {
  const top = categories.filter((c) => !c.parent_category).slice(0, 4)
  if (top.length === 0) return null

  return (
    <Container className="flex flex-col gap-8 small:gap-12">
      <SectionHeading
        eyebrow="Shop by category"
        title="Pick your weapon."
        description="Tees, sweats, bottoms, merch — find the silhouette you live in."
        action={
          <Button asChild variant="tonal" className="w-max">
            <LocalizedClientLink href="/shop">View all →</LocalizedClientLink>
          </Button>
        }
      />
      <Box className="grid grid-cols-2 gap-3 small:grid-cols-4 small:gap-5">
        {top.map((cat, idx) => {
          const img = CATEGORY_IMAGES[cat.handle] ?? FALLBACK
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group relative block aspect-[3/4] overflow-hidden ev-card-lift"
            >
              <Image
                src={img}
                alt={`${cat.name} — shop the category`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
              <span className="absolute left-3 top-3 z-10 inline-flex h-6 items-center rounded-full bg-action-primary px-2 text-[10px] font-medium uppercase tracking-[0.16em] text-primary">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <Box className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <h3 className="ev-display text-xl text-static small:text-2xl medium:text-3xl">
                  {cat.name}
                </h3>
                <span className="text-xs uppercase tracking-[0.2em] text-static/70">
                  Shop now →
                </span>
              </Box>
            </LocalizedClientLink>
          )
        })}
      </Box>
    </Container>
  )
}

export default FeaturedCategories
