import { useState, useCallback, useMemo } from "react"
import {
  LayoutDashboard,
  Truck,
  MapPin,
  TruckIcon,
  Navigation,
  Package,
  Zap,
  MoreVertical,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map"
import { useMap } from "@/features/dashboard/hooks/use-map-context"
import {
  useDashboard,
  useDashboardTripTracks,
  useDashboardRoadRoutes,
  useNonOverlappingMarkers,
} from "@/features/dashboard"
import { useTrips } from "@/features/trips/hooks/useTrips"
import type { IWarehouse } from "@/shared/types"
import type { IActiveTrip, LngLat } from "@/features/trips/types/trip.types"
import {
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import { formatTripStatus, getTripStatusVariant } from "@/features/trips/utils/trip.utils"
import { SosConfirmDialog } from "@/components/ui/sos-confirm-dialog"

const ROUTE_COLORS_BY_STATUS: Record<string, string> = {
  SOS: "#ef4444",
  EN_ROUTE: "#3b82f6",
  PENDING: "#f59e0b",
  COMPLETED: "#6b7280",
  DELIVERED: "#6b7280",
  CANCELLED: "#6b7280",
}

const DRIVER_MARKER_COLORS: Record<string, string> = {
  SOS: "#ef4444",
  EN_ROUTE: "#3b82f6",
  PENDING: "#f59e0b",
}

/** Compute heading angle in degrees from last two points of a route. */
function computeHeading(track: LngLat[]): number {
  if (track.length < 2) return 0
  const [lng1, lat1] = track[track.length - 2]
  const [lng2, lat2] = track[track.length - 1]
  const dLng = lng2 - lng1
  const dLat = lat2 - lat1
  const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI
  return angle < 0 ? angle + 360 : angle
}

/** Inner map content with overlap resolution */
function DashboardMapContent({
  warehouses,
  activeTrips,
  roadRoutes,
  baseTracks,
  hoveredTripId,
  setHoveredTripId,
  onResolveSos,
  isResolvingSos,
}: {
  warehouses: IWarehouse[]
  activeTrips: IActiveTrip[]
  roadRoutes: Record<string, { geometry: LngLat[] | null }>
  baseTracks: Record<string, LngLat[]>
  hoveredTripId: string | null
  setHoveredTripId: (id: string | null) => void
  onResolveSos: (tripId: string) => void
  isResolvingSos: boolean
}) {
  const { map, isLoaded } = useMap()

  const validTrips = useMemo(
    () =>
      activeTrips.filter(
        (t): t is IActiveTrip & { currentLat: number; currentLng: number } =>
          typeof t.currentLat === "number" &&
          typeof t.currentLng === "number" &&
          Number.isFinite(t.currentLat) &&
          Number.isFinite(t.currentLng)
      ),
    [activeTrips]
  )

  const { positions, isOverlapMode } = useNonOverlappingMarkers({
    map,
    warehouses,
    activeTrips: validTrips,
  })

  // Hook already provides animated display positions — use them directly.
  const getPosition = useCallback(
    (id: string) => {
      const p = positions.get(id)
      return p ? { lng: p.displayLng, lat: p.displayLat } : undefined
    },
    [positions]
  )

  if (!map || !isLoaded) return null

  return (
    <>
      <MapControls />

      {/* Warehouse markers */}
      {warehouses.map((w: IWarehouse) => {
        const pos = getPosition(`warehouse-${w.id}`)
        const lng = pos?.lng ?? w.lng
        const lat = pos?.lat ?? w.lat

        return (
          <MapMarker key={w.id} longitude={lng} latitude={lat}>
            <MarkerContent>
              <div className="group relative flex h-9 w-9 items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 scale-75 rounded-full bg-primary/20 blur-md transition-transform group-hover:scale-125" />

                {/* Main Pin */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border-2 border-background bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,138,80,0.3)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(0,138,80,0.4)]">
                  <MapPin className="h-4.5 w-4.5" />

                  {/* Decorative tail */}
                  <div className="absolute -bottom-1.5 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-background bg-primary" />
                </div>
              </div>
            </MarkerContent>
            <MarkerTooltip className="border-primary/20">
              <div className="flex min-w-56 flex-col gap-2 p-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
                      <Package className="h-3.5 w-3.5" />
                    </div>
                    <strong className="text-sm font-bold tracking-tight">
                      {w.name}
                    </strong>
                  </div>
                  <Badge
                    variant="outline"
                    className="h-5 border-white/10 bg-white/5 text-[10px] text-white"
                  >
                    Node
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{w.address}</span>
                </div>

                <div className="mt-1 space-y-1.5 rounded-lg border border-white/5 bg-zinc-900/50 p-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[9px] font-bold tracking-wider text-zinc-500 uppercase">
                      Inventory Status
                    </span>
                    <span className="font-mono text-primary">
                      {w.inventory?.length || 0} categories
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-400">
                        Reserved
                      </span>
                      <strong className="text-lg leading-none font-bold text-white">
                        {w.inventory?.reduce<number>(
                          (acc, inv) => acc + inv.quantityReserved,
                          0
                        ) || 0}
                      </strong>
                    </div>
                    <div className="mx-3 mb-1.5 h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-primary"
                        style={{ width: "65%" }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-zinc-500">
                      Units
                    </span>
                  </div>
                </div>
              </div>
            </MarkerTooltip>
          </MapMarker>
        )
      })}

      {/* Route lines */}
      {activeTrips.map((trip: IActiveTrip) => {
        const coordinates = roadRoutes[trip.id]?.geometry
        if (!coordinates || coordinates.length < 2) return null

        const color = ROUTE_COLORS_BY_STATUS[trip.status] ?? "#6b7280"
        const isHovered = hoveredTripId === trip.id
        const hasAnyHover = hoveredTripId !== null
        const baseWidth = isHovered ? 7 : hasAnyHover ? 3 : 4
        const baseOpacity = isHovered ? 0.3 : hasAnyHover ? 0.25 : 0.65

        return (
          <MapRoute
            key={`route-base-${trip.id}`}
            id={`route-base-${trip.id}`}
            coordinates={coordinates}
            color={color}
            width={baseWidth}
            opacity={baseOpacity}
          />
        )
      })}

      {/* Overlay highlighted route */}
      {activeTrips.map((trip: IActiveTrip) => {
        if (trip.id !== hoveredTripId) return null
        const coordinates = roadRoutes[trip.id]?.geometry
        if (!coordinates || coordinates.length < 2) return null
        const color = ROUTE_COLORS_BY_STATUS[trip.status] ?? "#6b7280"

        return (
          <MapRoute
            key={`route-overlay-${trip.id}`}
            id={`route-overlay-${trip.id}`}
            coordinates={coordinates}
            color={color}
            width={7}
            opacity={0.95}
            animated
            animationSpeed={1500}
          />
        )
      })}

      {/* Driver icons */}
      {validTrips.map((trip) => {
        const pos = getPosition(`driver-${trip.id}`)
        const lng = pos?.lng ?? trip.currentLng
        const lat = pos?.lat ?? trip.currentLng

        const isHovered = hoveredTripId === trip.id
        const color = DRIVER_MARKER_COLORS[trip.status] ?? "#6b7280"
        const track = roadRoutes[trip.id]?.geometry ?? baseTracks[trip.id]
        const rotation = track ? computeHeading(track) : 0
        const providerName = trip.order.provider?.name || "Warehouse"
        const requesterName = trip.order.requester?.name || "Destination"

        const isSOS = trip.status === "SOS"
        const priorityColor =
          trip.order.priority === "CRITICAL"
            ? "#ef4444"
            : trip.order.priority === "HIGH"
              ? "#f59e0b"
              : "#3b82f6"

        return (
          <MapMarker
            key={`driver-${trip.id}`}
            longitude={lng}
            latitude={lat}
            rotation={rotation}
            rotationAlignment="map"
          >
            <MarkerContent>
              <div
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredTripId(trip.id)}
                onMouseLeave={() => setHoveredTripId(null)}
              >
                {/* SOS Multi-layer Pulse */}
                {isSOS && (
                  <>
                    <div
                      className="absolute inset-0 z-0 animate-ping rounded-full bg-red-500 opacity-20"
                      style={{ animationDuration: "2s" }}
                    />
                    <div
                      className="absolute inset-0 z-0 animate-ping rounded-full bg-red-600 opacity-40"
                      style={{
                        animationDuration: "1.5s",
                        animationDelay: "0.5s",
                      }}
                    />
                    <div
                      className="absolute inset-0 z-0 animate-ping rounded-full bg-red-400 opacity-30"
                      style={{
                        animationDuration: "2.5s",
                        animationDelay: "1s",
                      }}
                    />
                  </>
                )}

                {/* Direction Pointer */}
                <div
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-white shadow-2xl transition-all duration-300",
                    isHovered
                      ? "-translate-y-1 scale-125 ring-4 ring-primary/30"
                      : "scale-100"
                  )}
                  style={{
                    backgroundColor: color,
                    zIndex: isHovered ? 50 : 10,
                    boxShadow: isSOS
                      ? "0 0 20px rgba(239, 68, 68, 0.6)"
                      : isHovered
                        ? "0 10px 25px rgba(0,0,0,0.3)"
                        : "0 4px 10px rgba(0,0,0,0.2)",
                  }}
                >
                  <TruckIcon className="h-4.5 w-4.5 text-white" />

                  {/* Direction Arrow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                    <div className="h-0 w-0 border-x-[4px] border-b-[6px] border-x-transparent border-b-white opacity-80" />
                  </div>
                </div>
              </div>
            </MarkerContent>
            <MarkerTooltip className="min-w-64 border-white/10">
              <div className="flex min-w-64 flex-col gap-2.5 p-2">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                      Fleet Unit
                    </span>
                    <strong className="text-sm font-black text-white">
                      DRV-{trip.id.split("-")[0].toUpperCase()}
                    </strong>
                  </div>
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span
                        className={cn(
                          "absolute inline-flex h-full w-full rounded-full opacity-75",
                          isSOS ? "animate-ping" : ""
                        )}
                        style={{ backgroundColor: color }}
                      ></span>
                      <span
                        className="relative inline-flex h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      ></span>
                    </span>
                    {formatTripStatus(trip.status)}
                  </div>
                </div>

                {/* Logistics Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold tracking-wide text-zinc-500 uppercase">
                      Asset
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-white/5">
                        <Package className="h-3 w-3 text-zinc-400" />
                      </div>
                      <span className="truncate text-[11px] font-medium text-zinc-200">
                        {trip.order.resource?.name || "Bulk Cargo"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold tracking-wide text-zinc-500 uppercase">
                      Priority
                    </span>
                    <div
                      className="flex items-center gap-1.5 rounded-md px-1.5 py-0.5"
                      style={{ backgroundColor: `${priorityColor}15` }}
                    >
                      <Zap
                        className="h-3 w-3"
                        style={{ color: priorityColor }}
                      />
                      <span
                        className="text-[10px] font-bold"
                        style={{ color: priorityColor }}
                      >
                        {formatPriorityLevel(trip.order.priority)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking Progress */}
                <div className="mt-1 space-y-1.5 rounded-lg border border-white/5 bg-white/5 p-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Navigation className="h-2.5 w-2.5" />
                      <span>{providerName}</span>
                    </div>
                    <div className="flex flex-1 items-center px-2">
                      <div className="relative h-[1px] flex-1 bg-zinc-700">
                        <div className="absolute top-1/2 right-0 h-1 w-1 -translate-y-1/2 rounded-full bg-zinc-500" />
                        <div
                          className="absolute top-1/2 left-1/3 h-2 w-2 -translate-y-1/2 rounded-full border border-zinc-900 shadow-md"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-300">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{requesterName}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                    <span>ETA: 14:30</span>
                    <span>HDG: {Math.round(rotation)}°</span>
                  </div>
                </div>

                {/* Driver */}
                {trip.driverName && (
                  <div className="flex items-center gap-2 border-t border-white/5 pt-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[9px] font-bold text-primary">
                      {trip.driverName.charAt(0)}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Assigned Driver:{" "}
                      <span className="font-medium text-zinc-200">
                        {trip.driverName}
                      </span>
                    </span>
                  </div>
                )}
                <div className="mt-2 flex flex-col gap-1">
                  {trip.status === "SOS" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="w-full text-xs"
                      onClick={() => onResolveSos(trip.id)}
                      disabled={isResolvingSos}
                    >
                      Resolve SOS
                    </Button>
                  )}
                </div>
              </div>
            </MarkerTooltip>
          </MapMarker>
        )
      })}

      {/* Overlap mode indicator */}
      {isOverlapMode && (
        <div className="absolute bottom-4 left-4 z-10 rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
          Markers adjusted to prevent overlap
        </div>
      )}
    </>
  )
}

