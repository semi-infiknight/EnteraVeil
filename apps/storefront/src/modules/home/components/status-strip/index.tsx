import { Container } from '@modules/common/components/container'

/**
 * Trust strip — sits above the footer. Mono labels above display values.
 * Reads as a fashion-mag colophon, not a feature comparison table.
 *
 * Pattern: 4 cells on small+, stacks to 2 on mobile. Each cell has a
 * mono eyebrow label and a display-soft value. The strip uses bg-ev-warm
 * so it visually pulls toward the warm-toned footer underneath.
 */

const CELLS = [
  { label: 'Ships from', value: 'Bangalore · 3–5 days' },
  { label: 'Payment', value: 'COD · UPI · cards' },
  { label: 'Returns', value: '7-day no-questions' },
  { label: 'Drop run', value: 'Numbered · small batch' },
] as const

const StatusStrip = () => (
  <section className="relative w-full border-t border-action-primary/15 bg-ev-warm py-10 small:py-14">
    <Container className="!py-0">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 small:grid-cols-4">
        {CELLS.map((c) => (
          <div key={c.label} className="flex flex-col gap-2">
            <span className="ev-mono text-ev-gold-soft">{c.label}</span>
            <span className="ev-display-soft text-xl text-ev-primary small:text-2xl">
              {c.value}
            </span>
          </div>
        ))}
      </div>
    </Container>
  </section>
)

export default StatusStrip
