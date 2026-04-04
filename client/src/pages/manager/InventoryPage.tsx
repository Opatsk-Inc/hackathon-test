import { useState } from "react"
import { ClipboardCheck, Edit2, Save, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useInventoryAdjustment } from "@/features/warehouses"
import type { IInventory } from "@/shared/types"

export default function InventoryPage() {
  const { inventory, isLoading, error, adjustInventory, isAdjusting } =
    useInventoryAdjustment()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQuantity, setEditQuantity] = useState("")
  const [lastAdjusted, setLastAdjusted] = useState<string | null>(null)

  const startEdit = (item: IInventory) => {
    setEditingId(item.id)
    setEditQuantity(String(item.quantityAvailable))
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
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-foreground" />
            <h1 className="text-lg font-bold sm:text-xl">Інвентаризація</h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {inventory.length} од.
          </span>
        </div>

        {/* Instructions */}
        {!editingId && (
          <Card className="border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800/30 dark:bg-amber-900/10">
            <CardContent className="flex items-center gap-2 py-3 text-sm text-amber-800 dark:text-amber-200">
              <Edit2 className="h-4 w-4 shrink-0" />
              <span>Натисніть на кнопку редагування для зміни кількості.</span>
            </CardContent>
          </Card>
        )}

        {/* Inventory List */}
        {inventory.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ClipboardCheck className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Інвентар порожній</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {inventory.map((item: IInventory) => {
              const isEditing = editingId === item.id
              const isHighlighted = lastAdjusted === item.id

              return (
                <Card
                  key={item.id}
                  className={`shadow-sm transition ${
                    isHighlighted
                      ? "border-green-400 bg-green-50 dark:border-green-700 dark:bg-green-900/10"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm leading-tight font-medium">
                          {item.resource?.name ?? "Без назви"}
                        </p>
                        <div className="flex gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">
                              Доступно
                            </span>
                            <p className="text-base font-semibold tabular-nums">
                              {item.quantityAvailable}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Резерв
                            </span>
                            <p className="text-base text-muted-foreground tabular-nums">
                              {item.quantityReserved}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 items-center gap-2">
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
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 gap-1.5 px-3 text-xs"
                            onClick={() => startEdit(item)}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            Змінити
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
