import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SectionHeading } from '@modules/common/components/section-heading'

// Editorial lookbook — asymmetric grid, mixed aspect ratios, captions.
// Each look has a number, a poster-style caption, and a location/time tag
// that mimics a fashion-magazine credit line.
const LOOKS = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=70',
    n: '01',
    title: 'Abyss tee',
    meta: 'Bangalore · alleyway',
    aspect: 'aspect-[3/4]',
    span: 'small:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=70',
    n: '02',
    title: 'Mirage crew',
    meta: 'rooftop · 19:42',
    aspect: 'aspect-[4/3]',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1400&q=70',
    n: '03',
    title: 'Sweats & chains',
    meta: 'studio · low light',
    aspect: 'aspect-square',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1400&q=70',
    n: '04',
    title: 'Genesis pant',
    meta: 'BLR · 21:00',
    aspect: 'aspect-[4/3]',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1400&q=70',
    n: '05',
    title: 'Two-tone fit',
    meta: 'station 2',
    aspect: 'aspect-[3/4]',
    span: 'small:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1400&q=70',
    n: '06',
    title: 'Stitching the drop',
    meta: 'studio · close',
    aspect: 'aspect-square',
    span: '',
  },
]

const Lookbook = () => (
  <Container className="flex flex-col gap-10 small:gap-14">
    <SectionHeading
      eyebrow="The lookbook"
      title="How the crew wears it."
      description="Six looks, one drop. Shot on street and in the studio — credits the makers, not the influencers."
      action={
        <Button asChild variant="tonal" className="w-max">
          <LocalizedClientLink href="/lookbook">
            Open the issue →
          </LocalizedClientLink>
        </Button>
      }
    />

    <Box className="grid grid-cols-2 gap-3 small:grid-cols-4 small:grid-rows-2 small:gap-5">
      {LOOKS.map((look) => (
        <figure
          key={look.n}
          className={`group relative overflow-hidden bg-skeleton-primary ev-card-lift ${look.aspect} ${look.span}`}
        >
          <Image
            src={look.src}
            alt={`${look.title} — ${look.meta}`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
          />

          {/* Three-stop gradient — keeps the middle airy, sinks the caption. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/0 to-transparent" />
          {/* Top-edge gradient so the look number reads on bright shots */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />

          {/* Look number — top-left, poster scale */}
          <span className="ev-num absolute left-4 top-3 text-3xl text-static small:left-5 small:top-4 small:text-4xl">
            {look.n}
          </span>

          {/* Caption block — bottom-left, editorial */}
          <figcaption className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 small:bottom-5 small:left-5 small:right-5">
            <span className="ev-mono text-action-primary/90">{look.meta}</span>
            <span className="ev-display-soft text-xl text-static small:text-2xl medium:text-3xl">
              {look.title}
            </span>
          </figcaption>
        </figure>
      ))}
    </Box>

    {/* End-of-issue CTA card — bigger statement that closes the lookbook */}
    <LocalizedClientLink
      href="/lookbook"
      className="ev-card-lift group relative flex flex-col items-start justify-between gap-6 overflow-hidden border border-action-primary/25 bg-secondary px-8 py-10 small:flex-row small:items-end small:px-12 small:py-14"
    >
      <div className="flex max-w-[640px] flex-col gap-3">
        <span className="ev-eyebrow text-action-primary">The full issue</span>
        <Heading
          as="h3"
          className="ev-display-soft text-3xl text-basic-primary small:text-4xl medium:text-5xl"
        >
          Read the story
          <br />
          <span className="text-action-primary">behind the drop.</span>
        </Heading>
        <p className="text-md text-secondary">
          Photographer, location notes, the crew that printed every tee. The
          credits no influencer post will give you.
        </p>
      </div>
      <span className="ev-mono shrink-0 text-action-primary group-hover:translate-x-1 transition-transform duration-300">
        View the story →
      </span>
    </LocalizedClientLink>
  </Container>
)

export default Lookbook
