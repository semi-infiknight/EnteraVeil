import { cn } from '@lib/util/cn'
import { CheckThinIcon } from '@modules/common/icons'
import { cva, VariantProps } from 'cva'

const stepperVariants = cva({
  base: 'ev-num border rounded-full text-base h-[36px] w-[36px] flex items-center justify-center transition-all duration-300 ease-out',
  variants: {
    state: {
      incomplete:
        'border-basic-primary/30 text-basic-primary/60 bg-transparent',
      focussed:
        'text-primary bg-action-primary border-action-primary shadow-[0_0_0_4px_rgb(var(--bg-action-primary)/0.18)]',
      completed:
        'text-action-primary bg-action-primary/15 border-action-primary',
    },
  },
  defaultVariants: {
    state: 'incomplete',
  },
})

interface StepperProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof stepperVariants> {
  children?: React.ReactNode
}

export function Stepper({ state, className, ...props }: StepperProps) {
  return (
    <div className={cn(stepperVariants({ state }), className)} {...props}>
      {state === 'completed' ? (
        <CheckThinIcon className="h-[20px] w-[20px] text-action-primary" />
      ) : (
        props.children
      )}
    </div>
  )
}
