import Image from 'next/image'

import { StoreProductCategory } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// Per-category placeholder photography. Maps category handle → Unsplash URL.
const CATEGORY_IMAGES: Record<string, string> = {
  shirts:
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=70',
  merch:
    'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=900&q=70',
  sweatshirts:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=70',
  pants:
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=70',
  hoodies:
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=70',
}

const FALLBACK =
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=70'

const FeaturedCategories = ({
  categories,
}: {
  categories: StoreProductCategory[]
}) => {
  const top = categories.filter((c) => !c.parent_category).slice(0, 4)
  if (top.length === 0) return null

  return (
    <Container className="flex flex-col gap-6 small:gap-10">
      <Box className="flex flex-col gap-2 small:flex-row small:items-end small:justify-between">
        <Heading className="text-3xl text-basic-primary small:text-4xl">
          Shop by category
        </Heading>
        <Button asChild variant="tonal" className="w-max">
          <LocalizedClientLink href="/shop">View all</LocalizedClientLink>
        </Button>
      </Box>
      <Box className="grid grid-cols-2 gap-3 small:grid-cols-4 small:gap-5">
        {top.map((cat) => {
          const img = CATEGORY_IMAGES[cat.handle] ?? FALLBACK
          return (
            <LocalizedClientLink
              key={cat.id}
              href={`/categories/${cat.handle}`}
              className="group relative block aspect-[3/4] overflow-hidden"
            >
              <Image
                src={img}
                alt={`${cat.name} category`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <Box className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <Box className="absolute bottom-4 left-4 right-4 flex flex-col gap-1">
                <Heading
                  as="h3"
                  className="text-xl text-static small:text-2xl"
                >
                  {cat.name}
                </Heading>
                <span className="text-sm text-static/80">Shop now →</span>
              </Box>
            </LocalizedClientLink>
          )
        })}
      </Box>
    </Container>
  )
}

export default FeaturedCategories
