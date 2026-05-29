'use client'

import { useState } from 'react'

import useToggleState from '@lib/hooks/use-toggle-state'
import { cn } from '@lib/util/cn'
import { HttpTypes } from '@medusajs/types'
import { Button } from '@modules/common/components/button'
import { MapPinIcon, PlusIcon } from '@modules/common/icons'

import AddressList from '../address-list'
import AddressModalForm from '../address-modal-form'

type AddressBookProps = {
  customer: HttpTypes.StoreCustomer
  region: HttpTypes.StoreRegion
}

const AddressBook: React.FC<AddressBookProps> = ({ customer, region }) => {
  const [addressToEdit, setAddressToEdit] =
    useState<HttpTypes.StoreCustomerAddress | null>(null)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)

  const {
    state: isDialogOpen,
    open: openDialog,
    close: closeDialog,
  } = useToggleState(false)

  const handleAddNewAddress = () => {
    setIsAddingNewAddress(true)
    setAddressToEdit(null)
    openDialog()
  }

  const handleEditAddress = (address: HttpTypes.StoreCustomerAddress) => {
    setIsAddingNewAddress(false)
    setAddressToEdit(address)
    openDialog()
  }

  const hasNoAddresses = customer.addresses.length === 0

  return (
    <>
      <AddressModalForm
        region={region}
        closeDialog={closeDialog}
        isOpenDialog={isDialogOpen}
        address={addressToEdit}
        isAddingNewAddress={isAddingNewAddress}
      />

      <div className="grid w-full grid-cols-1 gap-4 medium:gap-6 xl:ml-auto xl:max-w-[900px]">
        <div className="items-center justify-between medium:flex">
          <h1 className="text-xl medium:text-2xl">Shipping Addresses</h1>
          <Button
            variant="tonal"
            className={cn(
              'hidden medium:flex',
              hasNoAddresses && 'medium:hidden'
            )}
            size="sm"
            leftIcon={<PlusIcon />}
            onClick={handleAddNewAddress}
            data-testid="add-new-address-button"
          >
            Add new address
          </Button>
        </div>
        {hasNoAddresses ? (
          <div className="ev-grain relative mx-auto flex w-full flex-col items-center gap-5 overflow-hidden border border-action-primary/15 bg-ev-elevated px-6 py-12 text-center medium:py-16">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-action-primary/30 bg-primary/40 text-action-primary">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="ev-eyebrow text-action-primary">
                Speed up checkout
              </span>
              <h2 className="ev-display-soft max-w-[18ch] text-2xl text-basic-primary small:text-3xl">
                No addresses saved yet.
              </h2>
              <p className="max-w-[420px] text-md text-secondary">
                Save your ship-to addresses here and checkout will skip the
                form on every future drop.
              </p>
            </div>
            <Button
              size="sm"
              className="!h-11 !px-6"
              onClick={handleAddNewAddress}
              data-testid="add-first-address-button"
            >
              <PlusIcon /> Add your first address
            </Button>
          </div>
        ) : (
          customer.addresses.map((address) => {
            return (
              <AddressList
                address={address}
                openDialog={() => handleEditAddress(address)}
                key={address.id}
                setAddressToEdit={setAddressToEdit}
                region={region}
              />
            )
          })
        )}

        <Button
          variant="tonal"
          className={cn('w-fit medium:hidden', hasNoAddresses && 'hidden')}
          size="sm"
          leftIcon={<PlusIcon />}
          onClick={handleAddNewAddress}
          data-testid="add-new-address-button"
        >
          Add new address
        </Button>
      </div>
    </>
  )
}

export default AddressBook
