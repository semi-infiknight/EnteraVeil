'use client'

import React from 'react'

import { HttpTypes } from '@medusajs/types'

type WrapperProps = {
  cart: HttpTypes.StoreCart
  children: React.ReactNode
}

// Razorpay's checkout.js is loaded lazily by `useRazorpay()` inside the button.
// No provider context is needed at this level — kept as a thin passthrough.
const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return <>{children}</>
}

export default Wrapper
