import { StrapiHomepageSection } from '@lib/strapi'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'

type CmsPromoProps = {
  section: StrapiHomepageSection
}

export default function CmsPromo({ section }: CmsPromoProps) {
  const ctaHref = section.cta_url?.startsWith('/')
    ? section.cta_url
    : section.cta_url
      ? `/${section.cta_url}`
      : undefined

  const bodyText = section.body?.replace(/<[^>]+>/g, '') ?? ''

  return (
    <section className="relative w-full bg-ev-deep py-16 small:py-20">
      <Container className="!py-0">
        <div className="flex flex-col gap-4 small:gap-6">
          <span className="ev-eyebrow flex items-center gap-3 text-ev-gold">
            <span aria-hidden className="h-px w-10 bg-ev-gold" />
            {section.type === 'promo' ? 'Shipping' : 'EnteraVeil'}
          </span>
          <h2 className="ev-display-soft max-w-[20ch] text-3xl text-ev-primary small:text-5xl medium:text-6xl">
            {section.title}
          </h2>
          {bodyText ? (
            <p className="max-w-[480px] text-base text-ev-secondary">
              {bodyText}
            </p>
          ) : null}
          {section.cta_text && ctaHref ? (
            <LocalizedClientLink
              href={ctaHref}
              className="ev-arrow-link w-max text-ev-gold"
            >
              {section.cta_text} →
            </LocalizedClientLink>
          ) : null}
        </div>
      </Container>
    </section>
  )
}