interface ManagerHealthToolbarProps {
  critical: number
  warning: number
  outOfStock: number
  criticalFirst?: boolean
  onCriticalFirstChange?: (value: boolean) => void
}

function StatPill({
  label,
  value,
  dotColor,
}: {
  label: string
  value: number
  dotColor: string
}) {
  return (
    <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1.5 text-xs text-foreground">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor}`} />
      <span className="truncate font-medium">{label}</span>
      <span className="shrink-0 tabular-nums">{value}</span>
    </div>
  )
}

export function ManagerHealthToolbar({
  critical,
  warning,
  outOfStock,
  criticalFirst,
  onCriticalFirstChange,
}: ManagerHealthToolbarProps) {
  const showToggle = onCriticalFirstChange !== undefined

  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Stat pills row */}
      <div className="flex min-w-0 flex-wrap gap-2">
        <StatPill label="Critical" value={critical} dotColor="bg-red-500" />
        <StatPill label="Warning" value={warning} dotColor="bg-amber-500" />
        <StatPill label="Out" value={outOfStock} dotColor="bg-gray-400" />
      </div>

      {/* Toggle row (Inventory only) */}
      {showToggle && criticalFirst !== undefined && (
        <div className="flex items-center gap-2 sm:justify-end">
          <button
            type="button"
            role="switch"
            aria-checked={criticalFirst}
            onClick={() => onCriticalFirstChange(!criticalFirst)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
              criticalFirst ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                criticalFirst ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Critical first
          </span>
        </div>
      )}
    </div>
  )
}
