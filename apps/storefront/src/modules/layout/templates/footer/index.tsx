import { createFooterNavigation } from '@lib/constants'
import { getCategoriesList } from '@lib/data/categories'
import { cn } from '@lib/util/cn'
import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@modules/common/components/accordion'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { NavigationItem } from '@modules/common/components/navigation-item'
import { Text } from '@modules/common/components/text'
import {
  ChevronDownIcon,
  FacebookIcon,
  LinkedinIcon,
  Wordmark,
  XLogoIcon,
} from '@modules/common/icons'

function SocialMedia({ className }: { className?: string }) {
  return (
    <Box className={cn('flex gap-2', className)}>
      <LocalizedClientLink
        href="#"
        data-testid="linkedin-link"
        aria-label="LinkedIn"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-static/20 text-static/85 transition-all duration-200 hover:border-action-primary hover:text-action-primary"
      >
        <LinkedinIcon className="h-4 w-4" />
      </LocalizedClientLink>
      <LocalizedClientLink
        href="#"
        data-testid="facebook-link"
        aria-label="Facebook"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-static/20 text-static/85 transition-all duration-200 hover:border-action-primary hover:text-action-primary"
      >
        <FacebookIcon className="h-4 w-4" />
      </LocalizedClientLink>
      <LocalizedClientLink
        href="#"
        data-testid="x-link"
        aria-label="X / Twitter"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-static/20 text-static/85 transition-all duration-200 hover:border-action-primary hover:text-action-primary"
      >
        <XLogoIcon className="h-4 w-4" />
      </LocalizedClientLink>
    </Box>
  )
}

export default async function Footer({ countryCode }: { countryCode: string }) {
  // Degrade gracefully if Medusa is unreachable.
  let product_categories: any[] = []
  try {
    ;({ product_categories } = await getCategoriesList())
  } catch {
    product_categories = []
  }
  const footerNavigation = createFooterNavigation(product_categories)

  return (
    <Container
      as="footer"
      className="ev-grain relative mx-0 max-w-full overflow-hidden border-t border-action-primary/20 bg-ev-warm !px-0 !py-0"
    >
      {/* Newsletter band — top of footer */}
      <Box className="relative border-b border-static/10">
        <Container className="grid grid-cols-1 gap-8 !py-12 text-static small:!py-16 large:grid-cols-12 large:gap-12">
          <Box className="flex flex-col gap-3 large:col-span-6">
            <span className="ev-eyebrow flex items-center gap-3 text-action-primary">
              <span aria-hidden className="h-px w-10 bg-action-primary/70" />
              The dispatch
            </span>
            <Heading
              as="h2"
              className="ev-display-soft max-w-[18ch] text-3xl text-static small:text-4xl medium:text-5xl"
            >
              First word on every
              <br />
              <span className="text-action-primary">drop.</span>
            </Heading>
            <Text size="md" className="max-w-[440px] text-static/65">
              Once a month, no spam. Drop dates, lookbooks, the occasional
              early-access code. Made for people who actually wear the
              clothes.
            </Text>
          </Box>

          <Box className="flex flex-col justify-center gap-3 large:col-span-6">
            <form
              action="#"
              method="post"
              className="flex w-full flex-col gap-3 small:flex-row"
              aria-label="Subscribe to the EnteraVeil dispatch"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                required
                placeholder="you@somewhere.com"
                className="flex-1 rounded-md border border-static/20 bg-transparent px-5 py-3 text-static placeholder:text-static/40 focus:border-ev-gold focus:outline-none focus:ring-2 focus:ring-ev-gold/30"
              />
              <Button
                variant="poster"
                type="submit"
                className="!h-12 !px-6 shrink-0"
              >
                Sign me up →
              </Button>
            </form>
            <Text size="sm" className="text-static/40">
              By signing up you agree to our privacy policy. Unsubscribe in one
              tap.
            </Text>
          </Box>
        </Container>
      </Box>

      {/* Main link area */}
      <Container className="flex flex-col gap-10 !py-12 text-static small:!py-16">
        <Box className="grid grid-cols-1 gap-10 large:grid-cols-12">
          {/* Brand column */}
          <Box className="flex flex-col gap-6 large:col-span-4">
            <LocalizedClientLink
              href="/"
              aria-label="EnteraVeil home"
              className="w-max"
            >
              <Wordmark className="h-7 text-static" />
            </LocalizedClientLink>
            <Text size="md" className="max-w-[320px] text-static/65">
              Anime streetwear from beyond the veil. Hand-printed in Bangalore,
              numbered runs, no restocks on most pieces.
            </Text>
            <SocialMedia />
          </Box>

          {/* Nav columns — desktop */}
          <Box
            className="hidden gap-8 small:grid small:grid-cols-3 large:col-span-8 large:gap-6"
            data-testid="footer-links-section"
          >
            {footerNavigation.navigation.map((item, id) => (
              <Box
                key={`footerSection-${id}`}
                className="flex flex-col gap-3"
              >
                <span className="ev-eyebrow text-action-primary/80">
                  {item.header}
                </span>
                {item.links.map((link, linkId) => (
                  <NavigationItem
                    href={`/${countryCode}${link.href}`}
                    key={`${id}-navigationItem-${linkId}`}
                    variant="secondary"
                    className="ev-link w-max text-static/80 hover:text-static"
                    data-testid={formatNameForTestId(`${link.title}-link`)}
                  >
                    {link.title}
                  </NavigationItem>
                ))}
              </Box>
            ))}
          </Box>

          {/* Nav accordion — mobile */}
          <Accordion
            type="single"
            collapsible
            className="flex w-full flex-col small:hidden"
          >
            {footerNavigation.navigation.map((item, id) => (
              <AccordionItem
                value={`item-${id}`}
                key={id}
                className="border-b border-static/10 last:border-b-0"
              >
                <AccordionTrigger
                  className="transition-all [&[data-state=open]>#chevronDownSvg]:rotate-180"
                  data-testid={formatNameForTestId(`${item.header}-dropdown`)}
                >
                  <span className="ev-eyebrow py-4 text-action-primary">
                    {item.header}
                  </span>
                  <div
                    id="chevronDownSvg"
                    className="flex h-10 w-10 shrink-0 items-center justify-center text-static/70 duration-200 ease-in-out"
                  >
                    <ChevronDownIcon />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-3 pb-4">
                  {item.links.map((link, linkId) => (
                    <NavigationItem
                      href={link.href}
                      key={`${id}-navigationItem-${linkId}`}
                      variant="secondary"
                      className="ev-link w-max text-static/80 hover:text-static"
                      data-testid={formatNameForTestId(`${link.title}-link`)}
                    >
                      {link.title}
                    </NavigationItem>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>

        {/* Legal strip */}
        <Box className="flex flex-col gap-4 border-t border-static/10 pt-6 small:flex-row small:items-center small:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-static/55">
            <span>
              © {new Date().getFullYear()} EnteraVeil. All rights reserved.
            </span>
            {footerNavigation.other.map((link, id) => (
              <NavigationItem
                key={`other-${id}`}
                variant="secondary"
                className="ev-link shrink-0 text-static/55 hover:text-static"
                href={link.href}
                data-testid={formatNameForTestId(`${link.title}-link`)}
              >
                {link.title}
              </NavigationItem>
            ))}
          </div>

          {/* Region / drop chip */}
          <div className="flex items-center gap-3 text-static/55">
            <span className="ev-mono inline-flex items-center gap-1.5 rounded-full border border-static/15 px-2.5 py-1">
              <span className="h-1 w-1 rounded-full bg-action-primary" />
              India · INR
            </span>
            <span className="ev-mono inline-flex items-center gap-1.5 rounded-full border border-static/15 px-2.5 py-1">
              Drop 001 · SS26
            </span>
          </div>
        </Box>
      </Container>
    </Container>
  )
}
