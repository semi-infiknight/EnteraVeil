import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

// Editorial lookbook — trimmed to 3 looks on home (was 6 grid). Full
// 6-tile + end-card composition lives at /lookbook now. Per structure
// comparison: comicsense + xenpachi don't show a lookbook on home; we
// keep ONE strip as a teaser then send users to the issue page.
const LOOKS = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=70',
    n: '01',
    title: 'Abyss tee',
    meta: 'Bangalore · alleyway',
  },
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=70',
    n: '02',
    title: 'Mirage crew',
    meta: 'rooftop · 19:42',
  },
  {
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1400&q=70',
    n: '03',
    title: 'Two-tone fit',
    meta: 'station 2',
  },
]

const Lookbook = () => (
  <Container className="flex flex-col gap-10 small:gap-12">
    {/* Header row — left-aligned eyebrow + headline, right-aligned arrow
        link (anti-Claude rule #2: text+arrow not pill button). */}
    <div className="flex flex-col gap-4 small:flex-row small:items-end small:justify-between">
      <div className="flex max-w-[640px] flex-col gap-3">
        <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
          <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
          The lookbook
        </span>
        <h2 className="ev-display-soft text-3xl text-ev-primary small:text-4xl medium:text-5xl">
          How the crew wears it.
        </h2>
      </div>
      <LocalizedClientLink
        href="/lookbook"
        className="ev-arrow-link self-start"
      >
        Open the issue →
      </LocalizedClientLink>
    </div>

    {/* Three-up tile grid — equal aspects, no asymmetric span/row tricks.
        Each look is bigger so the imagery actually carries. */}
    <Box className="grid grid-cols-1 gap-4 small:grid-cols-3 small:gap-5">
      {LOOKS.map((look) => (
        <figure
          key={look.n}
          className="ev-card-lift group relative aspect-[3/4] overflow-hidden bg-ev-elevated"
        >
          <Image
            src={look.src}
            alt={`${look.title} — ${look.meta}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
          />
          {/* Bottom gradient sinks the caption */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent" />
          {/* Top-edge gradient for the look number */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />

          <span className="ev-num absolute left-4 top-3 text-3xl text-ev-primary small:left-5 small:top-4 small:text-4xl">
            {look.n}
          </span>

          <figcaption className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 small:bottom-5 small:left-5 small:right-5">
            <span className="ev-mono text-ev-gold-soft">{look.meta}</span>
            <span className="ev-display-soft text-xl text-ev-primary small:text-2xl medium:text-3xl">
              {look.title}
            </span>
          </figcaption>
        </figure>
      ))}
    </Box>
  </Container>
)

export default Lookbook
