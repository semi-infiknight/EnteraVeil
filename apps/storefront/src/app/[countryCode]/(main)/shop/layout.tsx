import { Metadata } from 'next'

import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

interface StorePageLayoutProps {
  children: React.ReactNode
}

export const metadata: Metadata = {
  title: 'Shop - All products',
  description: 'Explore all of our products.',
}

export default function StorePageLayout({ children }: StorePageLayoutProps) {
  return (
    <>
      <Container className="flex flex-col gap-6 !py-8 small:gap-8">
        <Box className="flex flex-col gap-3">
          <StoreBreadcrumbs />
          {/* Editorial page heading — eyebrow + display title.
              Anti-Claude: left-aligned, h1 uses Bricolage by default
              (Phase 2 globals fix). No centered template-h1. */}
          <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
            <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
            The drop
          </span>
          <h1 className="ev-display-soft text-4xl text-ev-primary small:text-5xl medium:text-6xl">
            All products.
          </h1>
        </Box>
      </Container>
      {children}
    </>
  )
}
