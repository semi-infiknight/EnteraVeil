import { cn } from '@lib/util/cn'

type MarqueeProps = {
  items: string[]
  className?: string
  speed?: 'slow' | 'normal'
}

export function Marquee({ items, className, speed = 'normal' }: MarqueeProps) {
  // Duplicate the list so the marquee loop is seamless (animation slides -50%).
  const loop = [...items, ...items]
  return (
    <div
      className={cn(
        'relative overflow-hidden border-y border-action-primary/30 bg-static py-2 text-static',
        className
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex w-max whitespace-nowrap',
          speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee'
        )}
      >
        {loop.map((text, idx) => (
          <span
            key={idx}
            className="mx-6 flex items-center gap-6 text-sm tracking-[0.28em] uppercase font-heading"
          >
            {text}
            <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-action-primary" />
          </span>
        ))}
      </div>
    </div>
  )
}
