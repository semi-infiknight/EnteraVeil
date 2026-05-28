import Image from 'next/image'

import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=2000&q=70'

const HeroFallback = () => (
  <>
    <Box className="relative h-[368px] w-full overflow-hidden small:h-[468px] 2xl:h-[560px]">
      <Image
        src={HERO_IMAGE}
        alt="EnteraVeil drop"
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <Box className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
      <Container className="!relative !z-10 flex h-full !max-w-[1328px] flex-col justify-end !py-10 small:!py-14">
        <Text
          size="sm"
          className="mb-3 uppercase tracking-[0.32em] text-static/80"
        >
          anime streetwear · beyond the veil
        </Text>
        <Heading className="max-w-[640px] text-4xl text-static small:text-5xl medium:text-6xl">
          New drop. Limited stitches.
        </Heading>
        <Text
          size="lg"
          className="mt-4 max-w-[520px] text-static/85"
        >
          Hand-printed tees, heavyweight sweats, and otherworldly graphics —
          shipped from Bangalore across India.
        </Text>
        <Box className="mt-6 flex items-center gap-3">
          <Button asChild className="w-max">
            <LocalizedClientLink href="/shop">Shop the drop</LocalizedClientLink>
          </Button>
          <Button asChild variant="tonal" className="w-max">
            <LocalizedClientLink href="/categories/shirts">
              View shirts
            </LocalizedClientLink>
          </Button>
        </Box>
      </Container>
    </Box>
  </>
)

export default HeroFallback
