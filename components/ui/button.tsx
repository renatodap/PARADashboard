import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all duration-300 ease-smooth focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-para-project/10 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "gradient-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        icon: "w-11 h-11 rounded-full bg-para-project/10 hover:bg-para-project/20 hover:scale-105 transition-all duration-200 ease-smooth",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-2xl text-sm",
        sm: "h-9 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-full px-8 text-base font-semibold uppercase tracking-wider",
        icon: "h-11 w-11",
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
  ({ className, variant, size, ...props }, ref) => {
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
