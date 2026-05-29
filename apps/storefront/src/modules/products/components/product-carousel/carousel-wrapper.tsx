'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Heading } from '@modules/common/components/heading'
import { ArrowLeftIcon, ArrowRightIcon } from '@modules/common/icons'
import useEmblaCarousel from 'embla-carousel-react'

interface CarouselWrapperProps {
  children: React.ReactNode
  title: string
  productsCount: number
}

export default function CarouselWrapper({
  children,
  title,
  productsCount,
}: CarouselWrapperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    loop: false,
  })
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('reInit', onSelect).on('select', onSelect)
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const isLessThanFourProducts = productsCount < 4
  const isLessThanThreeProducts = productsCount < 3
  const isLessThanTwoProducts = productsCount < 2

  return (
    <>
      <Box className="flex items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="ev-eyebrow flex items-center gap-3 text-action-primary">
            <span aria-hidden className="inline-block h-px w-10 bg-action-primary/70" />
            More from the drop
          </span>
          <Heading
            as="h2"
            className="ev-display-soft text-3xl text-basic-primary small:text-4xl medium:text-5xl"
          >
            {title}
          </Heading>
        </div>
        <Box
          className={cn('mb-2 hidden shrink-0 items-center gap-2 small:flex', {
            'xl:hidden': isLessThanFourProducts,
            'medium:hidden': isLessThanThreeProducts,
            'small:hidden': isLessThanTwoProducts,
          })}
        >
          <Button
            withIcon
            variant="icon"
            aria-label="Previous"
            className="h-11 w-11 border border-action-primary/30 bg-transparent text-action-primary hover:bg-action-primary/10 disabled:opacity-30"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            withIcon
            variant="icon"
            aria-label="Next"
            className="h-11 w-11 border border-action-primary/30 bg-transparent text-action-primary hover:bg-action-primary/10 disabled:opacity-30"
            onClick={scrollNext}
            disabled={!canScrollNext}
          >
            <ArrowRightIcon />
          </Button>
        </Box>
      </Box>
      <div ref={emblaRef} className="mt-6 small:mt-8">{children}</div>
    </>
  )
}
