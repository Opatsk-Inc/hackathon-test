import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const MOCK_WAREHOUSES = [
  {
    id: "WH-001",
    name: "Склад Київ-А",
    address: "вул. Промислова, 12, Київ",
    occupancy: 78,
    freeSlots: 44,
    activeShipments: 5,
    resources: [
      { name: "Електроніка", quantity: 1200, unit: "шт" },
      { name: "Медикаменти", quantity: 340, unit: "коробок" },
      { name: "Одяг", quantity: 890, unit: "шт" },
    ],
  },
  {
    id: "WH-002",
    name: "Склад Київ-Б",
    address: "вул. Логістична, 5, Київ",
    occupancy: 45,
    freeSlots: 110,
    activeShipments: 2,
    resources: [
      { name: "Сировина", quantity: 50, unit: "тонн" },
      { name: "Запчастини", quantity: 620, unit: "ящиків" },
    ],
  },
  {
    id: "WH-003",
    name: "Хаб Львів",
    address: "вул. Стрийська, 98, Львів",
    occupancy: 62,
    freeSlots: 76,
    activeShipments: 3,
    resources: [
      { name: "FMCG", quantity: 2400, unit: "коробок" },
      { name: "Меблі", quantity: 85, unit: "палет" },
    ],
  },
  {
    id: "WH-004",
    name: "Депо Одеса",
    address: "вул. Портова, 22, Одеса",
    occupancy: 91,
    freeSlots: 18,
    activeShipments: 7,
    resources: [
      { name: "Заморожені продукти", quantity: 160, unit: "рефрижераторів" },
      { name: "Зерно", quantity: 300, unit: "тонн" },
      { name: "Медикаменти", quantity: 120, unit: "коробок" },
    ],
  },
]

export default function WarehousesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Склади та ресурси</h1>

      <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {MOCK_WAREHOUSES.map((w) => (
          <div
            key={w.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 bg-white dark:bg-zinc-900/50"
          >
            <h3 className="text-lg font-semibold">{w.name}</h3>
            <p className="mb-3 text-[13px] text-zinc-400">{w.address}</p>

            <div className="mb-3 text-[13px]">
              <div className="flex justify-between border-b border-zinc-100 py-1 dark:border-zinc-800">
                <span>Завантаженість</span>
                <strong>{w.occupancy}%</strong>
              </div>
              <div className="flex justify-between border-b border-zinc-100 py-1 dark:border-zinc-800">
                <span>Вільних місць</span>
                <strong>{w.freeSlots}</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>Активних відправок</span>
                <strong>{w.activeShipments}</strong>
              </div>
            </div>

            <h4 className="mb-2 text-xs uppercase text-zinc-400">Ресурси</h4>
            <Table className="text-[13px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="h-8 px-2 py-1 text-[11px] uppercase">Назва</TableHead>
                  <TableHead className="h-8 px-2 py-1 text-[11px] uppercase text-right">К-сть</TableHead>
                  <TableHead className="h-8 px-2 py-1 text-[11px] uppercase">Од.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {w.resources.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell className="px-2 py-1">{r.name}</TableCell>
                    <TableCell className="px-2 py-1 text-right font-medium">{r.quantity}</TableCell>
                    <TableCell className="px-2 py-1 text-zinc-400">{r.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  )
}
