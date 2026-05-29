'use client'

import { usePathname } from 'next/navigation'

import { cn } from '@lib/util/cn'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type AccountNavLinkProps = {
  href: string
  children: React.ReactNode
  icon: React.ReactNode
  'data-testid'?: string
}

const AccountNavLink = ({
  href,
  children,
  icon,
  'data-testid': dataTestId,
}: AccountNavLinkProps) => {
  const route = usePathname()
  const active = route.endsWith(href)

  return (
    <LocalizedClientLink href={href} data-testid={dataTestId}>
      <div
        className={cn(
          'relative flex items-center gap-4 p-4 transition-colors duration-200 ease-out hover:bg-hover',
          active && 'bg-ev-elevated text-action-primary'
        )}
      >
        {/* Active indicator — gold bar pinned to the left edge */}
        <span
          aria-hidden
          className={cn(
            'absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-opacity duration-200',
            active ? 'bg-action-primary opacity-100' : 'opacity-0'
          )}
        />
        {icon}
        <p
          className={cn(
            'transition-colors duration-200',
            active ? 'text-action-primary' : 'text-basic-primary'
          )}
        >
          {children}
        </p>
      </div>
    </LocalizedClientLink>
  )
}

export default AccountNavLink
