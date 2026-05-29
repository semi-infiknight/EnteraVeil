import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2000&q=70'

/**
 * Editorial split hero — type column on the left, full-bleed photo column
 * on the right (mobile stacks). Monospace metadata strip down the right
 * edge gives it a fashion-mag callout feel; a thin gold rule + scroll cue
 * sit at the very bottom.
 */
const HeroFallback = () => (
  <section className="relative isolate w-full overflow-hidden bg-primary">
    {/* CSS noise grain — pure SVG-data-URI, no asset request. */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.05] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />

    <div className="relative grid w-full grid-cols-1 large:grid-cols-12 large:min-h-[88vh]">
      {/* TYPE COLUMN */}
      <Box className="relative z-10 flex flex-col justify-between px-6 pb-10 pt-12 small:px-12 small:pb-16 small:pt-20 large:col-span-7 large:px-16 large:pb-20 large:pt-24 2xl:px-24 2xl:pb-24">
        {/* Top eyebrow row */}
        <div className="ev-rise flex items-center gap-3 text-static">
          <span aria-hidden className="h-px w-10 bg-action-primary" />
          <span className="ev-eyebrow text-action-primary">SS26 · Drop 001</span>
        </div>

        {/* Headline block */}
        <Box className="mt-12 small:mt-16 large:mt-0">
          <Heading
            as="h1"
            className="ev-rise ev-rise-delay-1 ev-display max-w-[12ch] text-[clamp(3.25rem,9vw,9rem)] text-static"
          >
            Beyond
            <br />
            <span className="text-action-primary">the veil.</span>
          </Heading>
          <Text
            size="lg"
            className="ev-rise ev-rise-delay-2 mt-6 max-w-[480px] text-static/75"
          >
            Hand-printed tees, heavyweight sweats and otherworldly
            graphics — small-batch anime streetwear from a tiny crew in
            Bangalore.
          </Text>

          <Box className="ev-rise ev-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="!h-12 !px-7 text-base shadow-[0_0_0_1px_rgb(var(--bg-action-primary)/0.45)]"
            >
              <LocalizedClientLink href="/shop">
                Shop the drop →
              </LocalizedClientLink>
            </Button>
            <Button
              asChild
              variant="tonal"
              className="!h-12 !px-6 text-base"
            >
              <LocalizedClientLink href="/lookbook">
                View the lookbook
              </LocalizedClientLink>
            </Button>
          </Box>
        </Box>

        {/* Bottom metadata row */}
        <div className="ev-rise ev-rise-delay-3 mt-12 hidden items-end justify-between gap-6 border-t border-static/15 pt-5 text-static/70 small:flex">
          <div>
            <div className="ev-mono text-static/55">Numbered</div>
            <div className="ev-display-soft mt-1 text-3xl text-static">
              01 / 200
            </div>
          </div>
          <div className="hidden small:block">
            <div className="ev-mono text-static/55">From</div>
            <div className="ev-display-soft mt-1 text-3xl text-static">
              Bangalore
            </div>
          </div>
          <div className="hidden medium:block">
            <div className="ev-mono text-static/55">Shipping</div>
            <div className="ev-display-soft mt-1 text-3xl text-static">
              India · 3–5d
            </div>
          </div>
          <div>
            <div className="ev-mono text-static/55">Payment</div>
            <div className="ev-display-soft mt-1 text-3xl text-static">
              COD · UPI
            </div>
          </div>
        </div>
      </Box>

      {/* IMAGE COLUMN */}
      <Box className="relative h-[52vh] min-h-[420px] w-full large:col-span-5 large:h-auto large:min-h-full">
        <Image
          src={HERO_IMAGE}
          alt="EnteraVeil drop — anime streetwear from beyond the veil"
          fill
          sizes="(max-width: 1024px) 100vw, 42vw"
          priority
          className="object-cover object-center"
        />
        {/* Edge gradients tie the photo back to the dark type column */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-primary to-transparent large:w-40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/70 to-transparent" />

        {/* Vertical metadata strip down the right edge */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rotate-90 origin-right small:block"
        >
          <span className="ev-mono text-action-primary">
            DROP 001 · SS26 · BLR · INDIA
          </span>
        </div>

        {/* Numbered overlay badge */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full border border-action-primary/50 bg-primary/60 px-3 py-1.5 text-static backdrop-blur small:right-6 small:top-6">
          <span className="h-1.5 w-1.5 rounded-full bg-action-primary" />
          <span className="ev-mono">Live now</span>
        </div>
      </Box>
    </div>

    {/* Gold rule + scroll cue */}
    <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-3">
      <div className="ev-rule h-px w-full" />
      <span className="ev-mono text-static/50 hidden small:inline">
        Scroll
      </span>
    </div>
  </section>
)

export default HeroFallback
