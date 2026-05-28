import { cn } from '@lib/util/cn'

type Props = {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: React.ReactNode
  className?: string
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
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 small:flex-row small:items-end small:justify-between',
        className
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-2',
          align === 'center' && 'items-center text-center'
        )}
      >
        {eyebrow && (
          <span className="ev-eyebrow flex items-center gap-3 text-action-primary">
            <span aria-hidden className="inline-block h-px w-8 bg-action-primary" />
            {eyebrow}
          </span>
        )}
        <h2 className="ev-display text-3xl text-basic-primary small:text-4xl medium:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-[520px] text-md text-secondary">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
