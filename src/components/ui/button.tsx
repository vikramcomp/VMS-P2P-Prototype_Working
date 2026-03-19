import * as React from "react"
import { cn } from "@/utils/cn"
import { DESIGN_SYSTEM } from "@/utils/design-system"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'vms-button inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-vendor-600 text-white shadow hover:bg-vendor-700': variant === 'default',
            'bg-error-600 text-white shadow-sm hover:bg-error-700': variant === 'destructive',
            'border border-neutral-300 bg-white hover:bg-neutral-50 hover:text-neutral-900': variant === 'outline',
            'bg-neutral-100 text-neutral-900 shadow-sm hover:bg-neutral-200': variant === 'secondary',
            'hover:bg-neutral-100 hover:text-neutral-900': variant === 'ghost',
            'text-vendor-600 underline-offset-4 hover:underline': variant === 'link',
          },
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }