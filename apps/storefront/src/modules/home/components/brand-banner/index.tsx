import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=2000&q=70'

const BrandBanner = () => (
  <Container className="!max-w-full !px-0 !py-0">
    <Box className="relative h-[320px] w-full overflow-hidden small:h-[420px]">
      <Image
        src={BANNER_IMAGE}
        alt="Born from the veil"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <Box className="absolute inset-0 bg-black/55" />
      <Box className="absolute inset-0 flex items-center justify-center px-6">
        <Box className="flex flex-col items-center gap-4 text-center small:gap-6">
          <Text
            size="sm"
            className="uppercase tracking-[0.32em] text-static/80"
          >
            from beyond the veil
          </Text>
          <Heading className="max-w-[760px] text-3xl text-static small:text-5xl medium:text-6xl">
            Born in Bangalore. Inked for the anime hearts.
          </Heading>
          <Text size="lg" className="max-w-[560px] text-static/85">
            Every piece is small-batch screen-printed by a tiny crew. We&apos;d
            rather drop fewer, weirder things than chase a feed.
          </Text>
          <Button asChild className="w-max">
            <LocalizedClientLink href="/about-us">
              Our story
            </LocalizedClientLink>
          </Button>
        </Box>
      </Box>
    </Box>
  </Container>
)

export default BrandBanner
