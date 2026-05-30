import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { BagIcon } from '@modules/common/icons'

/**
 * Cart page empty state — adopts the same bg-ev-elevated card pattern
 * used in cart-drawer / account-no-orders / search-empty / 404. Left-
 * aligned content on small+ (anti-Claude rule #1). Sharp-rect poster
 * CTAs (anti-Claude rule #2).
 */
const EmptyCartMessage = () => {
  return (
    <Box className="ev-grain relative mx-auto flex w-full max-w-[640px] flex-col items-center gap-5 overflow-hidden border border-action-primary/15 bg-ev-elevated px-6 py-14 text-center small:items-start small:px-12 small:py-16 small:text-left">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-ev-gold/30 bg-primary/40 text-ev-gold">
        <BagIcon className="h-6 w-6" />
      </div>
      <Box className="flex flex-col items-center gap-3 small:items-start">
        <span className="ev-eyebrow text-ev-gold">Nothing in the void</span>
        <h2 className="ev-display-soft max-w-[18ch] text-3xl text-ev-primary small:text-4xl">
          Your cart is empty.
        </h2>
        <p className="max-w-[440px] text-md text-ev-secondary">
          Hand-printed tees and heavyweight sweats are waiting on the drop
          page.
        </p>
      </Box>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 small:justify-start">
        <Button variant="poster" asChild className="!h-11 !px-6">
          <LocalizedClientLink href="/shop">
            Shop the drop →
          </LocalizedClientLink>
        </Button>
        <LocalizedClientLink href="/lookbook" className="ev-arrow-link">
          View the lookbook →
        </LocalizedClientLink>
      </div>
    </Box>
  )
}

export default EmptyCartMessage
