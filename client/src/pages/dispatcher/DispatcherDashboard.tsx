import { useState } from "react"
import {
  MapPin,
  Truck,
  Route,
  User,
  Package,
  AlertTriangle,
  ChevronDown,
  Search,
  Bell,
  Settings,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Urgency = "normal" | "high" | "critical"
type DeliveryStatus = "pending" | "picked_up" | "in_transit" | "delivered"

interface Delivery {
  id: string
  status: DeliveryStatus
  from: string
  to: string
  cargo: string
  urgency: Urgency
  driver?: string
  eta?: string
}

const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "DLV-001",
    status: "in_transit",
    from: "Warehouse Kyiv-A",
    to: "Distribution Hub Lviv",
    cargo: "Electronics — 240 units",
    urgency: "critical",
    driver: "O. Kovalenko",
    eta: "14:30",
  },
  {
    id: "DLV-002",
    status: "pending",
    from: "Supplier Depot Odesa",
    to: "Warehouse Kyiv-B",
    cargo: "Medical Supplies — 80 boxes",
    urgency: "high",
    driver: undefined,
    eta: undefined,
  },
  {
    id: "DLV-003",
    status: "picked_up",
    from: "Factory Dnipro",
    to: "Retail Point Kharkiv",
    cargo: "Furniture — 12 pallets",
    urgency: "normal",
    driver: "I. Bondarenko",
    eta: "17:45",
  },
  {
    id: "DLV-004",
    status: "in_transit",
    from: "Port Mykolaiv",
    to: "Cold Storage Kyiv",
    cargo: "Frozen Goods — 5 reefer",
    urgency: "high",
    driver: "M. Shevchenko",
    eta: "16:10",
  },
  {
    id: "DLV-005",
    status: "delivered",
    from: "Warehouse Kyiv-A",
    to: "Retail Point Vinnytsia",
    cargo: "Clothing — 320 units",
    urgency: "normal",
    driver: "T. Melnyk",
    eta: "—",
  },
  {
    id: "DLV-006",
    status: "pending",
    from: "Supplier Depot Zaporizhzhia",
    to: "Warehouse Kyiv-A",
    cargo: "Raw Materials — 18 tons",
    urgency: "critical",
    driver: undefined,
    eta: undefined,
  },
  {
    id: "DLV-007",
    status: "in_transit",
    from: "Distribution Hub Lviv",
    to: "Retail Point Ivano-Frankivsk",
    cargo: "FMCG — 150 boxes",
    urgency: "normal",
    driver: "A. Lysenko",
    eta: "15:20",
  },
]

function MapPlaceholder() {
  return (
    <div className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50">
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-dashed border-zinc-300 px-5 py-3 dark:border-zinc-700">
        <LayoutDashboard className="h-4 w-4 text-zinc-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          Interactive Map — Integration Area
        </span>
      </div>

      {/* Map body placeholder */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="absolute left-8 top-8 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/80">
          <MapPin className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            WAREHOUSE
          </span>
        </div>

        <div className="absolute right-12 top-16 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/80">
          <Truck className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            TRUCK
          </span>
        </div>

        <div className="absolute bottom-10 left-1/3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-800/80">
          <Route className="h-4 w-4 text-sky-500" />
          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            ROUTE
          </span>
        </div>

        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-zinc-300 dark:text-zinc-600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="15%" y1="25%" x2="75%" y2="35%" stroke="currentColor" strokeDasharray="6 4" strokeWidth="1.5" />
          <line x1="75%" y1="35%" x2="40%" y2="75%" stroke="currentColor" strokeDasharray="6 4" strokeWidth="1.5" />
        </svg>

        <div className="z-10 flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-zinc-200/60 p-4 dark:bg-zinc-700/40">
            <MapPin className="h-8 w-8 text-zinc-400" />
          </div>
          <p className="text-sm font-medium text-zinc-400">Map will render here</p>
          <p className="text-xs text-zinc-400/60">Google Maps / Mapbox / Leaflet</p>
        </div>
      </div>
    </div>
  )
}

function HudStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 dark:border-zinc-700/60 dark:bg-zinc-800/60">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-700/50">
        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none text-zinc-900 dark:text-zinc-100">{value}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{label}</p>
      </div>
    </div>
  )
}

export default function DispatcherDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDeliveries = MOCK_DELIVERIES.filter((d) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      d.id.toLowerCase().includes(q) ||
      d.from.toLowerCase().includes(q) ||
      d.to.toLowerCase().includes(q) ||
      d.cargo.toLowerCase().includes(q)
    )
  })

  const stats = {
    total: MOCK_DELIVERIES.length,
    inTransit: MOCK_DELIVERIES.filter((d) => d.status === "in_transit").length,
    pending: MOCK_DELIVERIES.filter((d) => d.status === "pending").length,
    critical: MOCK_DELIVERIES.filter((d) => d.urgency === "critical").length,
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-6 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
            <Package className="h-4 w-4 text-white dark:text-zinc-900" />
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">LogiTrack</span>
          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[9px]">DISPATCHER</Badge>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <HudStat label="Total Deliveries" value={stats.total} icon={Package} />
          <HudStat label="In Transit" value={stats.inTransit} icon={Truck} />
          <HudStat label="Pending" value={stats.pending} icon={MapPin} />
          <HudStat label="Critical" value={stats.critical} icon={AlertTriangle} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative text-zinc-400">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Settings className="h-4 w-4" />
          </Button>
          <div className="ml-2 flex items-center gap-2 rounded-lg border border-zinc-200 px-2.5 py-1.5 dark:border-zinc-700 bg-white dark:bg-zinc-800/50">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700">
              <User className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            <span className="hidden text-xs font-medium text-zinc-700 sm:inline dark:text-zinc-300">Dispatcher</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col gap-5 p-5 lg:flex-row">
        <section className="w-full lg:w-[45%] xl:w-[40%]">
          <MapPlaceholder />
        </section>

        <section className="flex w-full flex-1 flex-col">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Active Deliveries</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, location, cargo…"
                className="h-8 w-full pl-9 sm:w-64"
              />
            </div>
          </div>

          <div className="flex-1 overflow-hidden rounded-xl border bg-white dark:bg-zinc-900/50">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24 uppercase text-[10px]">ID</TableHead>
                  <TableHead className="uppercase text-[10px]">Status</TableHead>
                  <TableHead className="uppercase text-[10px]">From (A)</TableHead>
                  <TableHead className="uppercase text-[10px]">To (B)</TableHead>
                  <TableHead className="uppercase text-[10px]">Cargo</TableHead>
                  <TableHead className="uppercase text-[10px]">Urgency</TableHead>
                  <TableHead className="uppercase text-[10px] text-right">ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-[12px]">
                {filteredDeliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell className="font-mono font-bold leading-none">{delivery.id}</TableCell>
                    <TableCell>
                      <Badge variant={delivery.status as any}>
                        {delivery.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500">{delivery.from}</TableCell>
                    <TableCell className="text-zinc-500">{delivery.to}</TableCell>
                    <TableCell>{delivery.cargo}</TableCell>
                    <TableCell>
                      <Badge variant={delivery.urgency as any}>
                        {delivery.urgency.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-zinc-400">{delivery.eta ?? "—"}</TableCell>
                   </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  )
}
