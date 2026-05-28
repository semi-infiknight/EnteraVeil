import { ChangeEvent, forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Input } from '@modules/common/components/input'
import { Label } from '@modules/common/components/label'
import NativeSelect, {
  NativeSelectProps,
} from '@modules/common/components/native-select'

// EnteraVeil currently ships to Bangalore (Karnataka) and Raipur (Chhattisgarh).
// We restrict the province dropdown to those two when country is IN; for any
// other country we fall back to a free-text Input so the form stays usable
// (e.g. test orders against the legacy seed regions).
const IN_PROVINCES: { value: string; label: string }[] = [
  { value: 'Karnataka', label: 'Karnataka (Bangalore)' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh (Raipur)' },
]

type Props = NativeSelectProps & {
  countryCode?: string | null
  error?: string
}

const ProvinceSelect = forwardRef<HTMLSelectElement, Props>(
  (
    {
      countryCode,
      label = 'State / Province',
      placeholder = 'Select state',
      error,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLSelectElement>(null)
    useImperativeHandle<HTMLSelectElement | null, HTMLSelectElement | null>(
      ref,
      () => innerRef.current
    )

    const options = useMemo(() => {
      const cc = (countryCode ?? '').toLowerCase()
      if (cc === 'in') return IN_PROVINCES
      return []
    }, [countryCode])

    if (options.length === 0) {
      // Non-India: fall back to free text so other regions still work.
      return (
        <Input
          label={label as string}
          name={props.name}
          autoComplete="address-level1"
          value={(props.value as string) ?? ''}
          onChange={
            props.onChange as unknown as (e: ChangeEvent<HTMLInputElement>) => void
          }
          error={error}
          data-testid={(props as any)['data-testid']}
        />
      )
    }

    return (
      <Box className="flex flex-col gap-2">
        {label && (
          <Label
            size="sm"
            htmlFor={props.name}
            className={cn('text-secondary', { 'text-negative': !!error })}
          >
            {label as string}
          </Label>
        )}
        <NativeSelect
          ref={innerRef}
          placeholder={placeholder}
          {...props}
        >
          {options.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </NativeSelect>
        {error && <span className="text-sm text-negative">{error}</span>}
      </Box>
    )
  }
)

ProvinceSelect.displayName = 'ProvinceSelect'

export default ProvinceSelect
