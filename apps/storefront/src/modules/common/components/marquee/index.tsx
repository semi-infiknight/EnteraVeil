import { cn } from '@lib/util/cn'

type MarqueeProps = {
  items: string[]
  className?: string
  speed?: 'slow' | 'normal'
}

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  // Duplicate the list so the marquee loop is seamless (animation slides -50%).
  const loop = [...items, ...items]
  // Trim marquee height to match xenpachi/comicsense (26-29px on inspo
  // vs EV 38px before). New: 28px-ish total via py-1.5 + h-4 inner text.
  // Eyebrow consolidation: ev-mono replaces font-heading + tracking-[0.28em].
  return (
    <div
      className={cn(
        'ev-marquee-mask relative overflow-hidden border-y border-action-primary/25 bg-static py-1.5 text-static',
        className
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex w-max whitespace-nowrap will-change-transform',
          speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee'
        )}
      >
        {loop.map((text, idx) => (
          <span
            key={idx}
            className="ev-mono mx-5 flex items-center gap-5"
          >
            {text}
            <span
              aria-hidden
              className="inline-block h-1 w-1 rounded-full bg-action-primary"
            />
          </span>
        ))}
      </div>
    </div>
  )
}
