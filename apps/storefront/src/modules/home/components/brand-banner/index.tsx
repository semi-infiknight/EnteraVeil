import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1535185384036-28bbc8035f28?auto=format&fit=crop&w=2400&q=70'

/**
 * Cinematic mid-page brand banner — split layout. Left column is photo,
 * right column is editorial copy with eyebrow + display headline + CTA.
 * Stacks on mobile.
 */
const BrandBanner = () => (
  <Container className="!max-w-full !px-0 !py-0">
    <Box className="relative grid grid-cols-1 large:grid-cols-2 large:min-h-[520px]">
      <Box className="relative h-[280px] small:h-[400px] large:h-auto">
        <Image
          src={BANNER_IMAGE}
          alt="Hand-printed by a tiny crew in Bangalore"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/35 large:bg-black/20" />
      </Box>
      <Box className="relative flex flex-col justify-center gap-6 bg-secondary px-6 py-12 small:px-14 small:py-16 large:px-20 large:py-24 2xl:px-24">
        <span className="ev-eyebrow flex items-center gap-3 text-action-primary">
          <span aria-hidden className="inline-block h-px w-10 bg-action-primary" />
          From beyond the veil
        </span>
        <h2 className="ev-display max-w-[16ch] text-3xl text-basic-primary small:text-5xl medium:text-6xl">
          Small batch.
          <br />
          <span className="text-action-primary">Loud graphics.</span>
        </h2>
        <Text size="lg" className="max-w-[440px] text-secondary">
          Every piece is screen-printed by a tiny crew. We&apos;d rather drop
          fewer, weirder things than chase a feed. Numbered runs, no restocks
          on most pieces.
        </Text>
        <div className="flex items-center gap-3 pt-2">
          <Button asChild className="!h-12 !px-6 text-base">
            <LocalizedClientLink href="/about-us">Our story →</LocalizedClientLink>
          </Button>
          <Button asChild variant="text" className="!h-12 !px-2 text-base text-basic-primary">
            <LocalizedClientLink href="/shop">See the drop</LocalizedClientLink>
          </Button>
        </div>
        {/* Tiny stats strip */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-action-primary/20 pt-6 text-basic-primary">
          {[
            { k: '20+', v: 'Pieces in the drop' },
            { k: '< 60', v: 'Of each variant' },
            { k: '2', v: 'Cities · BLR · RPR' },
          ].map((s) => (
            <div key={s.v} className="flex flex-col">
              <span className="ev-display text-2xl text-action-primary small:text-3xl">
                {s.k}
              </span>
              <span className="ev-eyebrow mt-1 text-secondary">{s.v}</span>
            </div>
          ))}
        </div>
      </Box>
    </Box>
  </Container>
)

export default BrandBanner
