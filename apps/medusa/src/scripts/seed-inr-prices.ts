import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

const EUR_TO_INR = 90

// Round to retail-style INR endings (99 / 199 / 299 / 499 / 999).
// Take the EUR-converted amount and pick the nearest pleasant ending.
const TIERS = [99, 199, 299, 499, 799, 999, 1499, 1999, 2499, 2999, 3999, 4999]
function retailRound(amount: number): number {
  // Anchor to the nearest tier and bump to the next thousand if needed.
  const k = Math.round(amount / 1000)
  const thousand = k * 1000
  let best = TIERS[0]
  let bestDist = Infinity
  for (const t of TIERS) {
    const candidate = thousand + t
    const dist = Math.abs(candidate - amount)
    if (dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }
  // Don't return below the smallest tier
  return Math.max(best, 99)
}

export default async function seedInrPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const pricingModule = container.resolve(Modules.PRICING)

  logger.info('Loading variants with prices...')

  const { data: variants } = await query.graph({
    entity: 'variant',
    fields: [
      'id',
      'title',
      'product_id',
      'product.title',
      'price_set.id',
      'price_set.prices.id',
      'price_set.prices.amount',
      'price_set.prices.currency_code',
    ],
  })

  logger.info(`Found ${variants.length} variants`)

  let created = 0
  let updated = 0
  let skipped = 0
  let missingPriceSet = 0

  for (const v of variants as any[]) {
    if (!v.price_set?.id) {
      missingPriceSet++
      continue
    }
    const prices = v.price_set.prices || []
    const eur = prices.find((p: any) => p.currency_code === 'eur')
    const usd = prices.find((p: any) => p.currency_code === 'usd')
    const existingInr = prices.find((p: any) => p.currency_code === 'inr')

    // Use EUR as the source of truth; fall back to USD (≈ EUR for this seed).
    const sourceAmount = eur?.amount ?? usd?.amount
    if (sourceAmount == null) {
      skipped++
      continue
    }

    const inrAmount = retailRound(Number(sourceAmount) * EUR_TO_INR)

    if (existingInr) {
      if (existingInr.amount === inrAmount) {
        skipped++
        continue
      }
      await pricingModule.updatePriceSets(v.price_set.id, {
        prices: [
          ...prices
            .filter((p: any) => p.currency_code !== 'inr')
            .map((p: any) => ({
              id: p.id,
              amount: p.amount,
              currency_code: p.currency_code,
            })),
          { id: existingInr.id, amount: inrAmount, currency_code: 'inr' },
        ],
      })
      updated++
      logger.info(
        `Updated INR for ${v.product?.title}/${v.title}: ₹${inrAmount}`
      )
    } else {
      await pricingModule.addPrices({
        priceSetId: v.price_set.id,
        prices: [{ amount: inrAmount, currency_code: 'inr' }],
      })
      created++
      logger.info(
        `Created INR for ${v.product?.title}/${v.title}: ₹${inrAmount}`
      )
    }
  }

  logger.info(
    `Done. created=${created} updated=${updated} skipped=${skipped} missingPriceSet=${missingPriceSet}`
  )
}
