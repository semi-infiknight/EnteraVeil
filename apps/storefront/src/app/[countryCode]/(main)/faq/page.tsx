import { Metadata } from 'next'

import { getFAQ } from '@lib/data/fetch'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { FAQAccordion } from '@modules/content/components/faq-accordion'
import SidebarBookmarks from '@modules/content/components/sidebar-bookmarks'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'FAQs',
  description:
    'Find quick answers to common questions about our products/services.',
}

// Curated fallback so the page never looks empty when Strapi is unreachable.
const DEFAULT_SECTIONS = [
  {
    Bookmark: 'orders',
    Title: 'Orders & shipping',
    Question: [
      {
        Question: 'Where do you ship?',
        Answer:
          'Across India. We ship from Bangalore and Raipur — most metros land in 2–4 working days, the rest in 4–7.',
      },
      {
        Question: 'Is shipping free?',
        Answer:
          'Free over ₹2,000. Below that we add a flat ₹99 for prepaid and ₹120 for COD to cover the courier.',
      },
      {
        Question: 'Do you take COD?',
        Answer:
          'Yes — Cash on Delivery is available everywhere we ship.',
      },
      {
        Question: 'How do I track my order?',
        Answer:
          'You\'ll get a tracking link by email and SMS the moment we hand the package to the courier.',
      },
    ],
  },
  {
    Bookmark: 'returns',
    Title: 'Returns & refunds',
    Question: [
      {
        Question: 'What\'s your return window?',
        Answer:
          '7 days from delivery for size exchanges. The piece must be unworn with original tags.',
      },
      {
        Question: 'Are graphic tees exchangeable?',
        Answer:
          'Yes — for size, not for a different design. Numbered drops in particular sell out fast, so swap quickly.',
      },
      {
        Question: 'How do refunds work?',
        Answer:
          'Refunds hit your original payment method in 5–7 business days once we receive and inspect the return.',
      },
    ],
  },
  {
    Bookmark: 'product',
    Title: 'Product & sizing',
    Question: [
      {
        Question: 'How does the fit run?',
        Answer:
          'Our tees are an oversized, boxy fit. If you\'re between sizes, size down.',
      },
      {
        Question: 'What weight are the tees?',
        Answer:
          '220 GSM heavyweight cotton. Sweats are 380 GSM brushed fleece.',
      },
      {
        Question: 'How do I care for them?',
        Answer:
          'Cold wash, inside out. No bleach, no tumble dry. Hang to dry in shade — the prints last forever this way.',
      },
    ],
  },
  {
    Bookmark: 'brand',
    Title: 'About EnteraVeil',
    Question: [
      {
        Question: 'Where are you based?',
        Answer:
          'Bangalore. Everything is designed, printed and packed in-house.',
      },
      {
        Question: 'Do you restock?',
        Answer:
          'Most drops are numbered and never come back. A few staples restock irregularly — sign up to be told first.',
      },
      {
        Question: 'How do I reach you?',
        Answer:
          'hello@enteraveil.local — usually back within a day. Faster on Instagram DMs.',
      },
    ],
  },
]

export default async function FAQPage() {
  const faqRes = await getFAQ().catch(() => ({ data: null }))
  const fetched = (faqRes?.data as any)?.FAQSection
  const FAQSection: any[] =
    Array.isArray(fetched) && fetched.length > 0 ? fetched : DEFAULT_SECTIONS

  const bookmarks = FAQSection.map((section) => ({
    id: section.Bookmark,
    label: section.Title,
  }))

  return (
    <Container className="min-h-screen max-w-full bg-ev-elevated !p-0">
      <Container className="!py-8">
        <StoreBreadcrumbs breadcrumb="Frequently asked questions" />
        <span className="mt-2 flex items-center gap-3 ev-eyebrow text-ev-gold">
          <span aria-hidden className="h-px w-10 bg-ev-gold/70" />
          Need a hand?
        </span>
        <h1 className="ev-display-soft mt-4 text-4xl text-ev-primary small:text-5xl medium:text-6xl">
          Questions
          <br />
          <span className="text-ev-gold">we get a lot.</span>
        </h1>
        <Box className="mt-6 grid grid-cols-12 medium:mt-12">
          <Box className="col-span-12 mb-10 medium:col-span-3 medium:mb-0">
            <SidebarBookmarks data={bookmarks} />
          </Box>

          <Box className="col-span-12 space-y-10 medium:col-span-8 medium:col-start-5">
            {FAQSection.map((section, id) => (
              <FAQAccordion key={id} data={section} />
            ))}
          </Box>
        </Box>
      </Container>
    </Container>
  )
}
