import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ListOrdered, Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  })

  // Filter functionality
  const filteredOrders = orders.filter((o: any) => {
    // Search query match
    const q = searchQuery.toLowerCase()
    const matchesSearch = 
      o.id.toLowerCase().includes(q) || 
      (o.resource?.name || "").toLowerCase().includes(q) ||
      (o.provider?.name || "").toLowerCase().includes(q) ||
      (o.requester?.name || "").toLowerCase().includes(q)

    // Status filter match
    const matchesStatus = statusFilter === "all" || o.status.toLowerCase() === statusFilter

    // Urgency match
    const matchesUrgency = urgencyFilter === "all" || o.priority.toLowerCase() === urgencyFilter

    return matchesSearch && matchesStatus && matchesUrgency
  })

  const getStatusLabel = (status: string) => {
    const s = status.toLowerCase()
    if (s === "pending") return "Очікує"
    if (s === "approved") return "Затверджено"
    if (s === "packed") return "Запаковано"
    if (s === "in_transit") return "В дорозі"
    if (s === "delivered") return "Доставлено"
    if (s === "cancelled") return "Скасовано"
    return status
  }

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "pending" | "in_transit" | "delivered" => {
    const s = status.toLowerCase()
    if (s === "pending") return "pending"
    if (s === "in_transit") return "in_transit"
    if (s === "delivered") return "delivered"
    if (s === "cancelled" || s === "sos") return "destructive"
    return "outline"
  }

  const getUrgencyLabel = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === "normal") return "Звичайний"
    if (p === "high") return "Високий"
    if (p === "critical") return "Критичний"
    return priority
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 mb-2">
        <ListOrdered className="h-6 w-6 text-foreground" />
        <h1 className="text-2xl font-bold">Усі замовлення</h1>
      </div>

      {/* Фільтри */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
                <TableHead className="w-28 text-xs uppercase px-4">ID</TableHead>
                <TableHead className="text-xs uppercase">Статус</TableHead>
                <TableHead className="text-xs uppercase">Звідки</TableHead>
                <TableHead className="text-xs uppercase">Куди</TableHead>
                <TableHead className="text-xs uppercase">Вантаж</TableHead>
                <TableHead className="text-xs uppercase">Терміновість</TableHead>
                <TableHead className="text-xs uppercase">Водій</TableHead>
                <TableHead className="text-right text-xs uppercase px-4">Створено</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-sm">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Завантаження...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Нічого не знайдено</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium font-mono text-xs px-4 text-foreground">{o.id.split('-')[0].toUpperCase()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(o.status) as any}>
                        {getStatusLabel(o.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.provider?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{o.requester?.name || "—"}</TableCell>
                    <TableCell className="font-medium text-foreground">{o.resource?.name} <span className="text-muted-foreground font-mono ml-2">{o.quantity} од.</span></TableCell>
                    <TableCell>
                      <Badge variant={o.priority.toLowerCase() as any}>
                        {getUrgencyLabel(o.priority)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{o.trip?.driverName || "—"}</TableCell>
                    <TableCell className="text-right text-muted-foreground px-4">
                      {new Date(o.createdAt).toLocaleDateString("uk-UA")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
