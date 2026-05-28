'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { RadioGroup } from '@headlessui/react'
import { paymentInfoMap } from '@lib/constants'
import { initiatePaymentSession } from '@lib/data/cart'
import { cn } from '@lib/util/cn'
import ErrorMessage from '@modules/checkout/components/error-message'
import PaymentContainer from '@modules/checkout/components/payment-container'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { Stepper } from '@modules/common/components/stepper'
import { Text } from '@modules/common/components/text'

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart?.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === 'pending'
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? ''
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get('step') === 'payment'

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + '?' + createQueryString('step', 'payment'), {
      scroll: false,
    })
  }

  const handlePaymentMethodChange = async (value: string) => {
    setSelectedPaymentMethod(value)
    await handleSubmit(value)
  }

  const handleSubmit = async (paymentMethodId: string) => {
    setIsLoading(true)

    try {
      await initiatePaymentSession(cart, {
        provider_id: paymentMethodId,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Set payment method if there is only one available
  useEffect(() => {
    setError(null)

    if (
      isOpen &&
      availablePaymentMethods.length === 1 &&
      !selectedPaymentMethod
    ) {
      const singlePaymentMethod = availablePaymentMethods[0].id
      handlePaymentMethodChange(singlePaymentMethod)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, availablePaymentMethods, selectedPaymentMethod])

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <Box className="bg-primary p-5">
      <Box className="mb-6 flex flex-row items-center justify-between">
        <Heading
          as="h2"
          className={cn('flex flex-row items-center gap-x-4 text-2xl', {
            'pointer-events-none select-none': !isOpen && !paymentReady,
          })}
        >
          {!isOpen && !paymentReady ? (
            <Stepper>3</Stepper>
          ) : !isOpen && paymentReady ? (
            <Stepper state="completed" />
          ) : (
            <Stepper state="focussed">3</Stepper>
          )}
          Payment
        </Heading>
        {!isOpen && paymentReady && (
          <Button
            variant="tonal"
            size="sm"
            onClick={handleEdit}
            data-testid="edit-payment-button"
          >
            Edit
          </Button>
        )}
      </Box>
      <Box>
        <Box className={isOpen ? 'block' : 'hidden'}>
          {!paidByGiftcard && availablePaymentMethods?.length && (
            <RadioGroup
              value={selectedPaymentMethod}
              onChange={handlePaymentMethodChange}
            >
              {availablePaymentMethods
                .sort((a, b) => {
                  return a.provider_id > b.provider_id ? 1 : -1
                })
                .map((paymentMethod) => {
                  return (
                    <PaymentContainer
                      paymentInfoMap={paymentInfoMap}
                      paymentProviderId={paymentMethod.id}
                      key={paymentMethod.id}
                      selectedPaymentOptionId={selectedPaymentMethod}
                    />
                  )
                })}
            </RadioGroup>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col">
              <Text className="txt-medium-plus mb-1 text-ui-fg-base">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />
        </Box>

        <Box className={isOpen ? 'hidden' : 'block'}>
          {cart && paymentReady && activeSession ? (
            <Box className="flex flex-col items-start">
              <Box className="flex w-full flex-col p-4">
                <Text size="lg" className="font-normal text-basic-primary">
                  Payment method
                </Text>
                <Text
                  className="font-normal text-secondary"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[selectedPaymentMethod]?.title ||
                    selectedPaymentMethod}
                </Text>
              </Box>
            </Box>
          ) : paidByGiftcard ? (
            <Box className="flex w-full flex-col p-4">
              <Text size="lg" className="font-normal text-basic-primary">
                Payment method
              </Text>
              <Text
                className="font-normal text-secondary"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

export default Payment
