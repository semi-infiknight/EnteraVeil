import { cn } from '@lib/util/cn'

type LogoProps = {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<LogoProps['size']>, string> = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
}

export function Logo({ className, size = 'md' }: LogoProps) {
  return (
    <span
      className={cn(
        'font-heading font-semibold tracking-tight',
        sizeClasses[size],
        className
      )}
    >
      EnteraVeil
    </span>
  )
}
