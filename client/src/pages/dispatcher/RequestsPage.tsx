import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const MOCK_REQUESTS = [
  {
    id: "REQ-001",
    fromWarehouse: "Депо Одеса",
    toWarehouse: "Склад Київ-А",
    cargo: "Медикаменти",
    quantity: "80 коробок",
    urgency: "critical",
    status: "pending",
    contact: "Дмитро К.",
    createdAt: "2026-04-03, 14:20",
  },
  {
    id: "REQ-002",
    fromWarehouse: "Хаб Львів",
    toWarehouse: "Склад Київ-Б",
    cargo: "FMCG",
    quantity: "500 коробок",
    urgency: "high",
    status: "pending",
    contact: "Олена М.",
    createdAt: "2026-04-03, 11:45",
  },
  {
    id: "REQ-003",
    fromWarehouse: "Завод Дніпро",
    toWarehouse: "Хаб Львів",
    cargo: "Меблі",
    quantity: "30 палет",
    urgency: "normal",
    status: "picked_up",
    contact: "Іван Б.",
    createdAt: "2026-04-02, 18:30",
  },
  {
    id: "REQ-004",
    fromWarehouse: "Склад Київ-А",
    toWarehouse: "Депо Одеса",
    cargo: "Електроніка",
    quantity: "120 шт",
    urgency: "high",
    status: "delivered",
    contact: "Марина Ш.",
    createdAt: "2026-04-02, 09:15",
  },
  {
    id: "REQ-005",
    fromWarehouse: "Депо Запоріжжя",
    toWarehouse: "Склад Київ-А",
    cargo: "Сировина",
    quantity: "18 тонн",
    urgency: "critical",
    status: "pending",
    contact: "Петро Л.",
    createdAt: "2026-04-03, 16:00",
  },
]

export default function RequestsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold font-sans">Вхідні запити</h1>
        <p className="text-zinc-400">Запити від інших складів на переміщення ресурсів</p>
      </div>

      <div className="flex flex-col gap-3">
        {MOCK_REQUESTS.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold">{r.id}</span>
                <Badge variant={r.urgency as any}>
                  {r.urgency === "critical" ? "Критичний" : 
                   r.urgency === "high" ? "Високий" : "Звичайний"}
                </Badge>
                <Badge variant={r.status as any}>
                  {r.status === "pending" ? "Новий" : 
                   r.status === "picked_up" ? "Забрано" : "Доставлено"}
                </Badge>
              </div>
              <p className="text-sm font-sans">
                <span className="font-semibold">{r.fromWarehouse}</span>
                <span className="mx-2 text-zinc-400">→</span>
                <span className="font-semibold">{r.toWarehouse}</span>
              </p>
              <p className="text-[13px] text-zinc-500 font-sans">
                {r.cargo} · {r.quantity}
              </p>
              <p className="text-xs text-zinc-400 font-sans">
                {r.createdAt} · Контакт: {r.contact}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-green-500 text-green-500 hover:bg-green-50 dark:border-green-500/50 dark:text-green-400 dark:hover:bg-green-950/30"
              >
                Прийняти
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-zinc-400 dark:text-zinc-500"
              >
                Відхилити
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
