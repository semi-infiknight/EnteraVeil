'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import { setShippingMethod } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import { convertToLocale } from '@lib/util/money'
import { HttpTypes } from '@medusajs/types'
import ErrorMessage from '@modules/checkout/components/error-message'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import {
  RadioGroupIndicator,
  RadioGroupItem,
  RadioGroupRoot,
} from '@modules/common/components/radio'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'delivery'

  const selectedShippingMethod = availableShippingMethods?.find(
    // To do: remove the previously selected shipping method instead of using the last one
    (method) => method.id === cart.shipping_methods?.at(-1)?.shipping_option_id
  )

  const handleEdit = () => {
    router.push(pathname + '?step=delivery', { scroll: false })
  }

  const handleSubmit = () => {
    router.push(pathname + '?step=payment', { scroll: false })
  }

  const set = async (id: string) => {
    setIsLoading(true)
    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Box className="bg-primary p-5">
      <Box
        className={cn('flex flex-row items-center justify-between', {
          'mb-6': isOpen || (!isOpen && cart.shipping_methods?.length > 0),
        })}
      >
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none':
              !isOpen && cart.shipping_methods?.length === 0,
          })}
        >
          {!isOpen && cart.shipping_methods?.length === 0 ? (
            <Stepper>2</Stepper>
          ) : !isOpen && (cart.shipping_methods?.length ?? 0) > 0 ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">2</Stepper>
          )}
          Delivery
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Button
              variant="tonal"
              size="sm"
              onClick={handleEdit}
              data-testid="edit-delivery-button"
            >
              Edit
            </Button>
          )}
      </Box>
      {isOpen ? (
        <Box data-testid="delivery-options-container">
          <RadioGroup value={selectedShippingMethod?.id || ''} onChange={set}>
            <div className="flex flex-col gap-2">
              {availableShippingMethods?.map((option, idx) => {
                const isSelected = option.id === selectedShippingMethod?.id
                return (
                  <RadioGroup.Option
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    className={cn(
                      'group relative flex cursor-pointer flex-row items-center gap-3 border-2 px-4 py-4 text-basic-primary transition-all duration-200',
                      isSelected
                        ? 'border-action-primary bg-ev-elevated shadow-[0_0_0_2px_rgb(var(--bg-action-primary)/0.15)]'
                        : 'border-basic-primary/15 hover:border-action-primary/50 bg-transparent'
                    )}
                  >
                    <RadioGroupRoot>
                      <RadioGroupItem
                        id={option.id}
                        value={option.id}
                        checked={isSelected}
                      >
                        <RadioGroupIndicator />
                      </RadioGroupItem>
                    </RadioGroupRoot>
                    <Box className="flex w-full flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="ev-mono text-action-primary/80">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-base text-basic-primary">
                          {option.name}
                        </span>
                      </div>
                      <span className="text-sm text-secondary">
                        Hand-packed in Bangalore · COD available
                      </span>
                    </Box>
                    <span
                      className={cn(
                        'ev-display-soft shrink-0 text-xl transition-colors',
                        isSelected
                          ? 'text-action-primary'
                          : 'text-basic-primary'
                      )}
                    >
                      {convertToLocale({
                        amount: option.amount,
                        currency_code: cart?.currency_code,
                      })}
                    </span>
                  </RadioGroup.Option>
                )
              })}
            </div>
          </RadioGroup>
          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
          <Button
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!cart.shipping_methods?.[0]}
            data-testid="submit-delivery-option-button"
          >
            Proceed to payment
          </Button>
        </Box>
      ) : (
        <Box className="text-small-regular">
          {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
            <div className="flex flex-col p-4">
              <Text size="lg" className="text-basic-primary">
                Delivery method
              </Text>
              <Text className="text-secondary">
                {selectedShippingMethod?.name},{' '}
                {convertToLocale({
                  amount: selectedShippingMethod?.amount,
                  currency_code: cart?.currency_code,
                })}
              </Text>
            </div>
          )}
        </Box>
      )}
    </Box>
  )
}

export default Shipping
