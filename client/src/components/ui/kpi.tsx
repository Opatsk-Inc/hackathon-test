import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface IKPICard {
  label: string
  value: number | string
  icon?: LucideIcon
  iconColor?: string
  trend?: {
    value: number
    positive?: boolean
  }
  variant?: "default" | "success" | "warning" | "danger"
}

const VARIANT_COLORS: Record<
  string,
  { bg: string; icon: string; trend: string }
> = {
  default: { bg: "bg-primary/10", icon: "text-primary", trend: "text-primary" },
  success: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-500",
    trend: "text-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/10",
    icon: "text-amber-500",
    trend: "text-amber-500",
  },
  danger: { bg: "bg-red-500/10", icon: "text-red-500", trend: "text-red-500" },
}

export function KPICard({
  label,
  value,
  icon: Icon,
  iconColor,
  trend,
  variant = "default",
}: IKPICard) {
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.default
  const iconClassName = iconColor || colors.icon

  return (
    <div className="bg-surface min-w-0 rounded-xl border border-border p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight tabular-nums sm:text-2xl">
            {value}
          </p>
          {trend && (
            <p className={cn("text-xs font-medium", colors.trend)}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("rounded-lg p-2.5", colors.bg)}>
            <Icon className={cn("h-5 w-5", iconClassName)} />
          </div>
        )}
      </div>
    </div>
  )
}

interface KPIStripProps {
  cards: IKPICard[]
  className?: string
}

export function KPIStrip({ cards, className }: KPIStripProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3",
        className
      )}
    >
      {cards.map((card, i) => (
        <KPICard key={i} {...card} />
      ))}
    </div>
  )
}
