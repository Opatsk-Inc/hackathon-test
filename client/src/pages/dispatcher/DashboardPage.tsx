import { useState, useCallback, useMemo } from "react"
import { LayoutDashboard, Truck, MapPin, TruckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
import type { IWarehouse } from "@/shared/types"
import type { IActiveTrip, LngLat } from "@/features/trips/types/trip.types"
import {
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import { formatTripStatus } from "@/features/trips/utils/trip.utils"

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
}: {
  warehouses: IWarehouse[]
  activeTrips: IActiveTrip[]
  roadRoutes: Record<string, { geometry: LngLat[] | null }>
  baseTracks: Record<string, LngLat[]>
  hoveredTripId: string | null
  setHoveredTripId: (id: string | null) => void
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
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                <MapPin className="h-4 w-4" />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <div className="flex min-w-52 flex-col gap-0.5 p-1">
                <strong className="text-sm font-semibold">{w.name}</strong>
                <span className="text-xs text-muted-foreground">
                  {w.address}
                </span>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-xs">
                  <span className="text-muted-foreground">Reserved:</span>
                  <strong className="text-foreground">
                    {w.inventory?.reduce<number>(
                      (acc: number, inv) => acc + inv.quantityReserved,
                      0
                    ) || 0}{" "}
                    units
                  </strong>
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
        const lat = pos?.lat ?? trip.currentLat

        const isHovered = hoveredTripId === trip.id
        const color = DRIVER_MARKER_COLORS[trip.status] ?? "#6b7280"
        const track = roadRoutes[trip.id]?.geometry ?? baseTracks[trip.id]
        const rotation = track ? computeHeading(track) : 0
        const providerName = trip.order.provider?.name || "Warehouse"
        const requesterName = trip.order.requester?.name || "Destination"

        return (
          <MapMarker
            key={`driver-${trip.id}`}
            longitude={lng}
            latitude={lat}
            rotation={rotation}
            rotationAlignment="map"
          >
            <MarkerContent>
              <div className="relative">
                {trip.status === "SOS" && (
                  <div
                    className="absolute inset-0 z-0 animate-ping rounded-full opacity-75"
                    style={{ backgroundColor: color, animationDuration: '1.5s' }}
                  />
                )}
                <div
                  className={
                    "relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform duration-200 " +
                    (isHovered
                      ? "scale-125 ring-4 ring-primary/30"
                      : "hover:scale-110")
                  }
                  style={{
                    backgroundColor: color,
                    zIndex: isHovered ? 10 : 1,
                  }}
                  onMouseEnter={() => setHoveredTripId(trip.id)}
                  onMouseLeave={() => setHoveredTripId(null)}
                >
                  <TruckIcon className="h-4 w-4 text-white" />
                </div>
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <div className="flex min-w-56 flex-col gap-1.5 p-1">
                <strong className="text-sm border-b pb-1">
                  Driver {trip.driverName ? `(${trip.driverName})` : ''} · {formatTripStatus(trip.status)}
                </strong>
                <div className="flex flex-col gap-0.5 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Route:</span> {providerName} → {requesterName}
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Priority:</span> 
                    <span className={`ml-1 font-semibold ${
                      trip.order.priority === 'CRITICAL' ? 'text-red-500' :
                      trip.order.priority === 'HIGH' ? 'text-orange-500' : 'text-blue-500'
                    }`}>
                      {formatPriorityLevel(trip.order.priority)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Cargo:</span> {trip.order.resource?.name ?? 'Unknown'} <span className="font-mono bg-muted px-1 rounded">x{trip.order.quantity}</span>
                  </span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground/70 text-right mt-1">
                  Trip: {trip.id.split("-")[0]}
                </span>
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
      <Badge variant={row.original.status === "SOS" ? "sos" : "in_transit"}>
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
    <div className="absolute top-4 left-4 z-20 flex min-w-[300px] flex-col gap-3 rounded-xl border border-border/50 bg-background/95 p-4 shadow-md backdrop-blur-md">
      <div>
        <h3 className="text-sm font-semibold leading-none tracking-tight">
          Network Status
        </h3>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Active Deliveries
        </p>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            En Route
          </div>
          <span className="mt-[5px] text-lg font-bold leading-none">{enRoute}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Pending
          </div>
          <span className="mt-[5px] text-lg font-bold leading-none">{pending}</span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            SOS
          </div>
          <span className="mt-[5px] text-lg font-bold leading-none">{sos}</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { warehouses, activeTrips, error, isLoading } = useDashboard()
  const baseTracks = useDashboardTripTracks({ activeTrips, warehouses })
  const roadRoutes = useDashboardRoadRoutes({ baseTracks })
  const [hoveredTripId, setHoveredTripId] = useState<string | null>(null)

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
                              header.getContext(),
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row, i) => (
                      <TableRow className={i % 2 === 1 ? "bg-muted/50" : ""} key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
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
      </div>
    </PageLoader>
  )
}
