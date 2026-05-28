import { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import { updateProductsWorkflow } from '@medusajs/medusa/core-flows'

const COLLECTIONS = [
  { handle: 'abyss', title: 'Abyss' },
  { handle: 'mirage', title: 'Mirage' },
  { handle: 'genesis', title: 'Genesis' },
]

const TYPES = [
  { value: 'Tees' },
  { value: 'Sweats' },
  { value: 'Bottoms' },
]

// Map a product title to a collection + type by keyword match.
function classify(title: string): { collection: string; type: string } {
  const t = title.toLowerCase()
  if (t.includes('shirt') && !t.includes('sweat')) {
    return { collection: 'abyss', type: 'Tees' }
  }
  if (t.includes('sweatshirt') || t.includes('hoodie')) {
    return { collection: 'mirage', type: 'Sweats' }
  }
  if (t.includes('sweatpant') || t.includes('pant') || t.includes('short')) {
    return { collection: 'genesis', type: 'Bottoms' }
  }
  return { collection: 'abyss', type: 'Tees' }
}

export default async function seedShopFilters({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const productModule = container.resolve(Modules.PRODUCT)

  logger.info('Loading existing collections / types / products...')

  const [existingCols, existingTypes, products] = await Promise.all([
    productModule.listProductCollections({}),
    productModule.listProductTypes({}),
    productModule.listProducts({}),
  ])

  // 1. Upsert collections by handle
  const colByHandle = new Map(existingCols.map((c) => [c.handle, c]))
  for (const def of COLLECTIONS) {
    if (colByHandle.has(def.handle)) continue
    const [created] = await productModule.createProductCollections([
      { handle: def.handle, title: def.title },
    ])
    colByHandle.set(def.handle, created)
    logger.info(`Created collection ${def.handle} (${created.id})`)
  }

  // 2. Upsert product types by value
  const typeByValue = new Map(existingTypes.map((t) => [t.value, t]))
  for (const def of TYPES) {
    if (typeByValue.has(def.value)) continue
    const [created] = await productModule.createProductTypes([
      { value: def.value },
    ])
    typeByValue.set(def.value, created)
    logger.info(`Created type ${def.value} (${created.id})`)
  }

  // 3. Assign each product to a collection + type. Skip if already set.
  let assigned = 0
  let skipped = 0
  for (const p of products) {
    const { collection, type } = classify(p.title)
    const targetCol = colByHandle.get(collection)
    const targetType = typeByValue.get(type)

    const updates: any = {}
    if (targetCol && p.collection_id !== targetCol.id) {
      updates.collection_id = targetCol.id
    }
    if (targetType && p.type_id !== targetType.id) {
      updates.type_id = targetType.id
    }

    if (Object.keys(updates).length === 0) {
      skipped++
      continue
    }
    // Use the workflow (not the module directly) so the index engine + any
    // subscribers see the productsUpdated event and re-index the product.
    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: p.id },
        update: updates,
      },
    })
    assigned++
    logger.info(
      `Assigned ${p.title} → ${collection}/${type}`
    )
  }

  logger.info(`Done. assigned=${assigned} skipped=${skipped}`)
}
