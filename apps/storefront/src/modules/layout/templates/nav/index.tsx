import { listCategories } from '@lib/data/categories'
import { getCollectionsList } from '@lib/data/collections'
import { getCollectionsData } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import { Container } from '@modules/common/components/container'

import NavActions from './nav-actions'
import NavContent from './nav-content'

export default async function NavWrapper(props: any) {
  // Degrade gracefully when Medusa is unreachable so the brand chrome still renders.
  const safe = async <T,>(fn: () => Promise<T>, fallback: T): Promise<T> => {
    try {
      return await fn()
    } catch {
      return fallback
    }
  }
  const [productCategories, { collections }, strapiCollections, { products }] =
    await Promise.all([
      safe(() => listCategories(), [] as any),
      safe(() => getCollectionsList(), { collections: [], count: 0 } as any),
      safe(() => getCollectionsData(), { data: null } as any),
      safe(
        () =>
          getProductsList({
            pageParam: 0,
            queryParams: { limit: 4 },
            countryCode: props.countryCode,
          }).then(({ response }) => response),
        { products: [], count: 0 } as any
      ),
    ])

  return (
    <Container
      as="nav"
      className="duration-400 sticky top-0 z-50 mx-0 max-w-full border-b border-basic-primary bg-primary !py-0 transition-all ease-in-out medium:!px-14"
    >
      <Container className="flex items-center justify-between !p-0">
        <NavContent
          productCategories={productCategories}
          collections={collections}
          strapiCollections={strapiCollections}
          countryCode={props.countryCode}
          products={products}
        />
        <NavActions />
      </Container>
    </Container>
  )
}
