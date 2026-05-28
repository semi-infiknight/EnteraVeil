// Provisioning script for EnteraVeil's India region.
//
// Idempotent: each step checks for an existing record before creating.
// Run with:
//   pnpm medusa exec ./src/scripts/setup-india.ts
//
// This sets up:
//   - INR currency on the store + India region (default)
//   - Bangalore stock location with manual fulfillment provider
//   - Three shipping options:
//       * Bangalore Standard (5000 paise = ₹50)
//       * Raipur Standard    (8000 paise = ₹80)
//       * Free Shipping      (when subtotal ≥ 150000 paise = ₹1500)
//   - Payment providers: Razorpay (online) + system_default (COD)

import {
  createRegionsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'
import { ExecArgs } from '@medusajs/framework/types'
import {
  ContainerRegistrationKeys,
  Modules,
} from '@medusajs/framework/utils'

// Read rates from env if provided, else fall back to PROJECT_CONFIG defaults.
const BLR_RATE = Number(process.env.BANGALORE_SHIPPING_RATE_PAISE ?? 5000)
const RPR_RATE = Number(process.env.RAIPUR_SHIPPING_RATE_PAISE ?? 8000)
const FREE_THRESHOLD = Number(
  process.env.FREE_SHIPPING_THRESHOLD_PAISE ?? 150000
)
const ENABLE_COD =
  (process.env.ENABLE_COD ?? 'true').toLowerCase() !== 'false'

export default async function setupIndia({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const regionModule = container.resolve(Modules.REGION)
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION)
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT)
  const salesChannelModule = container.resolve(Modules.SALES_CHANNEL)
  const storeModule = container.resolve(Modules.STORE)

  logger.info('=== EnteraVeil India region setup ===')
  logger.info(
    `Rates (paise): Bangalore=${BLR_RATE}, Raipur=${RPR_RATE}, FreeAt=${FREE_THRESHOLD}, COD=${ENABLE_COD}`
  )

  const paymentProviders = ['pp_system_default']
  // Only attach razorpay provider if credentials are set — otherwise the
  // provider won't exist server-side and the link will fail.
  const razorpayConfigured =
    Boolean(process.env.RAZORPAY_ID) &&
    Boolean(process.env.RAZORPAY_SECRET) &&
    Boolean(process.env.RAZORPAY_WEBHOOK_SECRET) &&
    !process.env.RAZORPAY_ID?.includes('PLACEHOLDER')
  if (razorpayConfigured) {
    paymentProviders.unshift('pp_razorpay_razorpay')
  } else {
    logger.warn(
      'Razorpay env vars missing or placeholder — region will only support COD until real keys land.'
    )
  }

  // --- Store currency: INR default ---------------------------------------
  const [store] = await storeModule.listStores()
  if (!store) {
    throw new Error('No store found — run `pnpm seed` first.')
  }
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [{ currency_code: 'inr', is_default: true }],
      },
    },
  })
  logger.info('Store: INR set as default currency.')

  // --- Region: India ------------------------------------------------------
  const existingRegions = await regionModule.listRegions({ name: 'India' })
  let region = existingRegions[0]
  if (!region) {
    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: 'India',
            currency_code: 'inr',
            countries: ['in'],
            payment_providers: paymentProviders,
          },
        ],
      },
    })
    region = result[0]
    logger.info(`Region created: India (${region.id})`)
  } else {
    logger.info(`Region exists: India (${region.id}) — skipping create`)
  }

  // --- Tax region for India (zero rate; user can add GST later) ---------
  try {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: 'in' }],
    })
    logger.info('Tax region: in (created or already existed)')
  } catch (err: any) {
    // Idempotent: workflow throws if it already exists; swallow and continue.
    if (!/already exists/i.test(err.message ?? '')) {
      throw err
    }
    logger.info('Tax region: in (already existed)')
  }

  // --- Stock location: Bangalore ------------------------------------------
  const existingLocations = await stockLocationModule.listStockLocations({
    name: 'Bangalore Warehouse',
  })
  let stockLocation = existingLocations[0]
  if (!stockLocation) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          {
            name: 'Bangalore Warehouse',
            address: {
              city: 'Bangalore',
              country_code: 'IN',
              province: 'KA',
              address_1: '',
            },
          },
        ],
      },
    })
    stockLocation = result[0]
    logger.info(`Stock location created: Bangalore (${stockLocation.id})`)

    // Link fulfillment provider
    await remoteLink.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
    })
  } else {
    logger.info(`Stock location exists: Bangalore (${stockLocation.id})`)
  }

  // Link to default sales channel (idempotent — re-linking is a no-op)
  const [defaultChannel] = await salesChannelModule.listSalesChannels({
    name: 'Default Sales Channel',
  })
  if (defaultChannel) {
    try {
      await linkSalesChannelsToStockLocationWorkflow(container).run({
        input: {
          id: stockLocation.id,
          add: [defaultChannel.id],
        },
      })
    } catch (err: any) {
      if (!/already/i.test(err.message ?? '')) throw err
    }
  }

  // --- Shipping profile (idempotent) --------------------------------------
  const profileQuery = await fulfillmentModule.listShippingProfiles({
    name: 'Default',
  })
  let shippingProfile = profileQuery[0]
  if (!shippingProfile) {
    const { result } = await createShippingProfilesWorkflow(container).run({
      input: {
        data: [{ name: 'Default', type: 'default' }],
      },
    })
    shippingProfile = result[0]
    logger.info(`Shipping profile created: Default (${shippingProfile.id})`)
  } else {
    logger.info(`Shipping profile exists: Default (${shippingProfile.id})`)
  }

  // --- Fulfillment set + service zone -------------------------------------
  const existingSets = await fulfillmentModule.listFulfillmentSets({
    name: 'India Delivery',
  })
  let fulfillmentSet = existingSets[0]
  if (!fulfillmentSet) {
    fulfillmentSet = await fulfillmentModule.createFulfillmentSets({
      name: 'India Delivery',
      type: 'shipping',
      service_zones: [
        {
          name: 'India',
          geo_zones: [{ country_code: 'in', type: 'country' }],
        },
      ],
    })
    await remoteLink.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    })
    logger.info(`Fulfillment set created: India Delivery`)
  } else {
    logger.info(`Fulfillment set exists: India Delivery`)
  }

  const serviceZoneId =
    (fulfillmentSet as any).service_zones?.[0]?.id ??
    (
      await fulfillmentModule.listServiceZones({
        fulfillment_set: { id: fulfillmentSet.id },
      } as any)
    )[0]?.id
  if (!serviceZoneId) {
    throw new Error('Could not resolve service zone id for India fulfillment set')
  }

  // --- Shipping options ---------------------------------------------------
  // Medusa stores amounts in the smallest unit for the currency; for INR
  // that's paise. So 5000 paise = ₹50.
  const existingOptions = await fulfillmentModule.listShippingOptions({
    service_zone: { id: serviceZoneId },
  } as any)
  const haveOption = (name: string) =>
    existingOptions.some((o: any) => o.name === name)

  type OptionInput = Parameters<
    typeof createShippingOptionsWorkflow
  >[0] extends never
    ? never
    : any

  const toCreate: OptionInput[] = []
  if (!haveOption('Bangalore Standard')) {
    toCreate.push({
      name: 'Bangalore Standard',
      price_type: 'flat',
      provider_id: 'manual_manual',
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: 'Bangalore',
        description: '2–3 days within Bangalore',
        code: 'blr-standard',
      },
      prices: [{ currency_code: 'inr', amount: BLR_RATE }],
      rules: [
        { attribute: 'enabled_in_store', value: '"true"', operator: 'eq' },
        { attribute: 'is_return', value: 'false', operator: 'eq' },
      ],
    })
  }
  if (!haveOption('Raipur Standard')) {
    toCreate.push({
      name: 'Raipur Standard',
      price_type: 'flat',
      provider_id: 'manual_manual',
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: 'Raipur',
        description: '3–5 days to Raipur',
        code: 'rpr-standard',
      },
      prices: [{ currency_code: 'inr', amount: RPR_RATE }],
      rules: [
        { attribute: 'enabled_in_store', value: '"true"', operator: 'eq' },
        { attribute: 'is_return', value: 'false', operator: 'eq' },
      ],
    })
  }
  if (!haveOption('Free Shipping')) {
    toCreate.push({
      name: 'Free Shipping',
      price_type: 'flat',
      provider_id: 'manual_manual',
      service_zone_id: serviceZoneId,
      shipping_profile_id: shippingProfile.id,
      type: {
        label: 'Free',
        description: `Free over ₹${(FREE_THRESHOLD / 100).toFixed(0)}`,
        code: 'free-shipping',
      },
      prices: [{ currency_code: 'inr', amount: 0 }],
      // Free shipping only applies when cart subtotal ≥ FREE_THRESHOLD.
      // The `min_subtotal` rule is the standard Medusa pattern for this.
      rules: [
        { attribute: 'enabled_in_store', value: '"true"', operator: 'eq' },
        { attribute: 'is_return', value: 'false', operator: 'eq' },
        {
          attribute: 'item_total',
          value: String(FREE_THRESHOLD),
          operator: 'gte',
        },
      ],
    })
  }

  if (toCreate.length > 0) {
    await createShippingOptionsWorkflow(container).run({ input: toCreate })
    logger.info(
      `Created ${toCreate.length} shipping option(s): ${toCreate
        .map((o: any) => o.name)
        .join(', ')}`
    )
  } else {
    logger.info('All shipping options already exist — nothing to create.')
  }

  // ---------------------------------------------------------------------
  // Patch a couple of seeder-default quirks that block cart/checkout:
  //   1. tax_region rows can be inserted with provider_id NULL by the
  //      starter seed, which makes /store/carts/.../line-items 500 with
  //      "Unable to retrieve the tax provider with id: null".
  //   2. The starter sometimes leaves enabled_in_store rule values double-
  //      encoded as JSON (e.g. `"\"true\""`), which the rule engine never
  //      matches, so /store/shipping-options returns [].
  //   3. New products inserted via seed sometimes don't have a row in
  //      product_shipping_profile, which also yields 0 shipping options.
  // Both are env-local data fixes; safe to run on every seed pass.
  try {
    const pgConn: any = container.resolve('__pg_connection__')
    if (pgConn) {
      await pgConn('tax_region')
        .whereNull('provider_id')
        .orWhere('provider_id', '')
        .update({ provider_id: 'tp_system' })
      // Fix double-encoded boolean rule values.
      await pgConn('shipping_option_rule')
        .where('attribute', 'enabled_in_store')
        .where('value', '"\\"true\\""')
        .update({ value: '"true"' })
      // Ensure every product is linked to the default shipping profile.
      const profile: any = (
        await pgConn('shipping_profile').where('type', 'default').limit(1)
      )[0]
      if (profile?.id) {
        const products: any[] = await pgConn('product')
          .select('id')
          .whereNull('deleted_at')
        const existing: any[] = await pgConn('product_shipping_profile').select(
          'product_id'
        )
        const have = new Set(existing.map((r: any) => r.product_id))
        const missing = products.filter((p: any) => !have.has(p.id))
        if (missing.length > 0) {
          await pgConn('product_shipping_profile').insert(
            missing.map((p: any) => ({
              id: `psp_${Math.random().toString(36).slice(2, 22)}`,
              product_id: p.id,
              shipping_profile_id: profile.id,
              created_at: new Date(),
              updated_at: new Date(),
            }))
          )
          logger.info(
            `Linked ${missing.length} product(s) to default shipping profile`
          )
        }
      }
    }
  } catch (e: any) {
    logger.warn(
      `Post-seed checkout fixes skipped (${e?.message ?? 'unknown error'})`
    )
  }

  logger.info('=== India region setup complete ===')
  if (ENABLE_COD) {
    logger.info(
      'COD enabled (pp_system_default attached to India region; orders flagged awaiting_payment until courier collects)'
    )
  }
}
