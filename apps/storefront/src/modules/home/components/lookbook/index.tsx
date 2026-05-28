import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { SectionHeading } from '@modules/common/components/section-heading'

// Editorial lookbook — asymmetric grid, mixed aspect ratios, captions.
const LOOKS = [
  {
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 01 — Abyss tee · Bangalore alley',
    aspect: 'aspect-[3/4]',
    span: 'small:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 02 — Mirage crew · rooftop',
    aspect: 'aspect-[4/3]',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1485518882345-15568b007407?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 03 — Sweats + chains',
    aspect: 'aspect-square',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 04 — Genesis pant · BLR · 9 pm',
    aspect: 'aspect-[4/3]',
    span: '',
  },
  {
    src: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 05 — Two-tone fit · station 2',
    aspect: 'aspect-[3/4]',
    span: 'small:row-span-2',
  },
  {
    src: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=1100&q=70',
    caption: 'Look 06 — Studio · stitching the drop',
    aspect: 'aspect-square',
    span: '',
  },
]

const Lookbook = () => (
  <Container className="flex flex-col gap-8 small:gap-12">
    <SectionHeading
      eyebrow="Get inspired"
      title="The lookbook."
      description="How the crew wears it. New looks every drop."
      action={
        <Button asChild variant="tonal" className="w-max">
          <LocalizedClientLink href="/blog">Full lookbook →</LocalizedClientLink>
        </Button>
      }
    />
    <Box className="grid grid-cols-2 gap-3 small:grid-cols-4 small:grid-rows-2 small:gap-5">
      {LOOKS.map((look, i) => (
        <figure
          key={i}
          className={`group relative overflow-hidden bg-skeleton-primary ${look.aspect} ${look.span}`}
        >
          <Image
            src={look.src}
            alt={look.caption}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-90" />
          <figcaption className="absolute bottom-3 left-3 right-3 text-xs uppercase tracking-[0.18em] text-static/85">
            {look.caption}
          </figcaption>
        </figure>
      ))}
    </Box>
  </Container>
)

export default Lookbook
