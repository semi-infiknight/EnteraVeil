import Image from 'next/image'

import { StrapiHomepageSection, strapiMediaUrl } from '@lib/strapi'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2000&q=70'

type CmsHeroProps = {
  section: StrapiHomepageSection
}

export default function CmsHero({ section }: CmsHeroProps) {
  const imageUrl = strapiMediaUrl(section.image) ?? FALLBACK_HERO_IMAGE
  const ctaHref = section.cta_url?.startsWith('/')
    ? section.cta_url
    : section.cta_url
      ? `/${section.cta_url}`
      : '/shop'

  return (
    <section className="relative isolate w-full overflow-hidden bg-primary">
      <div className="relative grid w-full grid-cols-1 large:grid-cols-12 large:min-h-[88vh]">
        <Box className="relative z-10 flex flex-col justify-between px-6 pb-10 pt-10 small:px-12 small:pb-16 small:pt-20 large:col-span-5 large:px-16 large:pb-20 large:pt-24">
          <div className="ev-rise flex items-center gap-3 text-static">
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full bg-ev-gold"
            />
            <span className="ev-mono text-ev-gold">ENTERAVEIL</span>
          </div>

          <div className="mt-10 flex flex-col gap-6 large:mt-0">
            <Heading
              as="h1"
              className="ev-display max-w-[14ch] text-4xl text-basic-primary small:text-5xl medium:text-6xl"
            >
              {section.title ?? 'From beyond the veil'}
            </Heading>
            {section.body ? (
              <Text
                size="lg"
                className="max-w-[480px] text-secondary"
              >
                {section.body.replace(/<[^>]+>/g, '')}
              </Text>
            ) : null}
            {section.cta_text ? (
              <LocalizedClientLink
                href={ctaHref}
                className="ev-rect inline-flex w-max items-center px-8 py-3 text-sm font-medium"
              >
                {section.cta_text}
              </LocalizedClientLink>
            ) : null}
          </div>
        </Box>

        <Box className="relative min-h-[320px] large:col-span-7 large:min-h-0">
          <Image
            src={imageUrl}
            alt={section.title ?? 'EnteraVeil hero'}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        </Box>
      </div>
    </section>
  )
}