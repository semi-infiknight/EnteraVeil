'use client'

import { Fragment, useEffect, useState } from 'react'

import { Popover, Transition } from '@headlessui/react'
import { enrichLineItems } from '@lib/data/cart'
import { useCartStore } from '@lib/store/useCartStore'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import DeleteButton from '@modules/common/components/delete-button'
import { Heading } from '@modules/common/components/heading'
import LineItemOptions from '@modules/common/components/line-item-options'
import LineItemPrice from '@modules/common/components/line-item-price'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { BagIcon } from '@modules/common/icons/bag'
import Thumbnail from '@modules/products/components/thumbnail'
import SkeletonCartDropdownItems from '@modules/skeletons/components/skeleton-cart-dropdown-items'

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const { isOpenCartDropdown, openCartDropdown, closeCartDropdown } =
    useCartStore()

  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(cartState)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCart = async () => {
      setIsLoading(true)
      if (!cartState) {
        return null
      }

      if (cartState?.items?.length) {
        const enrichedItems = await enrichLineItems(
          cartState.items,
          cartState.region_id!
        )
        cartState.items = enrichedItems
      }

      setCart(cartState)
      setTotalItems(
        cartState.items?.reduce((acc, item) => {
          return acc + item.quantity
        }, 0) || 0
      )
      setIsLoading(false)
    }

    fetchCart()
  }, [cartState])

  const subtotal = cart?.subtotal ?? 0

  useEffect(() => {
    if (isOpenCartDropdown) {
      const timer = setTimeout(() => {
        closeCartDropdown()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [totalItems])

  return (
    <Box
      className="z-50 h-full"
      onMouseEnter={openCartDropdown}
      onMouseLeave={closeCartDropdown}
    >
      <Popover className="relative h-full">
        <Popover.Button className="rounded-full bg-transparent !p-2 text-action-primary hover:bg-fg-secondary-hover hover:text-action-primary-hover active:bg-fg-secondary-pressed active:text-action-primary-pressed xsmall:!p-3.5">
          <LocalizedClientLink href="/cart" data-testid="nav-cart-link">
            <Box className="relative">
              <BagIcon />
              {totalItems > 0 && (
                <span className="absolute left-[14px] top-[-12px] flex h-4 w-4 items-center justify-center rounded-full bg-fg-primary-negative text-[10px] text-white xsmall:left-[18px] xsmall:top-[-16px] xsmall:h-5 xsmall:w-5 xsmall:text-sm">{`${totalItems}`}</span>
              )}
            </Box>
          </LocalizedClientLink>
        </Popover.Button>
        <Transition
          show={isOpenCartDropdown}
          as={Fragment}
          enter="transition ease-out duration-[260ms]"
          enterFrom="opacity-0 translate-x-2 -translate-y-1"
          enterTo="opacity-100 translate-x-0 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 translate-x-0 translate-y-0"
          leaveTo="opacity-0 translate-x-2 -translate-y-1"
        >
          <Popover.Panel
            static
            className="absolute right-0 top-[calc(100%+8px)] hidden w-[460px] border border-action-primary/40 bg-ev-elevated text-ui-fg-base shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur small:block"
            data-testid="nav-cart-dropdown"
          >
            <Box className="flex items-center justify-between gap-3 border-b border-action-primary/25 p-5">
              <div className="flex flex-col">
                <span className="ev-eyebrow text-action-primary">Your cart</span>
                <Text className="ev-display-soft mt-1 text-2xl text-basic-primary">
                  {totalItems > 0 ? `${totalItems} item${totalItems > 1 ? 's' : ''}` : 'Empty for now'}
                </Text>
              </div>
              {totalItems > 0 && (
                <span className="ev-mono shrink-0 rounded-full border border-action-primary/40 px-2.5 py-1 text-action-primary">
                  Drop 001
                </span>
              )}
            </Box>
            {cartState && cartState.items?.length ? (
              <>
                {isLoading ? (
                  <SkeletonCartDropdownItems />
                ) : (
                  <Box className="no-scrollbar grid max-h-[402px] grid-cols-1 gap-y-3 overflow-y-scroll overscroll-contain p-5">
                    {cartState.items
                      .sort((a, b) => {
                        return (a.created_at ?? '') > (b.created_at ?? '')
                          ? -1
                          : 1
                      })
                      .map((item) => (
                        <Box
                          className="flex"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          <LocalizedClientLink
                            href={`/products/${item.variant?.product?.handle}`}
                          >
                            <Thumbnail
                              thumbnail={item.variant?.product?.thumbnail}
                              images={item.variant?.product?.images}
                              size="square"
                              className="h-[90px] w-[80px] rounded-none"
                            />
                          </LocalizedClientLink>
                          <Box className="flex w-full justify-between px-4 py-3">
                            <Box className="flex flex-1 flex-col justify-between">
                              <Box className="flex flex-1 flex-col">
                                <Box className="flex items-start justify-between">
                                  <Box className="mr-4 flex w-[220px] flex-col">
                                    <Box className="flex flex-col gap-1">
                                      <h3 className="line-clamp-2 text-md font-medium">
                                        <LocalizedClientLink
                                          href={`/products/${item.variant?.product?.handle}`}
                                          data-testid="product-link"
                                        >
                                          {item.product_title}
                                        </LocalizedClientLink>
                                      </h3>
                                      <Box className="whitespace-nowrap">
                                        <LineItemOptions
                                          variant={item.variant}
                                          data-testid="cart-item-variant"
                                          data-value={item.variant}
                                        />
                                      </Box>
                                      <span
                                        className="text-md text-secondary"
                                        data-testid="cart-item-quantity"
                                        data-value={item.quantity}
                                      >
                                        {item.quantity}{' '}
                                        {item.quantity > 1 ? 'items' : 'item'}
                                      </span>
                                    </Box>
                                    <Box className="mt-3 flex">
                                      <LineItemPrice
                                        item={item}
                                        style="tight"
                                        isInCartDropdown
                                      />
                                    </Box>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>

                            <DeleteButton
                              id={item.id}
                              data-testid="cart-item-remove-button"
                            />
                          </Box>
                        </Box>
                      ))}
                  </Box>
                )}
                <Box className="text-small-regular flex flex-col gap-y-4 border-t-[0.5px] border-basic-primary p-5">
                  <Box className="flex items-center justify-between">
                    <Text className="text-md text-secondary">Total </Text>
                    <Text
                      className="text-lg font-semibold"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </Text>
                  </Box>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button className="w-full" data-testid="go-to-cart-button">
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </Box>
              </>
            ) : (
              <Box className="my-2 flex flex-col items-center justify-center gap-y-5 px-8 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-action-primary/30 bg-primary/40 text-action-primary">
                  <BagIcon className="h-7 w-7" />
                </div>
                <Box className="flex flex-col items-center justify-center gap-y-2">
                  <Heading
                    as="h4"
                    className="ev-display-soft text-2xl text-basic-primary"
                  >
                    Nothing in the void yet.
                  </Heading>
                  <Text className="max-w-[280px] text-secondary">
                    Hand-printed tees and heavyweight sweats are waiting on the
                    drop page.
                  </Text>
                </Box>
                <div className="flex w-full flex-col gap-2">
                  <Button onClick={closeCartDropdown} asChild className="w-full">
                    <LocalizedClientLink href="/shop">
                      Shop the drop →
                    </LocalizedClientLink>
                  </Button>
                  <Button
                    onClick={closeCartDropdown}
                    asChild
                    variant="tonal"
                    className="w-full"
                  >
                    <LocalizedClientLink href="/lookbook">
                      View the lookbook
                    </LocalizedClientLink>
                  </Button>
                </div>
              </Box>
            )}
          </Popover.Panel>
        </Transition>
      </Popover>
    </Box>
  )
}

export default CartDropdown
