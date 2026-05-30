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
      {/* Top marquee — functional copy (xenpachi/comicsense pattern, see
          docs/inspiration-notes.md). Mix offers + thresholds + policy. */}
      <Marquee
        items={[
          'SS26 DROP 001 LIVE',
          'FREE SHIPPING OVER ₹1,500',
          'USE CODE DROP001 — 15% OFF',
          'COD ACROSS INDIA',
          '7-DAY NO-QUESTIONS RETURNS',
          'HAND-PRINTED IN BANGALORE',
        ]}
      />
      <NavWrapper countryCode={countryCode} />
      {/* Mobile bottom-nav reserves ~56px; pad the main content so the
          last section isn't covered. Desktop is unaffected via large:pb-0. */}
      <div className="pb-[56px] large:pb-0">{props.children}</div>
      <Footer countryCode={countryCode} />
      <MobileBottomNav />
    </>
  )
}
