'use client'

import { useMemo } from 'react'
import Image from 'next/image'

import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { CollectionsData } from 'types/strapi'

const COLLECTION_PLACEHOLDER =
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=70'

type MenuCollection = {
  Title: string
  Handle: string
  Description: string
  Image: { url: string }
}

export default function CollectionsMenu({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections?: CollectionsData | null
  medusaCollections: StoreCollection[]
}) {
  const validCollections = useMemo((): MenuCollection[] | null => {
    if (cmsCollections?.data?.length && medusaCollections?.length) {
      const collections = cmsCollections.data
        .filter((cmsCollection) =>
          medusaCollections.some(
            (medusaCollection) =>
              medusaCollection.handle === cmsCollection.Handle
          )
        )
        .map((c) => ({
          Title: c.Title,
          Handle: c.Handle,
          Description: c.Description,
          Image: { url: c.Image.url },
        }))
      if (collections.length >= 3) {
        return collections.sort((a, b) => b.Handle.localeCompare(a.Handle))
      }
    }

    if (!medusaCollections?.length) return null

    const fallback = medusaCollections.slice(0, 3).map((c) => ({
      Title: c.title ?? c.handle,
      Handle: c.handle,
      Description: '',
      Image: { url: COLLECTION_PLACEHOLDER },
    }))
    return fallback.length >= 1 ? fallback : null
  }, [cmsCollections, medusaCollections])

  const newestCollections = useMemo(() => {
    if (!validCollections) return null
    return validCollections.slice(0, 3)
  }, [validCollections])

  if (!newestCollections) return null

  return (
    <Container className="grid grid-cols-3 gap-2 !px-14 !pb-8 !pt-5">
      {newestCollections.slice(0, 3).map((element) => (
        <CollectionTile
          key={element.Handle}
          title={element.Title}
          handle={element.Handle}
          imgSrc={element.Image.url}
          description={element.Description}
        />
      ))}
    </Container>
  )
}

const CollectionTile = ({
  title,
  description,
  handle,
  imgSrc,
}: {
  title: string
  description: string
  handle: string
  imgSrc: string
}) => {
  return (
    <Box className="group relative max-h-[282px]">
      <Image
        src={imgSrc}
        alt={`${title} collection image`}
        width={600}
        height={300}
        className="h-full w-full object-cover object-center"
      />
      <Box className="absolute left-0 top-0 flex h-full w-full flex-col p-10">
        <Button
          asChild
          className="w-max self-end transition-all duration-500 ease-in-out"
        >
          <LocalizedClientLink href={`/collections/${handle}`}>
            Discover
          </LocalizedClientLink>
        </Button>
        <Box className="mt-auto flex flex-col gap-2 text-static">
          <LocalizedClientLink
            href={`/collections/${handle}`}
            className="w-max"
          >
            <Heading as="h3" className="mt-auto text-3xl text-static">
              {title}
            </Heading>
          </LocalizedClientLink>
          <Text
            size="lg"
            className="line-clamp-2 transition-all duration-500 ease-in-out"
          >
            {description}
          </Text>
        </Box>
      </Box>
    </Box>
  )
}
