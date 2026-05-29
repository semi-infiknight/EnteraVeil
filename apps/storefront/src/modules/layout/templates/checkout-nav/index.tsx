'use client'

import { useSearchParams } from 'next/navigation'

import { cn } from '@lib/util/cn'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { ArrowLeftIcon, Wordmark } from '@modules/common/icons'

const STEPS = ['address', 'delivery', 'payment'] as const
const STEP_LABELS: Record<(typeof STEPS)[number], string> = {
  address: 'Address',
  delivery: 'Delivery',
  payment: 'Payment',
}

export default function CheckoutNav() {
  const params = useSearchParams()
  const rawStep = params.get('step') ?? 'address'
  const stepIndex = Math.max(
    0,
    STEPS.findIndex((s) => s === rawStep)
  )

  return (
    <Container
      as="nav"
      className="flex flex-col gap-3 !py-3 small:!py-4"
    >
      <Box className="flex items-center justify-between">
        <Box className="small:flex-1">
          <Button variant="tonal" asChild className="w-max">
            <LocalizedClientLink href="/cart">
              <Box className="flex gap-2">
                <ArrowLeftIcon />
                <Text>
                  Back to{' '}
                  <Text as="span" className="hidden small:inline">
                    shopping
                  </Text>{' '}
                  cart
                </Text>
              </Box>
            </LocalizedClientLink>
          </Button>
        </Box>
        <Box className="flex items-center justify-end small:flex-1 small:justify-center">
          <LocalizedClientLink href="/">
            <Wordmark className="h-6 small:h-7" />
          </LocalizedClientLink>
        </Box>
        <div className="hidden flex-1 basis-0 small:flex" />
      </Box>

      {/* Step indicator strip — sits below the wordmark on all viewports */}
      <div className="flex items-center justify-center gap-3 small:gap-5">
        {STEPS.map((s, i) => {
          const state =
            i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'todo'
          return (
            <div key={s} className="flex items-center gap-3 small:gap-5">
              <span
                className={cn(
                  'flex items-center gap-2 transition-colors duration-300',
                  state === 'active'
                    ? 'text-action-primary'
                    : state === 'done'
                      ? 'text-basic-primary'
                      : 'text-secondary/60'
                )}
              >
                <span
                  className={cn(
                    'ev-num flex h-6 w-6 items-center justify-center rounded-full border text-xs transition-all duration-300',
                    state === 'active' &&
                      'border-action-primary bg-action-primary text-primary',
                    state === 'done' &&
                      'border-action-primary bg-action-primary/20 text-action-primary',
                    state === 'todo' &&
                      'border-basic-primary/25 text-basic-primary/40'
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="ev-mono hidden small:inline">
                  {STEP_LABELS[s]}
                </span>
              </span>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    'h-px w-6 transition-colors duration-300 small:w-10',
                    state === 'done' || state === 'active'
                      ? 'bg-action-primary/60'
                      : 'bg-basic-primary/15'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </Container>
  )
}
