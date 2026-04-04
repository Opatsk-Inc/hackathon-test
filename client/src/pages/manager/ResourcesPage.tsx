import {
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loaders"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useResourcesAvailability } from "@/features/warehouses"
import type { IInventory } from "@/shared/types"

function getStockBadge(qty: number) {
  if (qty === 0) {
    return (
      <Badge variant="destructive" className="gap-1 px-2.5 py-0.5 text-xs">
        <XCircle className="h-3 w-3" />
        Немає
      </Badge>
    )
  }
  if (qty <= 10) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-500 px-2.5 py-0.5 text-xs text-amber-600"
      >
        <AlertTriangle className="h-3 w-3" />
        Мало
      </Badge>
    )
  }
  return (
    <Badge
      variant="default"
      className="gap-1 bg-green-600 px-2.5 py-0.5 text-xs"
    >
      <CheckCircle2 className="h-3 w-3" />Є
    </Badge>
  )
}

export default function ResourcesPage() {
  const {
    inventory,
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

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        <XCircle className="mx-auto mb-2 h-8 w-8" />
        <p className="font-medium">Помилка завантаження</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження ресурсів...">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-foreground" />
            <h1 className="text-lg font-bold sm:text-xl">Ресурси</h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {inventory.length} од.
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук..."
              className="h-11 pl-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-11 flex-1 text-sm">
                <SelectValue placeholder="Категорія" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="h-11 flex-1 text-sm">
                <SelectValue placeholder="Наявність" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі</SelectItem>
                <SelectItem value="ok">В наявності</SelectItem>
                <SelectItem value="low">Мало</SelectItem>
                <SelectItem value="out">Немає</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resource Cards */}
        {inventory.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Package className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Нічого не знайдено</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {inventory.map((item: IInventory) => (
              <Card
                key={item.id}
                className="shadow-sm transition-shadow active:bg-muted/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm leading-tight font-medium">
                        {item.resource?.name ?? "Без назви"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.resource?.category ?? "—"}
                      </p>
                    </div>
                    {getStockBadge(item.quantityAvailable)}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-muted-foreground">Доступно</span>
                        <p className="text-base font-semibold tabular-nums">
                          {item.quantityAvailable}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Резерв</span>
                        <p className="text-base text-muted-foreground tabular-nums">
                          {item.quantityReserved}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLoader>
  )
}
