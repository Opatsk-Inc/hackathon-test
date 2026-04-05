export type Severity = "critical" | "warning" | "normal"

export const FALLBACK_CRITICAL_THRESHOLD = 10
export const FALLBACK_WARNING_THRESHOLD = 30

export interface ISeverityItem {
  quantityAvailable: number
  criticalThreshold?: number | null
  warningThreshold?: number | null
}

export function computeSeverity(item: ISeverityItem): Severity {
  const criticalThreshold =
    item.criticalThreshold ?? FALLBACK_CRITICAL_THRESHOLD
  const warningThreshold = item.warningThreshold ?? FALLBACK_WARNING_THRESHOLD

  if (item.quantityAvailable <= criticalThreshold) return "critical"
  if (item.quantityAvailable <= warningThreshold) return "warning"
  return "normal"
}

export function getSeverityRank(severity: Severity): number {
  switch (severity) {
    case "critical":
      return 0
    case "warning":
      return 1
    case "normal":
      return 2
  }
}

export interface IInventorySortable {
  id: string
  quantityAvailable: number
  quantityReserved: number
  resource?: { name: string | undefined } | undefined
}

export function sortBySeverity<Item extends IInventorySortable>(
  items: Item[],
  enabled: boolean = true
): Item[] {
  if (!enabled) return items

  return [...items].sort((a, b) => {
    const severityA = computeSeverity(a)
    const severityB = computeSeverity(b)
    const rankA = getSeverityRank(severityA)
    const rankB = getSeverityRank(severityB)

    if (rankA !== rankB) return rankA - rankB

    if (a.quantityAvailable !== b.quantityAvailable) {
      return a.quantityAvailable - b.quantityAvailable
    }

    const nameA = a.resource?.name ?? ""
    const nameB = b.resource?.name ?? ""
    return nameA.localeCompare(nameB)
  })
}

export function getSeverityBadgeVariant(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "destructive"
    case "warning":
      return "outline"
    case "normal":
      return "secondary"
  }
}

export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case "critical":
      return "Critical"
    case "warning":
      return "Warning"
    case "normal":
      return "Normal"
  }
}

export function getSeverityRowHighlight(severity: Severity): string {
  if (severity === "critical") {
    return "border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/20"
  }
  if (severity === "warning") {
    return "border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/10"
  }
  return ""
}
