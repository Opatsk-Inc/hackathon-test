import { ArrowDownIcon, ArrowUpIcon, TruckIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loaders"
import { useMyOrders } from "@/features/warehouses"
import { formatDate } from "@/shared/utils/formatDate"
import {
  formatOrderStatus,
  getOrderStatusVariant,
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import type { IOrder } from "@/shared/types"

export default function ManagerOrdersPage() {
  const { orders, isLoading, error, activeTab, setActiveTab } = useMyOrders()

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-medium">Помилка завантаження замовлень</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження замовлень...">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5 text-foreground" />
            <h1 className="text-lg font-bold sm:text-xl">Замовлення</h1>
          </div>
          <span className="text-xs text-muted-foreground">
            {orders.length} од.
          </span>
        </div>

        {/* Segmented tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === "incoming"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownIcon className="h-4 w-4" />
            Вхідні
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("outgoing")}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === "outgoing"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpIcon className="h-4 w-4" />
            Вихідні
          </button>
        </div>

        {/* Order List */}
        {orders.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TruckIcon className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">Немає замовлень</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order: IOrder) => (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-4">
                  {/* Top row: ID + Status + Priority */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className="flex gap-1.5">
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {formatOrderStatus(order.status)}
                      </Badge>
                      <Badge variant={getPriorityVariant(order.priority)}>
                        {formatPriorityLevel(order.priority)}
                      </Badge>
                    </div>
                  </div>

                  {/* Resource info */}
                  <div className="space-y-1.5">
                    <p className="text-sm leading-tight font-medium">
                      {order.resource?.name ?? "Без назви"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Кількість:{" "}
                        <strong className="text-foreground">
                          {order.quantity}
                        </strong>{" "}
                        од.
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {order.provider?.name && (
                        <span>Від: {order.provider.name}</span>
                      )}
                      {order.requester?.name && (
                        <span>Для: {order.requester.name}</span>
                      )}
                      <span>{formatDate(order.createdAt)}</span>
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
