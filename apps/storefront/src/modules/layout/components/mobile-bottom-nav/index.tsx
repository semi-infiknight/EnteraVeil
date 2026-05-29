'use client'

import { usePathname } from 'next/navigation'

import { useCartStore } from '@lib/store/useCartStore'
import { cn } from '@lib/util/cn'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import {
  BagIcon,
  SearchIcon,
  UserIcon,
} from '@modules/common/icons'

type Item = {
  href: string
  label: string
  icon: React.ReactNode
  match: (pathname: string) => boolean
}

const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden
  >
    <path
      d="M3 10.5L11 4l8 6.5V18a1.5 1.5 0 0 1-1.5 1.5h-3v-5h-7v5h-3A1.5 1.5 0 0 1 3 18v-7.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
)

const items: Item[] = [
  {
    href: '/',
    label: 'Home',
    icon: <HomeIcon className="h-[22px] w-[22px]" />,
    match: (p) => /^\/[a-z]{2}\/?$/.test(p),
  },
  {
    href: '/shop',
    label: 'Shop',
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 7h16l-1.2 10a2 2 0 0 1-2 1.75H6.2a2 2 0 0 1-2-1.75L3 7Zm4 0V5a4 4 0 1 1 8 0v2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
    match: (p) => p.includes('/shop') || p.includes('/categories'),
  },
  {
    href: '/results/all',
    label: 'Search',
    icon: <SearchIcon className="h-[22px] w-[22px]" />,
    match: (p) => p.includes('/results'),
  },
  {
    href: '/account',
    label: 'Account',
    icon: <UserIcon className="h-[22px] w-[22px]" />,
    match: (p) => p.includes('/account'),
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { openCartDropdown } = useCartStore()

  // Hide on checkout — that flow has its own dedicated nav/footer
  if (pathname?.includes('/checkout')) return null

  return (
    <nav
      aria-label="Mobile primary navigation"
      data-testid="mobile-bottom-nav"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-action-primary/20 bg-primary/90 backdrop-blur-lg large:hidden',
        'pb-[max(env(safe-area-inset-bottom),4px)]'
      )}
    >
      <ul className="mx-auto grid max-w-[600px] grid-cols-5">
        {items.map((it) => {
          const active = it.match(pathname ?? '')
          return (
            <li key={it.href} className="flex">
              <LocalizedClientLink
                href={it.href}
                className={cn(
                  'flex w-full flex-col items-center justify-center gap-1 py-2.5 transition-colors',
                  active
                    ? 'text-action-primary'
                    : 'text-static/75 hover:text-static'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="h-[22px] w-[22px]">{it.icon}</span>
                <span className="ev-mono text-[10px] leading-none">
                  {it.label}
                </span>
              </LocalizedClientLink>
            </li>
          )
        })}
        <li className="flex">
          <button
            type="button"
            onClick={openCartDropdown}
            className="flex w-full flex-col items-center justify-center gap-1 py-2.5 text-static/75 transition-colors hover:text-static focus-visible:text-action-primary"
            aria-label="Open cart"
          >
            <BagIcon className="h-[22px] w-[22px]" />
            <span className="ev-mono text-[10px] leading-none">Cart</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default MobileBottomNav
