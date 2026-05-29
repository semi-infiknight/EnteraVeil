'use client'

import { useMemo } from 'react'

import { HttpTypes } from '@medusajs/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@modules/common/components/accordion'
import { Box } from '@modules/common/components/box'
import { Heading } from '@modules/common/components/heading'
import { Text } from '@modules/common/components/text'
import { MinusThinIcon, PlusIcon } from '@modules/common/icons'

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const dimensions = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('dim_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const design = useMemo(() => {
    return Object.entries(product?.metadata || {})
      .filter(([key]) => key.startsWith('des_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
  }, [product?.metadata])

  const tabs = [
    {
      label: 'Description',
      component: <ProductDescriptionTab description={product.description} />,
    },
    Object.entries(dimensions).length > 0 && {
      label: 'Dimensions',
      component: <ProductDimensionsTab dimensions={dimensions} />,
    },
    Object.entries(design).length > 0 && {
      label: 'Design',
      component: <ProductDesignTab design={design} />,
    },
    {
      label: 'Shipping & Returns',
      component: <ShippingInfoTab />,
    },
  ].filter(Boolean)

  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="flex w-full flex-col">
        {tabs.map((tab, id) => {
          return (
            <AccordionItem
              key={id}
              value={`item-${id}`}
              className="border-b border-basic-primary/20 last:border-b-0"
              data-testid="product-tab"
            >
              <AccordionTrigger className="group !rounded-none !py-4 transition-all duration-200 ease-out [&[data-state=closed]>#minusIconSvg]:hidden [&[data-state=open]>#plusIconSvg]:hidden">
                <div className="flex items-center gap-4">
                  <span className="ev-num text-action-primary text-base">
                    {String(id + 1).padStart(2, '0')}
                  </span>
                  <Heading
                    className="ev-display-soft text-lg text-basic-primary transition-colors duration-200 group-hover:text-action-primary group-data-[state=open]:text-action-primary"
                    as="h3"
                  >
                    {tab.label}
                  </Heading>
                </div>
                <div
                  id="plusIconSvg"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-action-primary transition-transform duration-300 group-hover:rotate-90"
                >
                  <PlusIcon />
                </div>
                <div
                  id="minusIconSvg"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-action-primary"
                >
                  <MinusThinIcon />
                </div>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-3 pl-10 !pb-5">
                {tab.component}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

const ProductDescriptionTab = ({ description }: { description: string }) => {
  return (
    <Text
      data-testid="product-description-tab"
      size="md"
      className="whitespace-pre-line text-secondary"
    >
      {description}
    </Text>
  )
}

const ProductDimensionsTab = ({
  dimensions,
}: {
  dimensions: Record<string, unknown>
}) => {
  return (
    <Box data-testid="product-dimensions-tab">
      {Object.entries(dimensions).map(([key, value]) => (
        <div key={key}>
          <Text as="span" className="font-medium text-basic-primary">
            {formatKey(key, 'dim_')}:
          </Text>{' '}
          <Text as="span" className="text-secondary">
            {value as string}
          </Text>
        </div>
      ))}
    </Box>
  )
}

const ProductDesignTab = ({ design }: { design: Record<string, unknown> }) => {
  return (
    <Box data-testid="product-design-tab">
      {Object.entries(design).map(([key, value]) => (
        <div key={key}>
          <Text as="span" className="font-medium text-basic-primary">
            {formatKey(key, 'des_')}:
          </Text>{' '}
          <Text as="span" className="text-secondary">
            {value as string}
          </Text>
        </div>
      ))}
    </Box>
  )
}

const ShippingInfoTab = () => {
  return (
    <div className="flex flex-col gap-4 text-md text-secondary">
      <div>
        <span className="ev-eyebrow text-action-primary">Shipping</span>
        <p className="mt-1">
          Hand-packed in Bangalore. Standard delivery across India: 3–5
          business days from Bangalore, 4–7 days to the rest of the country.
          Free shipping on orders over ₹1,500. COD available everywhere.
        </p>
      </div>
      <div>
        <span className="ev-eyebrow text-action-primary">Returns</span>
        <p className="mt-1">
          7-day no-questions returns on unworn pieces with original tags. We
          cover the reverse-pickup. Print or screen-printed graphics are
          inherently small-batch — minor variations are intentional, not
          defects.
        </p>
      </div>
    </div>
  )
}

const formatKey = (key: string, prefix: string): string => {
  return key
    .replace(prefix, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
