import { Container } from '@modules/common/components/container'

/**
 * Slim brand quote band — replaces the full BrandBanner section on home.
 * Pattern: mono eyebrow left, oversized display headline center-left,
 * gold rule trailing right. No image, no buttons, no second column.
 * Renders as one 200-280px tall band.
 */
const BrandQuote = () => (
  <section className="relative w-full bg-ev-deep py-16 small:py-20">
    <Container className="!py-0">
      <div className="flex flex-col gap-4 small:gap-6">
        <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
          <span aria-hidden className="h-px w-10 bg-ev-gold" />
          From the makers
        </span>
        <h2 className="ev-display-soft max-w-[20ch] text-3xl text-ev-primary small:text-5xl medium:text-6xl">
          Small batch.{' '}
          <span className="text-ev-gold">Loud graphics.</span>
        </h2>
        <p className="max-w-[480px] text-base text-ev-secondary">
          Hand-printed by a tiny crew in Bangalore. Numbered runs, no
          restocks on most pieces.
        </p>
      </div>
    </Container>
  </section>
)

export default BrandQuote
