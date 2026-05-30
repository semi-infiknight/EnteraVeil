import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2000&q=70'

/**
 * Editorial split hero — type column on the left, full-bleed photo column
 * on the right (mobile stacks).
 *
 * Anti-Claude moves applied in this rewrite:
 *  #1 Left-aligned on every viewport (no `text-center sm:text-left` flip)
 *  #2 Primary CTA is .ev-rect (sharp filled), secondary is .ev-arrow-link
 *     (text + arrow with hairline underline). No pill buttons in this
 *     hero anymore.
 *  #3 "Live" indicator is a thin gold rule + bullet + mono label
 *     "● LIVE — DROP 001", not a rounded-pill bordered badge.
 *  #4 Metadata band promotes to mobile (was small:flex hidden) — 2 cells
 *     visible on phones so the hero communicates "real shop" rather than
 *     "centered hero from a template"
 */
const HeroFallback = () => (
  <section className="relative isolate w-full overflow-hidden bg-primary">
    {/* SVG noise grain — hidden on small screens (compute cost > visible
        benefit at 390px). */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] hidden opacity-[0.05] mix-blend-overlay small:block"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
      }}
    />

    <div className="relative grid w-full grid-cols-1 large:grid-cols-12 large:min-h-[88vh]">
      {/* TYPE COLUMN — left-aligned on every viewport */}
      <Box className="relative z-10 flex flex-col justify-between px-6 pb-10 pt-10 small:px-12 small:pb-16 small:pt-20 large:col-span-7 large:px-16 large:pb-20 large:pt-24 2xl:px-24 2xl:pb-24">
        {/* Top "● LIVE — DROP 001" indicator — replaces the rounded-pill
            'Live now' badge that was on the image. Hairline + bullet +
            mono label is anti-Claude rule #3. */}
        <div className="ev-rise flex items-center gap-3 text-static">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-ev-gold"
          />
          <span className="ev-mono text-ev-gold">LIVE</span>
          <span aria-hidden className="h-px w-8 bg-ev-gold/40" />
          <span className="ev-mono text-ev-secondary">DROP 001 · SS26</span>
        </div>

        {/* Headline block — left-aligned, oversized, collapsed line-height */}
        <Box className="mt-10 small:mt-16 large:mt-0">
          <Heading
            as="h1"
            className="ev-rise ev-rise-delay-1 ev-display-collapsed max-w-[12ch] text-[clamp(3.5rem,11vw,10rem)] text-ev-primary"
          >
            Beyond
            <br />
            <span className="text-ev-gold">the veil.</span>
          </Heading>
          <Text
            size="lg"
            className="ev-rise ev-rise-delay-2 mt-5 max-w-[420px] text-ev-secondary small:mt-7 small:max-w-[480px]"
          >
            Hand-printed tees, heavyweight sweats and otherworldly
            graphics. Small-batch anime streetwear from a tiny crew in
            Bangalore.
          </Text>

          {/* CTAs — sharp-rect primary + arrow-link secondary. Anti-Claude
              rule #2: no rounded pills. */}
          <Box className="ev-rise ev-rise-delay-3 mt-7 flex flex-wrap items-center gap-5 small:gap-7">
            <LocalizedClientLink href="/shop" className="ev-rect">
              Shop the drop →
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/lookbook"
              className="ev-arrow-link"
            >
              View the lookbook →
            </LocalizedClientLink>
          </Box>
        </Box>

        {/* Bottom metadata band — VISIBLE on mobile too (was small:flex).
            2 cells on phones, 3-4 on larger viewports. Anti-Claude rule #5:
            don't collapse asymmetry on mobile. */}
        <div className="ev-rise ev-rise-delay-3 mt-10 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-static/15 pt-5 text-static/70 small:mt-12 small:grid-cols-4 small:gap-x-8">
          <div>
            <div className="ev-mono text-ev-gold-soft">Numbered</div>
            <div className="ev-display-soft mt-1 text-2xl text-ev-primary small:text-3xl">
              01 / 200
            </div>
          </div>
          <div>
            <div className="ev-mono text-ev-gold-soft">From</div>
            <div className="ev-display-soft mt-1 text-2xl text-ev-primary small:text-3xl">
              Bangalore
            </div>
          </div>
          <div className="hidden small:block">
            <div className="ev-mono text-ev-gold-soft">Shipping</div>
            <div className="ev-display-soft mt-1 text-2xl text-ev-primary small:text-3xl">
              India · 3–5d
            </div>
          </div>
          <div className="hidden small:block">
            <div className="ev-mono text-ev-gold-soft">Payment</div>
            <div className="ev-display-soft mt-1 text-2xl text-ev-primary small:text-3xl">
              COD · UPI
            </div>
          </div>
        </div>
      </Box>

      {/* IMAGE COLUMN — full-bleed edge-to-edge. No badge overlay (badge
          moved to type column header). */}
      <Box className="ev-vignette relative h-[48vh] min-h-[400px] w-full large:col-span-5 large:h-auto large:min-h-full">
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

        {/* Vertical metadata strip down the right edge (desktop only) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rotate-90 origin-right small:block"
        >
          <span className="ev-mono text-ev-gold">
            DROP 001 · SS26 · BLR · INDIA
          </span>
        </div>
      </Box>
    </div>

    {/* Bottom hairline rule — closes the hero (no "scroll" cue label;
        the rule alone is the visual divider). */}
    <div className="absolute inset-x-0 bottom-0">
      <div className="ev-rule h-px w-full" />
    </div>
  </section>
)

export default HeroFallback
