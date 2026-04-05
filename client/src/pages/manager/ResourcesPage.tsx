import { useState, useMemo } from "react"
import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loaders"
import { ManagerItemCard } from "@/components/ui/manager-item-card"
import { KPIStrip } from "@/components/ui/kpi"
import { ManagerHealthToolbar } from "@/components/ui/manager-health-toolbar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResourcesAvailability } from "@/features/warehouses"
import type { IInventory } from "@/shared/types"
import { computeSeverity } from "@/shared/utils/severity"

function getStockBadge(
  qty: number,
  severity?: "critical" | "warning" | "normal"
) {
  if (qty === 0) {
    return (
      <Badge variant="destructive" className="gap-1 px-2.5 py-0.5 text-xs">
        <XCircle className="h-3 w-3" />
        Out of stock
      </Badge>
    )
  }
  if (severity === "critical") {
    return (
      <Badge variant="destructive" className="gap-1 px-2.5 py-0.5 text-xs">
        <AlertTriangle className="h-3 w-3" />
        Critical
      </Badge>
    )
  }
  if (severity === "warning" || qty <= 10) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-500 px-2.5 py-0.5 text-xs text-amber-600"
      >
        <AlertTriangle className="h-3 w-3" />
        Warning
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="gap-1 px-2.5 py-0.5 text-xs">
      <CheckCircle2 className="h-3 w-3" />
      Normal
    </Badge>
  )
}

type QuickFilter = "all" | "critical" | "warning" | "low"

export default function ResourcesPage() {
  const {
    inventory,
    allInventory,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    categories,
  } = useResourcesAvailability()

  const [quickFilter, setQuickFilter] = useState<QuickFilter>("all")

  // Aggregate severity per item using the shared utility
  const itemsWithSeverity = useMemo(() => {
    return inventory
      .filter((item: IInventory) => item.resource !== undefined)
      .map((item: IInventory) => ({
        ...item,
        severity: computeSeverity(item),
      }))
  }, [inventory])

  // Compute severity-based counters
  const criticalCount = itemsWithSeverity.filter(
    (i) => i.severity === "critical"
  ).length
  const warningCount = itemsWithSeverity.filter(
    (i) => i.severity === "warning"
  ).length
  const outOfStock = itemsWithSeverity.filter(
    (i) => i.quantityAvailable === 0
  ).length

  // Compute KPI values from raw inventory
  const totalResources = allInventory.length
  const inStock = allInventory.filter((i) => i.quantityAvailable > 10).length
  const totalAvailable = allInventory.reduce(
    (sum, i) => sum + i.quantityAvailable,
    0
  )

  const kpiCards = [
    {
      label: "Total Resources",
      value: totalResources,
      icon: Layers,
      variant: "default" as const,
    },
    {
      label: "In Stock",
      value: inStock,
      icon: CheckCircle2,
      variant: "success" as const,
    },
    {
      label: "Critical",
      value: criticalCount,
      icon: AlertTriangle,
      variant: criticalCount > 0 ? ("danger" as const) : ("success" as const),
    },
    {
      label: "Total Quantity",
      value: totalAvailable,
      icon: TrendingUp,
      variant: "default" as const,
    },
  ]

  // Sort by severity: critical first, then warning, then normal
  const sortedBySeverity = useMemo(() => {
    return [...itemsWithSeverity].sort((a, b) => {
      if (a.severity !== b.severity) {
        if (a.severity === "critical") return -1
        if (b.severity === "critical") return 1
        if (a.severity === "warning") return -1
        if (b.severity === "warning") return 1
      }
      return a.quantityAvailable - b.quantityAvailable
    })
  }, [itemsWithSeverity])

  // Apply quick filter on sorted items
  const filteredByQuick = useMemo(() => {
    switch (quickFilter) {
      case "critical":
        return sortedBySeverity.filter((item) => item.severity === "critical")
      case "warning":
        return sortedBySeverity.filter((item) => item.severity === "warning")
      case "low":
        return sortedBySeverity.filter(
          (item) => item.severity === "warning" && item.quantityAvailable > 0
        )
      default:
        return sortedBySeverity
    }
  }, [sortedBySeverity, quickFilter])

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        <XCircle className="mx-auto mb-2 h-8 w-8" />
        <p className="font-medium">Loading error</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading resources...">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Package className="h-5 w-5 shrink-0 text-foreground" />
            <h1 className="truncate text-lg font-bold sm:text-xl">Resources</h1>
          </div>
        </div>

        {/* KPI Strip */}
        <KPIStrip cards={kpiCards} />

        {/* Health Toolbar */}
        <ManagerHealthToolbar
          critical={criticalCount}
          warning={warningCount}
          outOfStock={outOfStock}
        />

        {/* Quick Filters (Segmented Controls) */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {[
            { value: "all" as QuickFilter, label: "All" },
            { value: "critical" as QuickFilter, label: "Critical" },
            { value: "warning" as QuickFilter, label: "Warning" },
            { value: "low" as QuickFilter, label: "Low Stock" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setQuickFilter(opt.value)}
              className={`flex-1 rounded-md px-3 py-0.5 text-xs font-medium transition-all ${
                quickFilter === opt.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-11 pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 text-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="h-11 text-sm">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="ok">In stock</SelectItem>
                <SelectItem value="low">Low stock</SelectItem>
                <SelectItem value="out">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resource Cards */}
        {filteredByQuick.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Nothing found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredByQuick.map((item) => (
              <ManagerItemCard
                key={item.id}
                title={item.resource?.name ?? "No name"}
                subtitle={item.resource?.category ?? "—"}
                severity={item.severity}
                available={item.quantityAvailable}
                reserved={item.quantityReserved}
                badge={getStockBadge(item.quantityAvailable, item.severity)}
                className="transition-shadow active:bg-muted/50"
                metricsExtra={<div className="ml-auto border-t pt-2" />}
              />
            ))}
          </div>
        )}
      </div>
    </PageLoader>
  )
}
