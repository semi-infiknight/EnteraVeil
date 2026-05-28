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
        <LocalizedClientLink href={`/products/${product.handle}`} aria-label={`View ${product.title}`}>
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
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
    <Box className="flex flex-col gap-3 p-4 small:gap-6 small:p-5">
      <div className="flex flex-1 flex-col justify-between gap-4">
        <LocalizedClientLink href={`/products/${productHandle}`}>
          <Text
            title={productTitle}
            as="span"
            className="line-clamp-2 text-center text-lg text-basic-primary"
          >
            {productTitle}
          </Text>
        </LocalizedClientLink>
        <ProductPrice calculatedPrice={calculatedPrice} salePrice={salePrice} />
      </div>
    </Box>
  )
}
