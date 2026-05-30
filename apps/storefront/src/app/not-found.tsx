import { Metadata } from 'next'
import Image from 'next/image'

import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

export const metadata: Metadata = {
  title: '404 — Lost in the void',
  description: 'This page does not exist on the EnteraVeil drop.',
}

const VOID_IMAGE =
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=2000&q=70'

export default function NotFound() {
  return (
    <section className="relative isolate min-h-screen w-full overflow-hidden bg-primary">
      {/* Full-bleed cinematic image */}
      <Image
        src={VOID_IMAGE}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-center opacity-40"
      />
      {/* Stacked overlays — keep type legible, give the photo presence */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-primary/40 to-primary" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/55 via-transparent to-primary/55" />

      {/* Pure-CSS noise overlay, same as hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Vertical metadata strip (desktop) */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rotate-90 origin-right small:block"
      >
        <span className="ev-mono text-action-primary">
          ERROR · 404 · LOST IN THE VEIL · TRY AGAIN
        </span>
      </div>

      {/* Top eyebrow row */}
      <div className="relative z-10 flex items-center gap-3 px-6 pt-12 text-static small:px-14 small:pt-20 large:px-24">
        <span aria-hidden className="h-px w-10 bg-action-primary" />
        <span className="ev-eyebrow text-action-primary">
          Beyond the veil · 404
        </span>
      </div>

      {/* Centre type block */}
      <div className="relative z-10 mx-auto flex max-w-[1328px] flex-col items-start gap-6 px-6 pt-12 pb-16 small:px-14 small:pt-20 small:pb-24 large:px-24">
        <Heading
          as="h1"
          className="ev-rise ev-rise-delay-1 ev-display max-w-[14ch] text-[clamp(3rem,11vw,11rem)] text-static"
        >
          Lost in
          <br />
          <span className="text-action-primary">the void.</span>
        </Heading>
        <Text
          size="lg"
          className="ev-rise ev-rise-delay-2 max-w-[480px] text-ev-secondary"
        >
          This page didn&apos;t make it past the veil. The link may have moved,
          the drop may have sold out, or it may have never existed — either way,
          there&apos;s nothing here.
        </Text>
        <div className="ev-rise ev-rise-delay-3 mt-2 flex flex-wrap items-center gap-3">
          <Button
            asChild
            className="!h-12 !px-7 text-base shadow-[0_0_0_1px_rgb(var(--bg-action-primary)/0.45)]"
          >
            <LocalizedClientLink href="/">Back home →</LocalizedClientLink>
          </Button>
          <Button asChild variant="tonal" className="!h-12 !px-6 text-base">
            <LocalizedClientLink href="/shop">
              Shop the drop
            </LocalizedClientLink>
          </Button>
          <Button asChild variant="tonal" className="!h-12 !px-6 text-base">
            <LocalizedClientLink href="/lookbook">
              View lookbook
            </LocalizedClientLink>
          </Button>
        </div>

        {/* Bottom metadata band — paired mono labels + display values */}
        <div className="mt-10 hidden w-full max-w-[640px] items-end justify-between gap-6 border-t border-static/15 pt-5 text-ev-secondary small:flex">
          <div>
            <div className="ev-mono text-ev-tertiary">Error code</div>
            <div className="ev-display-soft mt-1 text-2xl text-static">404</div>
          </div>
          <div>
            <div className="ev-mono text-ev-tertiary">Reason</div>
            <div className="ev-display-soft mt-1 text-2xl text-static">
              Not found
            </div>
          </div>
          <div>
            <div className="ev-mono text-ev-tertiary">Try</div>
            <div className="ev-display-soft mt-1 text-2xl text-static">
              The drop ↗
            </div>
          </div>
        </div>
      </div>

      {/* Gold rule at very bottom */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="ev-rule h-px w-full" />
      </div>
    </section>
  )
}
