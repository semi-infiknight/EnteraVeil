'use client'

import React, { useState } from 'react'

import { isManual, isRazorpay } from '@lib/constants'
import { placeOrder } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'

import ErrorMessage from '../error-message'
import { RazorpayPaymentButton } from '../razorpay-button/razorpay-button'

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  'data-testid': string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  'data-testid': dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isRazorpay(paymentSession?.provider_id):
      return (
        <RazorpayPaymentButton
          cart={cart}
          notReady={notReady}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <CodPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

// Cash-on-Delivery: backed by Medusa's built-in `pp_system_default` manual
// payment provider. We just place the order; payment is captured offline
// when the courier collects the cash. Phase 4 handles the COD region setup.
const CodPaymentButton = ({
  notReady,
  'data-testid': dataTestId,
}: {
  notReady: boolean
  'data-testid'?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message ?? 'Failed to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        data-testid={dataTestId ?? 'submit-order-button'}
      >
        Place order — pay on delivery
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="cod-payment-error-message"
      />
    </>
  )
}

export default PaymentButton
