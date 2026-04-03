import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Logistics status variants
        pending: "border-transparent bg-amber-400/10 text-amber-500 hover:bg-amber-400/20",
        picked_up: "border-transparent bg-sky-400/10 text-sky-500 hover:bg-sky-400/20",
        in_transit: "border-transparent bg-indigo-400/10 text-indigo-500 hover:bg-indigo-400/20",
        delivered: "border-transparent bg-emerald-400/10 text-emerald-500 hover:bg-emerald-400/20",
        // Urgency variants
        normal: "border-transparent bg-zinc-500/10 text-zinc-400",
        high: "border-orange-500/20 bg-orange-500/15 text-orange-400",
        critical: "border-red-500/30 bg-red-500/15 text-red-600 animate-pulse dark:text-red-400",
        // Special SOS variant
        sos: "relative border-transparent bg-red-100 text-red-600 animate-pulse dark:bg-red-950 dark:text-red-400 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "sos" && (
        <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
      )}
      {props.children}
    </div>
  )
}

export { Badge, badgeVariants }
