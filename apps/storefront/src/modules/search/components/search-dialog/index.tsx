import { Fragment, useEffect, useState } from 'react'

import { StoreProduct } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@modules/common/components/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@modules/common/components/tabs'
import { ArrowLeftIcon } from '@modules/common/icons'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'

import { ControlledSearchBox } from '../search-box'
import { RecentSearches } from '../search-dropdown/recent-searches'
import { RecommendedItem } from '../search-dropdown/recommended-item'

export const SearchDialog = ({
  isOpen,
  handleOpenDialogChange,
  countryCode,
  recommendedProducts,
}: {
  countryCode: string
  isOpen: boolean
  handleOpenDialogChange: (value: boolean) => void
  recommendedProducts: StoreProduct[]
}) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 900)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (isLargeScreen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenDialogChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent
          className="!max-h-full !max-w-full !rounded-none bg-primary"
          aria-describedby={undefined}
        >
          {/* Editorial top strip */}
          <div className="flex items-center justify-between border-b border-action-primary/15 px-4 py-3 small:px-6">
            <span className="ev-eyebrow text-action-primary">
              Search the drop
            </span>
            <Button
              withIcon
              variant="text"
              onClick={() => handleOpenDialogChange(false)}
              aria-label="Close search"
              data-testid="search-close"
            >
              <ArrowLeftIcon />
            </Button>
          </div>

          <DialogHeader className="flex items-center gap-3 !border-b-0 !px-4 !py-5 text-xl text-basic-primary small:!px-6 small:text-2xl">
            <ControlledSearchBox
              countryCode={countryCode}
              open={isOpen}
              closeSearch={() => handleOpenDialogChange(false)}
            />
          </DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>Search modal</DialogTitle>
          </VisuallyHidden.Root>
          <DialogBody className="overflow-y-auto">
            <Tabs defaultValue="tab1">
              <TabsList className="flex shrink-0 gap-2 border-b border-action-primary/15 bg-primary px-4 small:px-6">
                <TabsTrigger
                  value="tab1"
                  className="ev-mono px-2 py-3 text-secondary data-[state=active]:text-action-primary border-b-2 border-transparent data-[state=active]:border-action-primary -mb-px"
                >
                  Results
                </TabsTrigger>
                <TabsTrigger
                  value="tab2"
                  className="ev-mono px-2 py-3 text-secondary data-[state=active]:text-action-primary border-b-2 border-transparent data-[state=active]:border-action-primary -mb-px"
                >
                  Recommended
                </TabsTrigger>
              </TabsList>
              <TabsContent
                className="grow p-4 outline-none small:p-6"
                value="tab1"
              >
                <RecentSearches
                  handleOpenDialogChange={handleOpenDialogChange}
                />
              </TabsContent>
              <TabsContent
                className="grow p-4 outline-none small:p-6"
                value="tab2"
              >
                <div className="grid gap-3">
                  {recommendedProducts.map((item, id) => {
                    return (
                      <Fragment key={id}>
                        <RecommendedItem
                          item={item}
                          handleOpenDialogChange={handleOpenDialogChange}
                        />
                      </Fragment>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </DialogBody>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
