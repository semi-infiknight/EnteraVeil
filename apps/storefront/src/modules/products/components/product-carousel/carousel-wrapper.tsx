'use client'

import { useCallback, useEffect, useState } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
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
          {/* Sharp-rect arrow buttons (6px radius via .rounded-md) — replaces
              the prior 24px pill icon buttons (anti-Claude rule #2). */}
          <button
            type="button"
            aria-label="Previous"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-ev-gold/30 bg-transparent text-ev-gold transition-colors hover:border-ev-gold hover:bg-ev-gold/10 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-ev-gold/30 bg-transparent text-ev-gold transition-colors hover:border-ev-gold hover:bg-ev-gold/10 disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ArrowRightIcon />
          </button>
        </Box>
      </Box>
      <div ref={emblaRef} className="mt-6 small:mt-8">{children}</div>
    </>
  )
}
