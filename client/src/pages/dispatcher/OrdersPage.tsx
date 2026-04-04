import { useOrders } from "@/features/orders"
import type { IOrder } from "@/shared/types"
import { ListOrdered, Search, Filter } from "lucide-react"
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
        Помилка завантаження даних: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження замовлень...">
      <div className="flex flex-col gap-6">
        <div className="mb-2 flex items-center gap-2">
          <ListOrdered className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold">Усі замовлення</h1>
        </div>

        {/* Фільтри */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Пошук по ID, вантажу, складу..."
              className="w-64 bg-card pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-card">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Всі статуси" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі статуси</SelectItem>
              <SelectItem value="pending">Очікує</SelectItem>
              <SelectItem value="approved">Затверджено</SelectItem>
              <SelectItem value="packed">Запаковано</SelectItem>
              <SelectItem value="in_transit">В дорозі</SelectItem>
              <SelectItem value="delivered">Доставлено</SelectItem>
              <SelectItem value="cancelled">Скасовано</SelectItem>
            </SelectContent>
          </Select>
          <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
            <SelectTrigger className="w-48 bg-card">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Всі терміновості" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі терміновості</SelectItem>
              <SelectItem value="normal">Звичайний</SelectItem>
              <SelectItem value="high">Високий</SelectItem>
              <SelectItem value="critical">Критичний</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Таблиця */}
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-28 px-4 text-xs uppercase">
                    ID
                  </TableHead>
                  <TableHead className="text-xs uppercase">Статус</TableHead>
                  <TableHead className="text-xs uppercase">Звідки</TableHead>
                  <TableHead className="text-xs uppercase">Куди</TableHead>
                  <TableHead className="text-xs uppercase">Вантаж</TableHead>
                  <TableHead className="text-xs uppercase">
                    Терміновість
                  </TableHead>
                  <TableHead className="text-xs uppercase">Водій</TableHead>
                  <TableHead className="px-4 text-right text-xs uppercase">
                    Створено
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
                      Нічого не знайдено
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((o: IOrder) => (
                    <TableRow key={o.id}>
                      <TableCell className="px-4 font-mono text-xs font-medium text-foreground">
                        {o.id.split("-")[0].toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getOrderStatusVariant(o.status)}>
                          {formatOrderStatus(o.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {o.provider?.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {o.requester?.name || "—"}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {o.resource?.name}{" "}
                        <span className="ml-2 font-mono text-muted-foreground">
                          {o.quantity} од.
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(o.priority)}>
                          {formatPriorityLevel(o.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
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
          </CardContent>
        </Card>
      </div>
    </PageLoader>
  )
}
