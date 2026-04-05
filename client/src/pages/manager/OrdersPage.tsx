import {
  ArrowDownIcon,
  ArrowUpIcon,
  TruckIcon,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageLoader } from "@/components/ui/loaders"
import { KPIStrip } from "@/components/ui/kpi"
import { useMyOrders } from "@/features/warehouses"
import { formatDate } from "@/shared/utils/formatDate"
import {
  formatOrderStatus,
  getOrderStatusVariant,
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import { OrderEditDialog } from "@/features/orders/components/OrderEditDialog"
import type { IOrder } from "@/shared/types"
import { useState } from "react"

function getSLABadge(order: IOrder) {
  const now = new Date()
  const created = new Date(order.createdAt)
  const hoursSince = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  )

  // SLA thresholds: <4h green, <24h amber, >24h red
  if (hoursSince < 4) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <Clock className="h-3 w-3" />
        {hoursSince}h
      </span>
    )
  }
  if (hoursSince < 24) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        {hoursSince}h
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
      <AlertCircle className="h-3 w-3" />
      {hoursSince}h
    </span>
  )
}

function getStatusIndicator(status: string) {
  const s = status.toLowerCase()
  if (s === "delivered")
    return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
  if (s === "in_transit" || s === "en_route")
    return <TruckIcon className="h-3.5 w-3.5 text-blue-500" />
  if (s === "pending") return <Clock className="h-3.5 w-3.5 text-amber-500" />
  if (s === "cancelled")
    return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
  return null
}

export default function ManagerOrdersPage() {
  const {
    orders,
    allOrders,
    incomingOrders,
    outgoingOrders,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refetch,
  } = useMyOrders()

  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleEditClick = (order: IOrder) => {
    setEditingOrder(order)
    setIsEditDialogOpen(true)
  }

  const pendingCount = allOrders.filter(
    (o) => o.status.toLowerCase() === "pending"
  ).length
  const inTransitCount = allOrders.filter((o) =>
    ["in_transit", "en_route"].includes(o.status.toLowerCase())
  ).length
  const deliveredCount = allOrders.filter(
    (o) => o.status.toLowerCase() === "delivered"
  ).length

  const kpiCards = [
    {
      label: "Total",
      value: allOrders.length,
      icon: TruckIcon,
      variant: "default" as const,
    },
    {
      label: "Pending",
      value: pendingCount,
      icon: Clock,
      variant: pendingCount > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "In Transit",
      value: inTransitCount,
      icon: TruckIcon,
      variant: "default" as const,
    },
    {
      label: "Delivered",
      value: deliveredCount,
      icon: CheckCircle,
      variant: "success" as const,
    },
  ]

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center text-destructive">
        <p className="font-medium">Error loading orders</p>
        <p className="text-sm opacity-80">{(error as Error).message}</p>
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading orders...">
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <TruckIcon className="h-5 w-5 shrink-0 text-foreground" />
            <h1 className="truncate text-lg font-bold sm:text-xl">Orders</h1>
          </div>
        </div>

        {/* KPI Strip */}
        <KPIStrip cards={kpiCards} />

        {/* Segmented tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("incoming")}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-2 py-2.5 text-sm font-medium transition-all sm:gap-1.5 sm:px-3 ${
              activeTab === "incoming"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowDownIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Incoming</span>
            {incomingOrders.length > 0 && (
              <span className="ml-0.5 shrink-0 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
                {incomingOrders.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("outgoing")}
            className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-2 py-2.5 text-sm font-medium transition-all sm:gap-1.5 sm:px-3 ${
              activeTab === "outgoing"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowUpIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">Outgoing</span>
            {outgoingOrders.length > 0 && (
              <span className="ml-0.5 shrink-0 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
                {outgoingOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Order List */}
        {orders.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TruckIcon className="mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.map((order: IOrder) => (
              <Card key={order.id} className="shadow-sm">
                <CardContent className="p-3 sm:p-4">
                  {/* Top row: ID + Status + Priority */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <div className="flex min-w-0 flex-wrap items-center gap-1">
                      {getStatusIndicator(order.status)}
                      <Badge
                        variant={getOrderStatusVariant(order.status)}
                        className="shrink-0"
                      >
                        {formatOrderStatus(order.status)}
                      </Badge>
                      <Badge
                        variant={getPriorityVariant(order.priority)}
                        className="shrink-0"
                      >
                        {formatPriorityLevel(order.priority)}
                      </Badge>
                      {getSLABadge(order)}
                    </div>
                  </div>

                  {/* Resource info */}
                  <div className="space-y-1.5">
                    <p className="text-sm leading-tight font-medium wrap-break-word">
                      {order.resource?.name ?? "No name"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Qty:{" "}
                        <strong className="text-foreground">
                          {order.quantity}
                        </strong>{" "}
                        units
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {order.provider?.name && (
                        <span className="wrap-break-word">
                          From: {order.provider.name}
                        </span>
                      )}
                      {order.requester?.name && (
                        <span className="wrap-break-word">
                          For: {order.requester.name}
                        </span>
                      )}
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {order.requesterId === order.requester?.id &&
                    ["PENDING", "APPROVED", "PACKED"].includes(order.status) &&
                    activeTab === "outgoing" && (
                      <div className="mt-3 flex justify-end border-t border-muted pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleEditClick(order)}
                        >
                          Edit Request
                        </Button>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <OrderEditDialog
          order={editingOrder}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={() => refetch?.()}
        />
      </div>
    </PageLoader>
  )
}
