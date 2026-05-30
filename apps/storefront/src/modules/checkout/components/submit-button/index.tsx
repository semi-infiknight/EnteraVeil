'use client'

import React from 'react'

import { Button } from '@modules/common/components/button'
import { useFormStatus } from 'react-dom'

export function SubmitButton({
  children,
  // Default the checkout submit buttons to the editorial poster variant
  // — sharp 6px corners, JetBrains Mono caps, gold fill. Anti-Claude
  // rule #2 (primary CTAs in editorial slots aren't pill buttons).
  variant = 'poster',
  className,
  isLoading,
  'data-testid': dataTestId,
}: {
  children: React.ReactNode
  variant?:
    | 'filled'
    | 'ghost'
    | 'tonal'
    | 'text'
    | 'destructive'
    | 'icon'
    | 'poster'
    | null
  className?: string
  isLoading?: boolean
  'data-testid'?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      className={className}
      type="submit"
      isLoading={isLoading ?? pending}
      variant={(variant as any) || 'poster'}
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}
