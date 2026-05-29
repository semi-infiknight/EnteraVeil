import React from 'react'
import { Metadata } from 'next'

import { getBaseURL } from '@lib/util/env'
import { Marquee } from '@modules/common/components/marquee'
import MobileBottomNav from '@modules/layout/components/mobile-bottom-nav'
import Footer from '@modules/layout/templates/footer'
import NavWrapper from '@modules/layout/templates/nav'

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: {
  params: Promise<{ countryCode: string }>
  children: React.ReactNode
}) {
  const { countryCode } = await props.params

  return (
    <>
      <Marquee
        items={[
          'Drop 001 — out now',
          'Free shipping over ₹2,000',
          'Hand-printed in Bangalore',
          'COD available across India',
          'Limited stitches · numbered runs',
        ]}
      />
      <NavWrapper countryCode={countryCode} />
      {/* Mobile bottom-nav reserves ~64px; pad the main content so the
          last section isn't covered. Desktop is unaffected via large:pb-0. */}
      <div className="pb-[72px] large:pb-0">{props.children}</div>
      <Footer countryCode={countryCode} />
      <MobileBottomNav />
    </>
  )
}
