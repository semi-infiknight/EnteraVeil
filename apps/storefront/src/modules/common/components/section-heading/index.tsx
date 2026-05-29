import { cn } from '@lib/util/cn'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: React.ReactNode
  className?: string
  /** Editorial number badge ("01"). Renders as a poster-scale numeral
   * stacked above the eyebrow on desktop. */
  index?: string
}

/**
 * Editorial section header with a small uppercase eyebrow, a display heading,
 * an optional description, and an optional right-side action (e.g. "View all").
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className,
  index,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 small:flex-row small:items-end small:justify-between',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-3',
          align === 'center' && 'items-center text-center'
        )}
      >
        {(index || eyebrow) && (
          <div
            className={cn(
              'flex items-baseline gap-4',
              align === 'center' && 'justify-center'
            )}
          >
            {index && (
              <span className="ev-num text-3xl text-action-primary small:text-4xl">
                {index}
              </span>
            )}
            {eyebrow && (
              <span className="ev-eyebrow flex items-center gap-3 text-action-primary">
                <span
                  aria-hidden
                  className="inline-block h-px w-10 bg-action-primary/70"
                />
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h2 className="ev-display-soft text-4xl text-basic-primary small:text-5xl medium:text-6xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-[560px] text-md text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/**
 * Full-width chapter divider — "01 — COLLECTIONS" sitting on a gold rule.
 * Used between major home sections to give the page editorial rhythm.
 */
export function SectionDivider({
  index,
  label,
  className,
}: {
  index: string
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-5 text-action-primary',
        className
      )}
    >
      <span className="ev-num text-2xl small:text-3xl">{index}</span>
      <span className="ev-mono whitespace-nowrap text-action-primary/85">
        — {label}
      </span>
      <span aria-hidden className="ev-rule h-px w-full" />
    </div>
  )
}
