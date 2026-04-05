import { useState } from "react"
import {
  ClipboardCheck,
  Edit2,
  Save,
  X,
  AlertTriangle,
  TrendingDown,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KPIStrip } from "@/components/ui/kpi"
import { Badge } from "@/components/ui/badge"
import { useInventoryAdjustment } from "@/features/warehouses"
import {
  computeSeverity,
  getSeverityBadgeVariant,
  getSeverityLabel,
  getSeverityRowHighlight,
  sortBySeverity,
} from "@/shared/utils/severity"

export default function InventoryPage() {
  const { inventory, isLoading, error, adjustInventory, isAdjusting } =
    useInventoryAdjustment()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  const [lastAdjusted, setLastAdjusted] = useState<string | null>(null)

  const startEdit = (id: string, quantity: number) => {
    setEditingId(id)
    setEditQuantity(String(quantity))
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditQuantity("")
  }

  const saveAdjustment = (resourceId: string) => {
    const qty = parseInt(editQuantity, 10)
    if (isNaN(qty) || qty < 0) return

    adjustInventory({ resourceId, quantity: qty })
    setLastAdjusted(editingId)
    setTimeout(() => setLastAdjusted(null), 3000)
    cancelEdit()
  }

  const criticalItems = inventory.filter(
    (i) => computeSeverity(i) === "critical"
  ).length
  const warningItems = inventory.filter(
    (i) => computeSeverity(i) === "warning"
  ).length
  const outOfStock = inventory.filter((i) => i.quantityAvailable === 0).length
  const totalReserved = inventory.reduce(
    (sum, i) => sum + i.quantityReserved,
    0
  )
  const totalSKU = inventory.length

  const kpiCards = [
    {
      label: "Всього SKU",
      value: totalSKU,
      icon: ClipboardCheck,
      variant: "default" as const,
    },
    {
      label: "Критичні",
      value: criticalItems,
      icon: AlertTriangle,
      variant: criticalItems > 0 ? ("danger" as const) : ("success" as const),
    },
    {
      label: "В резерві",
      value: totalReserved,
      icon: TrendingDown,
      variant: totalReserved > 20 ? ("warning" as const) : ("default" as const),
    },
  ]

  const sorted = sortBySeverity(inventory, true)

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-medium">Помилка завантаження інвентарю</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження інвентарю...">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {/* Header */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ClipboardCheck className="h-5 w-5 shrink-0 text-foreground" />
            <h1 className="truncate text-lg font-bold sm:text-xl">
              Інвентаризація
            </h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {inventory.length} од.
          </span>
        </div>

        {/* KPI Strip */}
        <KPIStrip cards={kpiCards} />

        {/* Health Toolbar */}
        <div className="flex min-w-0 flex-wrap gap-2">
          <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1.5 text-xs text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
            <span className="truncate font-medium">Critical</span>
            <span className="shrink-0 tabular-nums">{criticalItems}</span>
          </div>
          <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1.5 text-xs text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
            <span className="truncate font-medium">Warning</span>
            <span className="shrink-0 tabular-nums">{warningItems}</span>
          </div>
          <div className="inline-flex min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-muted/60 px-2.5 py-1.5 text-xs text-foreground">
            <span className="h-2 w-2 shrink-0 rounded-full bg-gray-400" />
            <span className="truncate font-medium">Out</span>
            <span className="shrink-0 tabular-nums">{outOfStock}</span>
          </div>
        </div>

        {/* Instructions */}
        {!editingId && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800/30 dark:bg-amber-900/10">
            <CardContent className="flex items-start gap-2 py-3 text-sm text-amber-800 dark:text-amber-200">
              <Edit2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="wrap-break-word">
                Натисніть для зміни кількості.
              </span>
            </CardContent>
          </Card>
        )}

        {/* Inventory List */}
        {sorted.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardCheck className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Інвентар порожній</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((item) => {
              const isEditing = editingId === item.id
              const isHighlighted = lastAdjusted === item.id
              const severity = computeSeverity(item)

              return (
                <Card
                  key={item.id}
                  className={`shadow-sm transition ${
                    isHighlighted
                      ? "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/10"
                      : getSeverityRowHighlight(severity)
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <p className="truncate text-sm leading-tight font-medium">
                            {item.resource?.name ?? "Без назви"}
                          </p>
                          <Badge
                            variant={
                              getSeverityBadgeVariant(severity) as
                                | "destructive"
                                | "outline"
                                | "secondary"
                            }
                            className="shrink-0 px-2 py-0 text-[10px]"
                          >
                            {getSeverityLabel(severity)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${
                                severity === "critical"
                                  ? "w-1/4 bg-red-500"
                                  : severity === "warning"
                                    ? "w-2/4 bg-amber-500"
                                    : "w-full bg-emerald-500"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              severity === "critical"
                                ? "text-red-600 dark:text-red-400"
                                : severity === "warning"
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {severity === "critical"
                              ? "Критично"
                              : severity === "warning"
                                ? "Середньо"
                                : "Норма"}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Доступно
                            </span>
                            <p
                              className={`text-base font-semibold tabular-nums ${
                                severity === "critical"
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              }`}
                            >
                              {item.quantityAvailable}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              В резерві
                            </span>
                            <p className="text-base text-muted-foreground tabular-nums">
                              {item.quantityReserved}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 flex-col items-center gap-1.5 sm:flex-row">
                        {isEditing ? (
                          <>
                            <Input
                              type="number"
                              min={0}
                              className="h-10 w-20 text-sm"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              autoFocus
                            />
                            <div className="flex gap-1.5">
                              <Button
                                variant="default"
                                size="sm"
                                disabled={isAdjusting}
                                onClick={() => saveAdjustment(item.resourceId)}
                                className="h-10 w-10 p-0"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={cancelEdit}
                                className="h-10 w-10 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 gap-1.5 px-3 text-xs"
                            onClick={() =>
                              startEdit(item.id, item.quantityAvailable)
                            }
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span className="truncate">Змінити</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Success message */}
                    {isHighlighted && (
                      <p className="mt-2 text-xs font-medium text-green-700 dark:text-green-400">
                        ✓ Кількість оновлено
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </PageLoader>
  )
}
