import { useOrders } from "@/features/orders"
import type { IOrder } from "@/shared/types"
import {
  ListOrdered,
  Search,
  Filter,
  Truck,
  Clock3,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatOrderStatus,
  getOrderStatusVariant,
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import { formatDate } from "@/shared/utils/formatDate"

function getStatusIcon(status: string) {
  const normalized = status.toLowerCase()

  if (["in_transit", "en_route", "approved", "packed"].includes(normalized)) {
    return <Truck className="h-3.5 w-3.5 text-blue-500" />
  }
  if (normalized === "pending") {
    return <Clock3 className="h-3.5 w-3.5 text-amber-500" />
  }
  if (normalized === "delivered") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  }
  if (normalized === "cancelled") {
    return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
  }

  return <ListOrdered className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function OrdersPage() {
  const {
    orders,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    urgencyFilter,
    setUrgencyFilter,
  } = useOrders()

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading data: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading orders...">
      <div className="flex flex-col gap-6">
        <div className="mb-2 flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold">All Orders</h1>
        </div>

        {/* Filters */}
        <Card className="border-dashed bg-muted/10 shadow-none">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="relative w-full sm:w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, cargo, warehouse..."
                  className="w-full bg-card pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-card sm:w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All statuses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="in_transit">In transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                <SelectTrigger className="w-full bg-card sm:w-48">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="All priorities" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-md border border-border/60 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
              <span>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {orders.length}
                </span>{" "}
                orders
              </span>
              <span className="hidden sm:inline">
                Filtered live by search and status
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mobile list */}
        <div className="flex flex-col gap-3 sm:hidden">
          {orders.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nothing found
              </CardContent>
            </Card>
          ) : (
            orders.map((o: IOrder) => (
              <Card
                key={`mobile-${o.id}`}
                className="overflow-hidden border border-border/70 bg-card/90 shadow-sm"
              >
                <CardContent className="space-y-3 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-foreground/90">
                        #{o.id.split("-")[0].toUpperCase()}
                      </p>
                      <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {o.resource?.name || "No cargo"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {getStatusIcon(o.status)}
                      <Badge variant={getOrderStatusVariant(o.status)}>
                        {formatOrderStatus(o.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={getPriorityVariant(o.priority)}>
                      {formatPriorityLevel(o.priority)}
                    </Badge>
                    <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {o.quantity} units
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">From</span>
                      <span className="truncate font-medium text-foreground">
                        {o.provider?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">To</span>
                      <span className="truncate font-medium text-foreground">
                        {o.requester?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Driver</span>
                      <span className="truncate font-medium text-foreground">
                        {o.trip?.driverName || "-"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2">
                      <span className="text-muted-foreground">Created</span>
                      <span className="font-medium text-foreground">
                        {formatDate(o.createdAt)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Desktop table */}
        <Card className="hidden p-0 shadow-sm sm:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-28 px-4 text-xs uppercase">
                      ID
                    </TableHead>
                    <TableHead className="text-xs uppercase">Status</TableHead>
                    <TableHead className="text-xs uppercase">From</TableHead>
                    <TableHead className="text-xs uppercase">To</TableHead>
                    <TableHead className="text-xs uppercase">Cargo</TableHead>
                    <TableHead className="text-xs uppercase">
                      Priority
                    </TableHead>
                    <TableHead className="text-xs uppercase">Driver</TableHead>
                    <TableHead className="px-4 text-right text-xs uppercase">
                      Created
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-sm">
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Nothing found
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((o: IOrder, i: number) => (
                      <TableRow
                        className={
                          i % 2 === 1
                            ? "bg-muted/35 transition-colors hover:bg-muted/60"
                            : "transition-colors hover:bg-muted/40"
                        }
                        key={o.id}
                      >
                        <TableCell className="px-4 font-mono text-xs font-medium text-foreground">
                          {o.id.split("-")[0].toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(o.status)}
                            <Badge variant={getOrderStatusVariant(o.status)}>
                              {formatOrderStatus(o.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-sm:hidden">
                          {o.provider?.name || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-sm:hidden">
                          {o.requester?.name || "—"}
                        </TableCell>
                        <TableCell className="font-medium text-foreground">
                          {o.resource?.name}{" "}
                          <span className="ml-2 font-mono text-muted-foreground">
                            {o.quantity} units
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(o.priority)}>
                            {formatPriorityLevel(o.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-sm:hidden">
                          {o.trip?.driverName || "—"}
                        </TableCell>
                        <TableCell className="px-4 text-right text-muted-foreground">
                          {formatDate(o.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLoader>
  )
}
