'use client'

import React, { useCallback, useEffect, useState } from 'react'

import { placeOrder } from '@lib/data/cart'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import { Spinner } from '@modules/common/icons'
import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay'
import { CurrencyCode } from 'react-razorpay/dist/constants/currency'

import ErrorMessage from '../error-message'

type RazorpayButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  'data-testid'?: string
}

type RazorpaySessionData = {
  razorpayOrder?: { id: string }
}

export const RazorpayPaymentButton: React.FC<RazorpayButtonProps> = ({
  cart,
  notReady,
  'data-testid': dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string>('')

  const { Razorpay } = useRazorpay()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === 'pending'
  )

  useEffect(() => {
    const data = session?.data as RazorpaySessionData | undefined
    setOrderId(data?.razorpayOrder?.id ?? '')
  }, [session?.data])

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      setErrorMessage(err.message ?? 'An error occurred placing the order.')
      setSubmitting(false)
    }
  }

  const handlePayment = useCallback(() => {
    if (!orderId || !session) {
      setErrorMessage('Razorpay order not yet ready. Please try again.')
      return
    }

    setSubmitting(true)
    setErrorMessage(null)

    const options: RazorpayOrderOptions = {
      key:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ??
        'rzp_test_PLACEHOLDER',
      // Razorpay expects amount in smallest currency unit (paise for INR).
      // Medusa already stores `session.amount` in the smallest unit, so no *100.
      amount: Math.round(Number(session.amount)),
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      order_id: orderId,
      name: process.env.NEXT_PUBLIC_SHOP_NAME ?? 'EnteraVeil',
      description:
        process.env.NEXT_PUBLIC_SHOP_DESCRIPTION ??
        `Order ${orderId}`,
      remember_customer: true,
      prefill: {
        name:
          (cart.billing_address?.first_name ?? '') +
          ' ' +
          (cart.billing_address?.last_name ?? ''),
        email: cart.email ?? '',
        contact: cart.shipping_address?.phone ?? undefined,
      },
      // The webhook handler reads `notes` to map Razorpay payments to
      // Medusa payment sessions. The Razorpay REST API accepts an object
      // (up to 15 keys) but react-razorpay's type declares `string`.
      // Runtime accepts the object — cast to bypass the bad type.
      notes: {
        session_id: session.id,
        cart_id: cart.id,
      } as unknown as string,
      modal: {
        backdropclose: false,
        escape: true,
        handleback: true,
        confirm_close: true,
        ondismiss: () => {
          setSubmitting(false)
          setErrorMessage('Payment cancelled.')
        },
        animation: true,
      },
      handler: () => {
        // Razorpay client confirms success — finalize order with Medusa.
        // The webhook will confirm capture authoritatively server-side.
        onPaymentCompleted()
      },
    }

    const razorpay = new Razorpay(options)
    razorpay.on('payment.failed', (response: any) => {
      setSubmitting(false)
      setErrorMessage(
        response?.error?.description ?? 'Payment failed. Please try again.'
      )
    })
    razorpay.open()
  }, [Razorpay, cart, orderId, session])

  const disabled = !orderId || notReady || submitting

  return (
    <>
      <Button
        disabled={disabled}
        isLoading={submitting}
        onClick={handlePayment}
        data-testid={dataTestId}
      >
        {submitting ? <Spinner /> : 'Pay with Razorpay'}
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}

export default RazorpayPaymentButton
