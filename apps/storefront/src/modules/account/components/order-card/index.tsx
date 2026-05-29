import { getOrderStatus } from '@lib/util/format-order'
import { cn } from '@lib/util/cn'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

import Thumbnail from './thumbnail'

// Maps order status to colour token. Keeps the pill subtle on the dark
// surface — gold for in-flight, secondary for done, negative for issues.
function statusToneClass(status: string) {
  const s = status.toLowerCase()
  if (s.includes('cancel') || s.includes('fail')) {
    return 'border-fg-primary-negative/40 bg-fg-primary-negative/10 text-fg-primary-negative'
  }
  if (s.includes('deliver') || s.includes('complete')) {
    return 'border-basic-primary/15 bg-basic-primary/5 text-basic-primary/80'
  }
  // pending / placed / shipped / processing / paid
  return 'border-action-primary/40 bg-action-primary/10 text-action-primary'
}

export default async function OrderCard({
  order,
}: {
  order: HttpTypes.StoreOrder & { status: string }
}) {
  const countryCode = order.shipping_address?.country_code
  const orderStatus = getOrderStatus(order.status)
  const dateLabel = new Date(order.created_at)
    .toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace('.', '')

  return (
    <Box className="ev-card-lift relative flex flex-col gap-5 border border-basic-primary/15 bg-ev-elevated p-5 transition-colors hover:border-action-primary/40 large:flex-row large:items-center large:gap-8">
      {/* Left: meta column */}
      <Box className="flex flex-col gap-3 large:min-w-[200px] large:max-w-[220px]">
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'ev-mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
              statusToneClass(orderStatus)
            )}
          >
            <span className="h-1 w-1 rounded-full bg-current opacity-80" />
            {orderStatus}
          </span>
          <span className="ev-mono text-secondary/70">#{order.display_id}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="ev-eyebrow text-action-primary/80">Placed</span>
          <Text className="text-base text-basic-primary">{dateLabel}</Text>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="ev-eyebrow text-action-primary/80">Total</span>
          <Text className="ev-display-soft text-2xl text-basic-primary">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </Text>
        </div>
      </Box>

      {/* Middle: thumbnail strip */}
      <Box className="flex flex-1 flex-wrap items-center gap-2">
        {order.items.slice(0, 2).map((item, index) => (
          <Thumbnail
            key={index}
            thumbnail={item.thumbnail}
            href={`/${countryCode}/products/${item.product_handle}`}
            size="big"
            className="xl:hidden"
          />
        ))}
        {order.items.slice(0, 5).map((item, index) => (
          <Thumbnail
            key={index}
            thumbnail={item.thumbnail}
            href={`/${countryCode}/products/${item.product_handle}`}
            className="hidden xl:block"
          />
        ))}
        {order.items.length > 2 && (
          <Thumbnail
            more={`+${order.items.length - 2}`}
            href={`/${countryCode}/account/orders/details/${order.id}`}
            size="big"
            className="xl:hidden"
          />
        )}
        {order.items.length > 5 && (
          <Thumbnail
            more={`+${order.items.length - 5}`}
            href={`/${countryCode}/account/orders/details/${order.id}`}
            className="hidden xl:block"
          />
        )}
      </Box>

      {/* Right: action */}
      <Button
        variant="tonal"
        size="sm"
        asChild
        className="w-max shrink-0"
      >
        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          View order →
        </LocalizedClientLink>
      </Button>
    </Box>
  )
}