const columns: ColumnDef<IActiveTrip>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs font-bold">
        {row.original.id.split("-")[0].toUpperCase()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={getTripStatusVariant(row.original.status)}>
        {formatTripStatus(row.original.status)}
      </Badge>
    ),
  },
  {
    accessorKey: "origin",
    header: "From",
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.order.provider?.name || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "destination",
    header: "To",
    cell: ({ row }) => (
      <div className="text-xs">
        {row.original.order.requester?.name || "Unknown"}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.order.priority || "NORMAL"
      return (
        <Badge variant={getPriorityVariant(priority)}>
          {formatPriorityLevel(priority)}
        </Badge>
      )
    },
  },
]

function MapStatsOverlay({ activeTrips }: { activeTrips: IActiveTrip[] }) {
  const enRoute = activeTrips.filter((t) => t.status === "EN_ROUTE").length
  const sos = activeTrips.filter((t) => t.status === "SOS").length
  const pending = activeTrips.filter((t) => t.status === "PENDING").length

  return (
    <div className="absolute top-4 left-4 z-20 flex min-w-[280px] flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/95 p-5 shadow-2xl antialiased">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-xs font-black tracking-[0.2em] text-zinc-400 uppercase">
            Network Status
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            </span>
            Live Deployment
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
          <MoreVertical className="h-4 w-4 text-zinc-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col rounded-xl border border-white/5 bg-white/5 p-2.5 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            Active
          </div>
          <span className="mt-1 text-2xl font-black text-white">{enRoute}</span>
        </div>

        <div className="flex flex-col rounded-xl border border-white/5 bg-zinc-900/50 p-2.5 transition-colors hover:bg-white/10">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            Wait
          </div>
          <span className="mt-1 text-2xl font-black text-white">{pending}</span>
        </div>

        <div className="flex flex-col rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 transition-colors hover:bg-red-500/20">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            SOS
          </div>
          <span className="mt-1 text-2xl leading-none font-black text-red-500">
            {sos}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/10 px-3 py-2">
        <span className="text-[10px] font-bold tracking-wider text-primary-foreground/70 uppercase">
          System Integrity
        </span>
        <span className="text-[10px] font-black text-primary">OPTIMAL</span>
      </div>
    </div>
  )
}

