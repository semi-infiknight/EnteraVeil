import Image from 'next/image'

import { StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

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

/**
 * Categories strip — per structure-comparison.md, this is the dominant
 * repeating pattern on the home (xenpachi/comicsense use one strip per
 * category). We collapse to ONE 4-tile grid; the tile names ARE the
 * h3 (no decorative h2 like "Pick your weapon." above).
 *
 * Decorative giant background label "CATEGORIES" sits behind the grid
 * (.ev-chapter-mark) — inspo synthesis Move #2 (comicsense pattern).
 *
 * Header row: left-aligned mono eyebrow + arrow link to /shop. No pill.
 */

const FeaturedCategories = ({
  categories,
}: {
  categories: StoreProductCategory[]
}) => {
  const top = categories.filter((c) => !c.parent_category).slice(0, 4)
  if (top.length === 0) return null

  return (
    <Container className="relative flex flex-col gap-8 small:gap-10">
      {/* Decorative chapter mark — full-width Bricolage word, faint */}
      <span
        aria-hidden
        className="ev-chapter-mark pointer-events-none absolute -top-4 left-0 right-0 text-[clamp(5rem,18vw,18rem)] small:-top-12"
      >
        CATEGORIES
      </span>

      {/* Header row — mono eyebrow left, arrow link right. No display
          headline above; the tile names below carry the section. */}
      <div className="relative z-10 flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
            <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
            Shop by category
          </span>
        </div>
        <LocalizedClientLink href="/shop" className="ev-arrow-link">
          View all →
        </LocalizedClientLink>
      </div>

      {/* Four-tile grid — sharp corners, left-aligned captions, no hover
          pills. Anti-Claude: no centered text inside tiles. */}
      <Box className="relative z-10 grid grid-cols-2 gap-3 small:grid-cols-4 small:gap-5">
        {top.map((cat, idx) => {
          const img = CATEGORY_IMAGES[cat.handle] ?? FALLBACK
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="ev-card-lift group relative block aspect-[3/4] overflow-hidden bg-ev-elevated"
            >
              <Image
                src={img}
                alt={`${cat.name} — shop the category`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Two-stop gradient sinks caption */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent" />
              {/* Top gradient anchors numeral */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/45 to-transparent" />

              {/* Numeric badge — sharp rect, no pill */}
              <span className="ev-mono absolute left-3 top-3 inline-flex items-center gap-1.5 text-ev-primary">
                <span
                  aria-hidden
                  className="inline-block h-1 w-1 rounded-full bg-ev-gold"
                />
                {String(idx + 1).padStart(2, '0')}
              </span>

              {/* Caption — left-aligned */}
              <Box className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <h3 className="ev-display-soft text-xl text-ev-primary small:text-2xl medium:text-3xl">
                  {cat.name}
                </h3>
                <span className="ev-mono text-ev-gold-soft">
                  Shop {cat.name.toLowerCase()} →
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
