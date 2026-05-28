import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2000&q=70'

/**
 * Cinematic editorial hero. Full-bleed photo, near-black gradient, oversized
 * display headline anchored bottom-left. A vertical accent strip + ticker
 * give it a "drop" feel without depending on Strapi content.
 */
const HeroFallback = () => (
  <section className="relative h-[78vh] min-h-[520px] w-full overflow-hidden bg-primary small:h-[88vh] small:min-h-[680px] 2xl:h-[92vh]">
    <Image
      src={HERO_IMAGE}
      alt="EnteraVeil drop — anime streetwear from beyond the veil"
      fill
      sizes="100vw"
      priority
      className="object-cover object-center"
    />
    {/* Cinematic overlays */}
    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/85" />
    <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

    {/* Vertical eyebrow strip on the right edge (desktop only) */}
    <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-90 origin-right small:block">
      <span className="ev-eyebrow text-action-primary">
        Drop 001 · Bangalore · ships across India
      </span>
    </div>

    {/* Inline copy block — bottom-left, large display */}
    <Box className="absolute inset-x-0 bottom-0 px-6 pb-10 small:px-14 small:pb-16 2xl:px-24 2xl:pb-20">
      <Box className="mx-auto max-w-[1328px]">
        <span className="ev-eyebrow text-action-primary">
          Anime streetwear · beyond the veil
        </span>
        <Heading className="ev-display mt-4 max-w-[14ch] text-5xl text-static small:text-7xl medium:text-8xl 2xl:text-9xl">
          New drop.
          <br />
          <span className="text-action-primary">Limited stitches.</span>
        </Heading>
        <Text
          size="lg"
          className="mt-5 max-w-[440px] text-static/80 small:max-w-[520px]"
        >
          Hand-printed tees, heavyweight sweats and otherworldly graphics —
          small-batch from a tiny crew in Bangalore.
        </Text>
        <Box className="mt-7 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="!h-12 !px-6 text-base shadow-[0_0_0_1px_rgb(var(--bg-action-primary)/0.4)]"
          >
            <LocalizedClientLink href="/shop">Shop the drop →</LocalizedClientLink>
          </Button>
          <Button asChild variant="tonal" className="!h-12 !px-6 text-base">
            <LocalizedClientLink href="/categories/shirts">
              View tees
            </LocalizedClientLink>
          </Button>
        </Box>
      </Box>
    </Box>
  </section>
)

export default HeroFallback
