import type { ReactNode } from "react"
import { getSeverityLabel, getSeverityRowHighlight } from "@/shared/utils/severity"
import { cn } from "@/lib/utils"

export type ManagerItemSeverity = "critical" | "warning" | "normal"

export interface ManagerItemCardProps {
  /** Primary title text */
  title: string
  /** Optional subtitle (e.g. category) */
  subtitle?: string
  /** Severity level for styling */
  severity: ManagerItemSeverity
  /** Available quantity */
  available: number
  /** Reserved quantity */
  reserved?: number
  /** Badge node (e.g. stock status badge) */
  badge?: ReactNode
  /** Actions node (e.g. edit button) */
  actions?: ReactNode
  /** Show severity progress bar */
  progress?: boolean
  /** Compact mode for tighter spacing */
  compact?: boolean
  /** Additional outer class */
  className?: string
  /** Custom card component (defaults to a div wrapper) */
  as?: React.ElementType
  /** Extra metrics slot */
  metricsExtra?: ReactNode
}

function severityWidth(severity: ManagerItemSeverity): string {
  switch (severity) {
    case "critical":
      return "w-1/4"
    case "warning":
      return "w-2/4"
    case "normal":
      return "w-full"
  }
}

function severityBarColor(severity: ManagerItemSeverity): string {
  switch (severity) {
    case "critical":
      return "bg-red-500"
    case "warning":
      return "bg-amber-500"
    case "normal":
      return "bg-emerald-500"
  }
}

function severityTextColor(severity: ManagerItemSeverity): string {
  switch (severity) {
    case "critical":
      return "text-red-600 dark:text-red-400"
    case "warning":
      return "text-amber-600 dark:text-amber-400"
    case "normal":
      return "text-emerald-600 dark:text-emerald-400"
  }
}

/**
 * Shared manager item card used across Inventory, Resources, and other manager pages.
 * Provides consistent layout for title, badge, metrics (available/reserved), severity bar, and actions.
 */
export function ManagerItemCard({
  title,
  subtitle,
  severity,
  available,
  reserved,
  badge,
  actions,
  progress = true,
  compact = false,
  className,
  as: Component = "div",
  metricsExtra,
}: ManagerItemCardProps) {
  const padding = compact ? "p-2" : "p-3 sm:p-4"

  return (
    <Component
      className={cn(
        "rounded-lg border shadow-sm",
        getSeverityRowHighlight(severity),
        className
      )}
    >
      <div className={cn("flex flex-col gap-2", padding)}>
        {/* Header: title + badge */}
        <div className="flex min-w-0 items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm leading-tight font-medium">{title}</p>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {badge && <div className="shrink-0">{badge}</div>}
        </div>

        {/* Severity progress bar + label */}
        {progress && (
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  severityWidth(severity),
                  severityBarColor(severity)
                )}
              />
            </div>
            <span className={cn("text-xs font-medium", severityTextColor(severity))}>
              {getSeverityLabel(severity)}
            </span>
          </div>
        )}

        {/* Metrics: available / reserved */}
        <div className="flex gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Available</span>
            <p
              className={cn(
                "text-base font-semibold tabular-nums",
                severity === "critical" ? severityTextColor(severity) : ""
              )}
            >
              {available}
            </p>
          </div>
          {reserved !== undefined && (
            <div>
              <span className="text-muted-foreground">Reserved</span>
              <p className="text-base text-muted-foreground tabular-nums">
                {reserved}
              </p>
            </div>
          )}
          {metricsExtra}
        </div>

        {/* Actions slot */}
        {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
      </div>
    </Component>
  )
}
