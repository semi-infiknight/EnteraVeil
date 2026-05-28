import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

const LOOKBOOK = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 1',
  },
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 2',
  },
  {
    src: 'https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 3',
  },
  {
    src: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 4',
  },
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 5',
  },
  {
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=70',
    alt: 'street fit 6',
  },
]

const Lookbook = () => (
  <Container className="flex flex-col gap-6 small:gap-10">
    <Box className="flex flex-col gap-2 small:flex-row small:items-end small:justify-between">
      <Heading className="text-3xl text-basic-primary small:text-4xl">
        Get inspired
      </Heading>
      <Button asChild variant="tonal" className="w-max">
        <LocalizedClientLink href="/blog">
          See full lookbook
        </LocalizedClientLink>
      </Button>
    </Box>
    <Box className="grid grid-cols-2 gap-2 small:grid-cols-3 small:gap-4">
      {LOOKBOOK.map((item) => (
        <Box
          key={item.src}
          className="relative aspect-square overflow-hidden bg-skeleton-primary"
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </Box>
      ))}
    </Box>
  </Container>
)

export default Lookbook