function DashboardPage() {
  const { warehouses, activeTrips, error, isLoading } = useDashboard()
  const baseTracks = useDashboardTripTracks({ activeTrips, warehouses })
  const roadRoutes = useDashboardRoadRoutes({ baseTracks })
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null)
  const [confirmTripId, setConfirmTripId] = useState<string | null>(null)

  const { resolveSos, isResolvingSos, resolveSosError } = useTrips()

  const handleSosConfirm = () => {
    if (confirmTripId) {
      resolveSos(confirmTripId)
      setConfirmTripId(null)
    }
  }

  const table = useReactTable({
    data: activeTrips,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading data: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading dashboard...">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Main Dashboard</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Map */}
          <Card className="relative min-h-125 w-full overflow-hidden border-dashed bg-muted/10 shadow-none">
            <CardContent className="absolute inset-0 p-0">
              <MapStatsOverlay activeTrips={activeTrips} />
              <Map center={[31.1656, 48.3794]} zoom={5}>
                <DashboardMapContent
                  warehouses={warehouses}
                  activeTrips={activeTrips}
                  roadRoutes={roadRoutes}
                  baseTracks={baseTracks}
                  hoveredTripId={hoveredTripId}
                  setHoveredTripId={setHoveredTripId}
                  onResolveSos={(tripId) => setConfirmTripId(tripId)}
                  isResolvingSos={isResolvingSos}
                />
              </Map>
            </CardContent>
          </Card>

          {/* Delivery List */}
          <Card className="flex-1 bg-card shadow-sm">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Active Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, i) => (
                      <TableRow
                        className={i % 2 === 0 ? "bg-muted/50" : ""}
                        key={row.id}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No active orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {/* Pagination controls */}
              <div className="flex items-center justify-between border-t px-4 pt-4 pb-1">
                <div className="text-sm text-muted-foreground">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={!table.getCanPreviousPage()}
                    onClick={() => table.previousPage()}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={!table.getCanNextPage()}
                    onClick={() => table.nextPage()}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SOS Confirm Dialog */}
        <SosConfirmDialog
          open={!!confirmTripId}
          onOpenChange={() => setConfirmTripId(null)}
          onConfirm={handleSosConfirm}
          isConfirming={isResolvingSos}
        />

        {/* SOS Error Banner */}
        {resolveSosError && (
          <div className="fixed right-4 bottom-4 z-50 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {resolveSosError instanceof Error
              ? resolveSosError.message
              : String(resolveSosError)}
          </div>
        )}
      </div>
    </PageLoader>
  )
}

export default DashboardPage
