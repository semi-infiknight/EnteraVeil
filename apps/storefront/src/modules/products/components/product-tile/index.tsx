import { useMemo } from 'react'

import { formatNameForTestId } from '@lib/util/formatNameForTestId'
import { Badge } from '@modules/common/components/badge'
import { Box } from '@modules/common/components/box'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'

import { ProductActions } from './action'
import { LoadingImage } from './loading-image'
import ProductPrice from './price'

export function ProductTile({
  product,
  regionId,
}: {
  product: {
    id: string
    created_at: string
    title: string
    handle: string
    thumbnail: string
    calculatedPrice: string
    salePrice: string
  }
  regionId: string
}) {
  const isNew = useMemo(() => {
    const createdAt = new Date(product.created_at)
    const currentDate = new Date()
    const differenceInDays =
      (currentDate.getTime() - createdAt.getTime()) / (1000 * 3600 * 24)

    return differenceInDays <= 7
  }, [product.created_at])

  return (
    <Box
      className="group flex h-full flex-col ev-card-lift"
      data-testid={formatNameForTestId(`${product.title}-product-tile`)}
    >
      <Box className="relative h-[290px] overflow-hidden small:h-[504px]">
        {isNew && (
          <Box className="absolute left-3 top-3 z-10 small:left-5 small:top-5">
            <Badge label="New drop" variant="brand" />
          </Box>
        )}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${product.title}`}
        >
          <LoadingImage
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </LocalizedClientLink>
        {/* Editorial overlay: shows on hover; complements quick-add button. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        {/* Faint palette swatches bottom-left — purely decorative, sets a
            colourway-aware mood. Hidden until hover for restraint. */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 small:bottom-5 small:left-5"
        >
          <span className="h-2 w-2 rounded-full bg-static ring-1 ring-static/40" />
          <span className="h-2 w-2 rounded-full bg-[#1a1a1a] ring-1 ring-static/40" />
          <span className="h-2 w-2 rounded-full bg-action-primary ring-1 ring-static/40" />
        </div>
        <ProductActions productHandle={product.handle} regionId={regionId} />
      </Box>
      <ProductInfo
        productHandle={product.handle}
        productTitle={product.title}
        calculatedPrice={product.calculatedPrice}
        salePrice={product.salePrice}
      />
    </Box>
  )
}

function ProductInfo({
  productHandle,
  productTitle,
  calculatedPrice,
  salePrice,
}: {
  productHandle: string
  productTitle: string
  calculatedPrice: string
  salePrice: string
}) {
  return (
    <Box className="flex flex-col gap-3 px-1 pt-4 small:gap-4 small:px-1 small:pt-5">
      <div className="flex items-start justify-between gap-4">
        <LocalizedClientLink
          href={`/products/${productHandle}`}
          className="ev-link inline-block"
        >
          <Text
            title={productTitle}
            as="span"
            className="line-clamp-2 text-left text-base text-basic-primary small:text-lg"
          >
            {productTitle}
          </Text>
        </LocalizedClientLink>
        <ProductPrice calculatedPrice={calculatedPrice} salePrice={salePrice} />
      </div>
      <LocalizedClientLink
        href={`/products/${productHandle}`}
        className="ev-mono inline-flex w-max items-center gap-1 text-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        Quick view →
      </LocalizedClientLink>
    </Box>
  )
}
