'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

import useEmblaCarousel from 'embla-carousel-react'

type ImageCarouselProps = {
  images: { id: string; url: string }[]
  openDialog: (index: number | null) => void
}

const ImageCarousel = ({ images, openDialog }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const slideWidth = 100 / images.length
  const isOnlyOneImage = images.length === 1

  return (
    <>
      <div
        className="overflow-hidden medium:hidden"
        ref={isOnlyOneImage ? null : emblaRef}
      >
        <div className="flex">
          {images.map((image, index) => (
            <div
              className="relative aspect-[29/34] max-h-[400px] w-full shrink-0"
              key={image.id}
            >
              <Image
                onClick={() => openDialog(index)}
                src={image.url}
                alt={`Product image ${index + 1}`}
                fill
                priority={index <= 2}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 992px) 780px"
              />
            </div>
          ))}
        </div>
      </div>

      {!isOnlyOneImage && (
        <>
          {/* Editorial counter — "01 / 04" above the dots */}
          <div className="absolute top-3 right-3 medium:hidden">
            <span className="ev-mono inline-flex items-center gap-1.5 rounded-full border border-action-primary/30 bg-primary/70 px-2.5 py-1 text-static backdrop-blur">
              <span className="h-1 w-1 rounded-full bg-action-primary" />
              {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>
          </div>

          {/* Dot indicators centered below the carousel — tappable */}
          <div className="mt-3 flex items-center justify-center gap-2 medium:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => emblaApi?.scrollTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-action-primary'
                    : 'w-1.5 bg-basic-primary/30 hover:bg-basic-primary/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default ImageCarousel
