import React from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { getVariantColor } from '@lib/util/get-variant-color'
import { HttpTypes } from '@medusajs/types'
import { Text } from '@modules/common/components/text'
import { VariantColor } from 'types/strapi'

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  variantsColors: VariantColor[]
  title: string
  disabled: boolean
  'data-testid'?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  variantsColors,
  title,
  'data-testid': dataTestId,
  disabled,
}) => {
  const filteredOptions = option.values
    ?.sort((a, b) => a.value.localeCompare(b.value))
    .map((v) => v.value)

  return (
    <div className="flex flex-col gap-y-3">
      <Text as="p" className="text-md">
        <span className="ev-eyebrow text-action-primary">{title}</span>
        {current && (
          <Text as="span" className="ml-3 text-basic-primary">
            {current}
          </Text>
        )}
      </Text>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions?.map((v) => {
          const color = getVariantColor(v, variantsColors)
          const image = color?.Image
          const hex = color?.Color
          const isSelected = v === current

          // Common ring classes for selected state — gold inset ring + offset
          const ringClasses = isSelected
            ? 'border-action-primary shadow-[0_0_0_2px_rgb(var(--bg-action-primary)/0.5)] scale-[1.02]'
            : 'border-basic-primary/25 hover:border-action-primary/60'

          if (image) {
            return (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn(
                  'relative h-12 w-12 overflow-hidden rounded-full border-2 transition-all duration-200',
                  ringClasses
                )}
                aria-label={`Choose ${title} ${v}`}
                aria-pressed={isSelected}
                disabled={disabled}
                data-testid="option-button"
              >
                <Image
                  src={image.url}
                  alt={image.alternativeText ?? `${title} ${v}`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </button>
            )
          }

          if (hex) {
            return (
              <button
                onClick={() => updateOption(option.id, v)}
                key={v}
                className={cn(
                  'h-12 w-12 rounded-full border-2 transition-all duration-200',
                  ringClasses
                )}
                aria-label={`Choose ${title} ${v}`}
                aria-pressed={isSelected}
                style={{ backgroundColor: hex }}
                disabled={disabled}
                data-testid="option-button"
              />
            )
          }

          // Text pill — for sizes / fits / anything that isn't a colour swatch.
          // Min 44×44 tap target; gold ring + faint background-shift on select.
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={cn(
                'ev-mono min-w-[48px] h-12 px-4 rounded-full border-2 transition-all duration-200',
                isSelected
                  ? 'border-action-primary bg-action-primary/15 text-action-primary shadow-[0_0_0_2px_rgb(var(--bg-action-primary)/0.4)] scale-[1.02]'
                  : 'border-basic-primary/25 text-basic-primary/85 hover:border-action-primary/60 hover:text-basic-primary'
              )}
              aria-label={`Choose ${title} ${v}`}
              aria-pressed={isSelected}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
