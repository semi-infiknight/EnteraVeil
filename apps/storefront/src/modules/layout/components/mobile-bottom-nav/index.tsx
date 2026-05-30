'use client'

import { usePathname } from 'next/navigation'

import { useCartStore } from '@lib/store/useCartStore'
import { cn } from '@lib/util/cn'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { BagIcon, SearchIcon, UserIcon } from '@modules/common/icons'

/**
 * Mobile bottom nav — anti-Claude rule #6 rewrite.
 *
 * Previously: 5 evenly-spaced cells with icons + labels (Home, Shop,
 * Search, Account, Cart). User flagged this as "default app strip."
 *
 * Now: 3 sparse icons (Search, Account, Cart) right-aligned with a
 * thin top rule. No labels. No homogeneous grid. The hamburger + logo
 * + cart in the main nav already cover Home and Shop access.
 *
 * Cart includes a badge when items exist (delegated to the cart-store).
 */

export function MobileBottomNav() {
  const pathname = usePathname()
  const { openCartDropdown } = useCartStore()

  // Hide on checkout — that flow has its own dedicated nav/footer
  if (pathname?.includes('/checkout')) return null

  const isActive = (pred: boolean) =>
    pred ? 'text-ev-gold' : 'text-ev-secondary hover:text-ev-primary'

  return (
    <nav
      aria-label="Mobile quick actions"
      data-testid="mobile-bottom-nav"
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-ev-gold/15 bg-primary/85 backdrop-blur-lg large:hidden',
        'pb-[max(env(safe-area-inset-bottom),6px)]'
      )}
    >
      <div className="ml-auto flex w-max items-center gap-5 px-5 pt-3 small:px-7">
        <LocalizedClientLink
          href="/results/all"
          aria-label="Search"
          className={cn(
            'flex h-10 w-10 items-center justify-center transition-colors',
            isActive(pathname?.includes('/results') ?? false)
          )}
        >
          <SearchIcon className="h-5 w-5" />
        </LocalizedClientLink>

        <LocalizedClientLink
          href="/account"
          aria-label="Account"
          className={cn(
            'flex h-10 w-10 items-center justify-center transition-colors',
            isActive(pathname?.includes('/account') ?? false)
          )}
        >
          <UserIcon className="h-5 w-5" />
        </LocalizedClientLink>

        <button
          type="button"
          onClick={openCartDropdown}
          aria-label="Open cart"
          className="flex h-10 w-10 items-center justify-center text-ev-secondary transition-colors hover:text-ev-primary focus-visible:text-ev-gold"
        >
          <BagIcon className="h-5 w-5" />
        </button>
      </div>
    </nav>
  )
}

export default MobileBottomNav
