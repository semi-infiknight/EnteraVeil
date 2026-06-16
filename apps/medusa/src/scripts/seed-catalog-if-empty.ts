// Idempotent catalog seed for production when setup-india.ts already ran.
// Creates demo products + inventory only — no regions/shipping/profile churn.
//
//   pnpm medusa exec ./src/scripts/seed-catalog-if-empty.ts

import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from '@medusajs/medusa/core-flows'
import { ExecArgs } from '@medusajs/framework/types'
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from '@medusajs/framework/utils'

const CATEGORY_NAMES = ['Shirts', 'Sweatshirts', 'Pants', 'Merch'] as const

export default async function seedCatalogIfEmpty({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const productModule = container.resolve(Modules.PRODUCT)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)

  const { data: existingProducts } = await query.graph({
    entity: 'product',
    fields: ['id'],
  })

  if (existingProducts.length > 0) {
    logger.info(
      `Catalog already has ${existingProducts.length} product(s) — skipping.`
    )
    return
  }

  const [salesChannel] = await salesChannelModule.listSalesChannels({})
  if (!salesChannel) {
    throw new Error('No sales channel found')
  }

  const locations = await stockLocationModule.listStockLocations({
    name: 'Bangalore Warehouse',
  })
  const stockLocation = locations[0]
  if (!stockLocation) {
    throw new Error(
      'Bangalore Warehouse not found — run setup-india.ts first'
    )
  }

  logger.info('Seeding product categories...')
  const existingCategories = await productModule.listProductCategories({})
  const existingNames = new Set(existingCategories.map((c) => c.name))

  const toCreate = CATEGORY_NAMES.filter((n) => !existingNames.has(n)).map(
    (name) => ({ name, is_active: true })
  )

  let categoryResult = existingCategories
  if (toCreate.length > 0) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: toCreate },
    })
    categoryResult = [...existingCategories, ...result]
  }

  const categoryId = (name: (typeof CATEGORY_NAMES)[number]) => {
    const cat = categoryResult.find((c) => c.name === name)
    return cat ? [cat.id] : []
  }

  const eurUsd = (eur: number, usd: number) => [
    { amount: eur, currency_code: 'eur' },
    { amount: usd, currency_code: 'usd' },
  ]

  logger.info('Seeding products...')
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: 'Medusa T-Shirt',
          category_ids: categoryId('Shirts'),
          description:
            'Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.',
          handle: 't-shirt',
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png',
            },
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png',
            },
          ],
          options: [
            { title: 'Size', values: ['S', 'M', 'L', 'XL'] },
            { title: 'Color', values: ['Black', 'White'] },
          ],
          variants: [
            {
              title: 'M / Black',
              sku: 'SHIRT-M-BLACK',
              options: { Size: 'M', Color: 'Black' },
              prices: eurUsd(10, 15),
            },
            {
              title: 'L / Black',
              sku: 'SHIRT-L-BLACK',
              options: { Size: 'L', Color: 'Black' },
              prices: eurUsd(10, 15),
            },
            {
              title: 'M / White',
              sku: 'SHIRT-M-WHITE',
              options: { Size: 'M', Color: 'White' },
              prices: eurUsd(10, 15),
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: 'Medusa Sweatshirt',
          category_ids: categoryId('Sweatshirts'),
          description: 'Soft cotton sweatshirt for everyday wear.',
          handle: 'sweatshirt',
          weight: 500,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png',
            },
          ],
          options: [{ title: 'Size', values: ['S', 'M', 'L', 'XL'] }],
          variants: [
            {
              title: 'M',
              sku: 'SWEATSHIRT-M',
              options: { Size: 'M' },
              prices: eurUsd(15, 20),
            },
            {
              title: 'L',
              sku: 'SWEATSHIRT-L',
              options: { Size: 'L' },
              prices: eurUsd(15, 20),
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: 'Medusa Sweatpants',
          category_ids: categoryId('Pants'),
          description: 'Comfortable sweatpants for lounging.',
          handle: 'sweatpants',
          weight: 450,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png',
            },
          ],
          options: [{ title: 'Size', values: ['S', 'M', 'L', 'XL'] }],
          variants: [
            {
              title: 'M',
              sku: 'SWEATPANTS-M',
              options: { Size: 'M' },
              prices: eurUsd(12, 18),
            },
            {
              title: 'L',
              sku: 'SWEATPANTS-L',
              options: { Size: 'L' },
              prices: eurUsd(12, 18),
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        },
        {
          title: 'Medusa Shorts',
          category_ids: categoryId('Merch'),
          description: 'Lightweight shorts for warm days.',
          handle: 'shorts',
          weight: 300,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: 'https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png',
            },
          ],
          options: [{ title: 'Size', values: ['S', 'M', 'L', 'XL'] }],
          variants: [
            {
              title: 'M',
              sku: 'SHORTS-M',
              options: { Size: 'M' },
              prices: eurUsd(10, 15),
            },
            {
              title: 'L',
              sku: 'SHORTS-L',
              options: { Size: 'L' },
              prices: eurUsd(10, 15),
            },
          ],
          sales_channels: [{ id: salesChannel.id }],
        },
      ],
    },
  })

  logger.info('Seeding inventory levels...')
  const { data: inventoryItems } = await query.graph({
    entity: 'inventory_item',
    fields: ['id'],
  })

  if (inventoryItems.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryItems.map((item) => ({
          location_id: stockLocation.id,
          stocked_quantity: 1_000_000,
          inventory_item_id: item.id,
        })),
      },
    })
  }

  logger.info('Catalog seed complete.')
}