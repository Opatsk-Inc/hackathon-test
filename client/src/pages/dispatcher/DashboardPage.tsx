import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Map, MapControls } from "@/components/ui/map";

const MOCK_DELIVERIES = [
  { id: "DLV-001", status: "in_transit", from: "Warehouse Kyiv-A", to: "Distribution Hub Lviv", cargo: "Електроніка — 240 шт", urgency: "critical" },
  { id: "DLV-002", status: "pending", from: "Supplier Depot Odesa", to: "Warehouse Kyiv-B", cargo: "Медикаменти — 80 коробок", urgency: "high" },
  { id: "DLV-003", status: "picked_up", from: "Factory Dnipro", to: "Retail Point Kharkiv", cargo: "Меблі — 12 палет", urgency: "normal" },
  { id: "DLV-004", status: "in_transit", from: "Port Mykolaiv", to: "Cold Storage Kyiv", cargo: "Холодильники — 5 штук", urgency: "high" },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Головний Дашборд</h1>

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* Карта */}
        <div className="flex min-h-[400px] flex-1 items-center justify-center rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/10">
          <Map center={[-74.006, 40.7128]} zoom={11}>
            <MapControls />
          </Map>
        </div>

        {/* Список доставок */}
        <div className="flex-1 rounded-lg border bg-white shadow-sm dark:bg-zinc-900/50">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Активні доставки</h2>
          </div>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">ID</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Звідки</TableHead>
                  <TableHead>Куди</TableHead>
                  <TableHead>Терміновість</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_DELIVERIES.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono font-bold text-xs">{d.id}</TableCell>
                    <TableCell>
                      <Badge variant={d.status as any}>
                        {d.status === "in_transit" ? "В дорозі" :
                          d.status === "pending" ? "Очікує" : "Забрано"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{d.from.replace("Warehouse ", "Склад ")}</TableCell>
                    <TableCell className="text-xs">{d.to.replace("Distribution Hub ", "Хаб ")}</TableCell>
                    <TableCell>
                      <Badge variant={d.urgency as any}>
                        {d.urgency === "critical" ? "Критичний" :
                          d.urgency === "high" ? "Високий" : "Звичайний"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}


