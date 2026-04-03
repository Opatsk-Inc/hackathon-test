import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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

const MOCK_ORDERS = [
  { id: "ORD-001", status: "in_transit", from: "Склад Київ-А", to: "Хаб Львів", cargo: "Електроніка — 240 шт", urgency: "critical", driver: "О. Коваленко", createdAt: "2026-04-01" },
  { id: "ORD-002", status: "pending", from: "Депо Одеса", to: "Склад Київ-Б", cargo: "Медикаменти — 80 коробок", urgency: "high", driver: "", createdAt: "2026-04-02" },
  { id: "ORD-003", status: "picked_up", from: "Завод Дніпро", to: "Точка Харків", cargo: "Меблі — 12 палет", urgency: "normal", driver: "І. Бондаренко", createdAt: "2026-04-02" },
  { id: "ORD-004", status: "in_transit", from: "Порт Миколаїв", to: "Холодильник Київ", cargo: "Заморожені — 5 рефрижераторів", urgency: "high", driver: "М. Шевченко", createdAt: "2026-04-03" },
  { id: "ORD-005", status: "delivered", from: "Склад Київ-А", to: "Точка Вінниця", cargo: "Одяг — 320 шт", urgency: "normal", driver: "Т. Мельник", createdAt: "2026-03-30" },
  { id: "ORD-006", status: "pending", from: "Депо Запоріжжя", to: "Склад Київ-А", cargo: "Сировина — 18 тонн", urgency: "critical", driver: "", createdAt: "2026-04-03" },
  { id: "ORD-007", status: "in_transit", from: "Хаб Львів", to: "Точка Івано-Франківськ", cargo: "FMCG — 150 коробок", urgency: "normal", driver: "А. Лисенко", createdAt: "2026-04-03" },
  { id: "ORD-008", status: "delivered", from: "Завод Дніпро", to: "Склад Київ-А", cargo: "Запчастини — 45 ящиків", urgency: "normal", driver: "В. Ткачук", createdAt: "2026-03-28" },
]

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Усі замовлення</h1>

      {/* Фільтри */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Пошук по ID, вантажу..."
          className="w-64"
        />
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Всі статуси" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            <SelectItem value="pending">Очікує</SelectItem>
            <SelectItem value="picked_up">Забрано</SelectItem>
            <SelectItem value="in_transit">В дорозі</SelectItem>
            <SelectItem value="delivered">Доставлено</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Всі терміновості" />
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Звідки</TableHead>
              <TableHead>Куди</TableHead>
              <TableHead>Вантаж</TableHead>
              <TableHead>Терміновість</TableHead>
              <TableHead>Водій</TableHead>
              <TableHead className="text-right">Створено</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_ORDERS.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.id}</TableCell>
                <TableCell>
                  <Badge variant={o.status as any}>
                    {o.status === "pending" ? "Очікує" : 
                     o.status === "picked_up" ? "Забрано" : 
                     o.status === "in_transit" ? "В дорозі" : "Доставлено"}
                  </Badge>
                </TableCell>
                <TableCell>{o.from}</TableCell>
                <TableCell>{o.to}</TableCell>
                <TableCell>{o.cargo}</TableCell>
                <TableCell>
                  <Badge variant={o.urgency as any}>
                    {o.urgency === "normal" ? "Звичайний" : 
                     o.urgency === "high" ? "Високий" : "Критичний"}
                  </Badge>
                </TableCell>
                <TableCell>{o.driver || "—"}</TableCell>
                <TableCell className="text-right">{o.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
