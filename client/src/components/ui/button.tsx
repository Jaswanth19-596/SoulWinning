import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "btn-gradient shimmer hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-blue-400/20",
        destructive: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 shimmer",
        outline: "glass-subtle hover:glass border-2 hover:border-primary/50 hover:text-primary hover:scale-105 hover:shadow-xl",
        secondary: "glass hover:glass-card hover:scale-105 hover:shadow-xl backdrop-blur-md",
        ghost: "hover:glass-subtle hover:scale-105 transition-all duration-300",
        link: "text-primary underline-offset-4 hover:underline hover:scale-105",
        gradient: "bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to text-white shadow-lg hover:shadow-2xl hover:scale-105 shimmer",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm font-medium",
        sm: "h-9 rounded-xl px-4 text-sm",
        lg: "h-14 rounded-2xl px-8 text-base font-semibold",
        icon: "h-11 w-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }