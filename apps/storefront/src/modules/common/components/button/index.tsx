import React, { forwardRef, ReactElement } from 'react'

import { cn } from '@lib/util/cn'
import { cva, VariantProps } from 'cva'

const buttonVariants = cva({
  base: 'rounded-3xl text-md px-4 py-3 transition-all duration-200 ease-out flex gap-2 items-center justify-center will-change-transform active:scale-[0.98] active:duration-75',
  variants: {
    variant: {
      filled:
        'bg-fg-primary hover:bg-fg-primary-hover active:bg-fg-primary-pressed text-inverse-primary',
      ghost:
        'bg-transparent hover:bg-hover active:bg-pressed !rounded-xl !p-4 text-action-primary',
      tonal:
        'bg-fg-secondary text-action-primary hover:bg-fg-secondary-hover active:bg-fg-secondary-pressed [.dark_&]:bg-fg-tertiary [.dark_&]:hover:bg-fg-tertiary-hover [.dark_&]:active:bg-fg-tertiary-pressed',
      text: 'bg-transparent text-action-primary hover:text-action-primary-hover active:text-action-primary-pressed',
      destructive:
        'text-static bg-fg-primary-negative hover:bg-fg-primary-negative-hover active:bg-fg-primary-negative-pressed',
      icon: 'bg-transparent hover:bg-fg-secondary-hover active:bg-fg-secondary-pressed text-action-primary hover:text-action-primary-hover active:text-action-primary-pressed',
      /* Editorial poster — sharp 6px corners, JetBrains Mono caps, gold
         fill on dark text. Anti-Claude rule #2 — primary CTAs in
         editorial slots (PDP add-to-cart, cart checkout). */
      poster:
        '!rounded-md bg-ev-gold text-[rgb(10,10,10)] hover:bg-ev-gold/90 active:bg-ev-gold/80 font-mono uppercase tracking-[0.2em] text-xs font-semibold',
    },
    size: {
      sm: 'h-10',
      md: 'h-12',
    },
    withIcon: {
      true: '',
    },
    isLoading: {
      true: 'pointer-events-none',
    },
    disabled: {
      true: '!bg-disabled !text-disabled pointer-events-none',
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'md',
  },
  compoundVariants: [
    {
      withIcon: true,
      size: 'sm',
      className: '!p-[10px]',
    },
    {
      withIcon: true,
      size: 'md',
      className: '!p-[14px]',
    },
    {
      withIcon: true,
      variant: 'tonal',
      className:
        'bg-secondary text-basic-primary hover:bg-hover active:bg-pressed',
    },
    {
      withIcon: true,
      variant: 'icon',
      disabled: true,
      className: '!bg-transparent',
    },
  ],
})

export interface ButtonProps
  extends React.ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode
  asChild?: boolean
  leftIcon?: ReactElement<any>
  rightIcon?: ReactElement<any>
  withIcon?: boolean
  testId?: string
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      leftIcon,
      rightIcon,
      isLoading,
      className,
      children,
      asChild,
      withIcon,
      testId,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? ButtonSlot : 'button'

    const inner = asChild ? (
      children
    ) : (
      <>
        {isLoading ? (
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-action-primary-inverse border-t-transparent"
            data-testid="spinner"
          />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </>
    )

    const buttonClassName = cn(
      buttonVariants({ ...props, isLoading, withIcon }),
      className
    )

    return (
      <Comp
        ref={ref}
        className={buttonClassName}
        data-testid={testId}
        {...props}
      >
        {inner}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export function ButtonSlot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  if (React.Children.count(children) > 1) {
    throw new Error('Only one child allowed')
  }
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...(children.props as any),
      style: {
        ...props.style,
        ...(children.props as any).style,
      },
      className: cn(props.className, (children.props as any).className),
    })
  }
  return null
}
