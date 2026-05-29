import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BoxIcon } from '@modules/common/icons'
import { Pagination } from '@modules/store/components/pagination'
import { ORDERS_LIMIT } from 'app/[countryCode]/(main)/account/@dashboard/orders/page'

import OrderCard from '../order-card'

export interface OrderType extends HttpTypes.StoreOrder {
  status: string
}

const OrderOverview = ({
  orders,
  page,
}: {
  orders: OrderType[]
  page: string
}) => {
  const totalPages = Math.ceil(orders.length / ORDERS_LIMIT)
  const pageNumber = page ? parseInt(page) : 1

  if (orders?.length) {
    return (
      <Box className="flex flex-col gap-8">
        <Box className="flex w-full flex-col gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </Box>
        {totalPages > 1 && (
          <Pagination
            data-testid="orders-pagination"
            page={pageNumber}
            totalPages={totalPages}
          />
        )}
      </Box>
    )
  }

  return <NoOrders />
}

export function NoOrders() {
  return (
    <Box
      className="ev-grain relative flex w-full flex-col items-center gap-6 overflow-hidden border border-action-primary/15 bg-ev-elevated px-6 py-14 text-center small:px-12 small:py-20"
      data-testid="no-orders-container"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-action-primary/30 bg-primary/40 text-action-primary">
        <BoxIcon className="h-7 w-7" />
      </div>
      <Box className="flex flex-col items-center gap-3">
        <span className="ev-eyebrow text-action-primary">
          Your wardrobe is patient
        </span>
        <Heading
          as="h2"
          className="ev-display-soft max-w-[16ch] text-3xl text-basic-primary small:text-4xl"
        >
          Nothing in your closet yet.
        </Heading>
        <Text className="max-w-[460px] text-center text-md text-secondary">
          Your past orders, tracking numbers and delivery updates will live
          here. Until then — the drop is calling.
        </Text>
      </Box>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button asChild className="!h-11 !px-6">
          <LocalizedClientLink href="/shop">Shop the drop →</LocalizedClientLink>
        </Button>
        <Button asChild variant="tonal" className="!h-11 !px-5">
          <LocalizedClientLink href="/lookbook">
            View the lookbook
          </LocalizedClientLink>
        </Button>
      </div>
    </Box>
  )
}

export default OrderOverview
