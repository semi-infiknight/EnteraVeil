import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SectionHeading } from '@modules/common/components/section-heading'
import { Text } from '@modules/common/components/text'

const HERO =
  'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=2400&q=70'
const STUDIO =
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=70'
const PRINT =
  'https://images.unsplash.com/photo-1551739440-5dd934d3a94a?auto=format&fit=crop&w=1600&q=70'

const STATS = [
  { k: '2024', v: 'Year 0 — first drop' },
  { k: '20+', v: 'Pieces in the drop' },
  { k: '< 60', v: 'Numbered per variant' },
  { k: '2', v: 'Cities · BLR · RPR' },
]

const VALUES = [
  {
    title: 'Limited stitches',
    body: 'Numbered runs. Small batches. Most pieces never come back once they sell out.',
  },
  {
    title: 'Hand-printed',
    body: 'Every graphic is screen-printed by a tiny crew in Bangalore. You can feel the ink.',
  },
  {
    title: 'For the anime hearts',
    body: 'We make for the people who quote Yoru in WhatsApp statuses and still re-watch Bebop.',
  },
]

const AboutFallback = () => (
  <>
    <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
      <Image
        src={HERO}
        alt="EnteraVeil — beyond the veil"
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/85" />
      <Container className="!relative !z-10 flex h-full !max-w-[1328px] flex-col justify-end !pb-12 small:!pb-20">
        <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
          <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
          About EnteraVeil
        </span>
        <h1 className="ev-display-collapsed mt-4 max-w-[16ch] text-5xl text-ev-primary small:text-7xl medium:text-8xl">
          From beyond
          <br />
          <span className="text-ev-gold">the veil.</span>
        </h1>
      </Container>
    </section>

    <Container className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="Our story"
        title="Bangalore. Pre-dawn. An anime marathon."
        description="EnteraVeil started as a group chat — three friends sketching graphics between episodes, looking for a tee that didn't already exist. Drop 001 happened the following monsoon."
      />
      <Box className="grid grid-cols-1 gap-5 large:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={STUDIO}
            alt="Studio mood — pieces hanging on a rail"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={PRINT}
            alt="Hand-printing the next drop"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </Box>
    </Container>

    <Container className="flex flex-col gap-10">
      <SectionHeading
        eyebrow="What we stand for"
        title="Loud graphics. Quiet ego."
      />
      <Box className="grid grid-cols-1 gap-5 small:grid-cols-3">
        {VALUES.map((v, idx) => (
          <Box
            key={v.title}
            className="flex flex-col gap-3 border border-ev-gold/20 bg-ev-elevated p-6 ev-card-lift"
          >
            <span className="ev-display text-3xl text-ev-gold">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <h3 className="ev-display text-2xl text-ev-primary">{v.title}</h3>
            <Text className="text-ev-secondary">{v.body}</Text>
          </Box>
        ))}
      </Box>
    </Container>

    <Container>
      <Box className="grid grid-cols-2 gap-4 border-y border-ev-gold/20 py-10 small:grid-cols-4 small:gap-6">
        {STATS.map((s) => (
          <Box key={s.v} className="flex flex-col gap-1">
            <span className="ev-display text-3xl text-ev-gold small:text-5xl">
              {s.k}
            </span>
            <span className="ev-eyebrow text-ev-secondary">{s.v}</span>
          </Box>
        ))}
      </Box>
    </Container>

    {/* Closing CTA — left-aligned (anti-Claude rule #1), sharp poster
        primary + arrow-link secondary (anti-Claude rule #2). */}
    <Container className="flex flex-col items-start gap-4 small:gap-6">
      <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
        <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
        Drop 001 is live
      </span>
      <h2 className="ev-display-soft max-w-[18ch] text-3xl text-ev-primary small:text-5xl">
        Pick the piece you&apos;d wear twice a week.
      </h2>
      <div className="flex flex-wrap items-center gap-5 pt-2">
        <Button variant="poster" asChild className="!h-12 !px-7">
          <LocalizedClientLink href="/shop">
            Shop the drop →
          </LocalizedClientLink>
        </Button>
        <LocalizedClientLink href="/lookbook" className="ev-arrow-link">
          View the lookbook →
        </LocalizedClientLink>
      </div>
    </Container>
  </>
)

export default AboutFallback
