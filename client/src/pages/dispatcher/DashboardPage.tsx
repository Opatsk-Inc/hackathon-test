import { LayoutDashboard, Truck, MapPin } from "lucide-react"
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
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map"
import { useDashboard } from "@/features/dashboard"
import type { IWarehouse } from "@/shared/types"
import type { IActiveTrip } from "@/features/trips/types/trip.types"
import {
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"
import { formatTripStatus } from "@/features/trips/utils/trip.utils"

export default function DashboardPage() {
  const { warehouses, activeTrips, error, isLoading } = useDashboard()

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Помилка завантаження даних: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження дашборду...">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Головний Дашборд</h1>
        </div>

        <div className="flex flex-col gap-6">
          {/* Карта */}
          <Card className="relative min-h-125 w-full overflow-hidden border-dashed bg-muted/10 shadow-none">
            <CardContent className="absolute inset-0 p-0">
              <Map center={[31.1656, 48.3794]} zoom={5}>
                <MapControls />
                {warehouses.map((w: IWarehouse) => (
                  <MapMarker key={w.id} longitude={w.lng} latitude={w.lat}>
                    <MarkerContent>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                        <MapPin className="h-4 w-4" />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>
                      <div className="flex min-w-52 flex-col gap-0.5 p-1">
                        <strong className="text-sm font-semibold">
                          {w.name}
                        </strong>
                        <span className="text-xs text-muted-foreground">
                          {w.address}
                        </span>
                        <div className="mt-2 flex justify-between border-t border-border pt-2 text-xs">
                          <span className="text-muted-foreground">
                            Зарезервовано:
                          </span>
                          <strong className="text-foreground">
                            {w.inventory?.reduce<number>(
                              (acc: number, inv) => acc + inv.quantityReserved,
                              0
                            ) || 0}{" "}
                            од.
                          </strong>
                        </div>
                      </div>
                    </MarkerTooltip>
                  </MapMarker>
                ))}
              </Map>
            </CardContent>
          </Card>

          {/* Список доставок */}
          <Card className="flex-1 bg-card shadow-sm">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5 text-muted-foreground" />
                Активні доставки
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
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
                  {activeTrips.slice(0, 5).map((trip: IActiveTrip) => {
                    const order = trip.order
                    const status = trip.status
                    const from = order.provider?.name || "Невідомо"
                    const to = order.requester?.name || "Невідомо"
                    const priority = order.priority || "NORMAL"

                    return (
                      <TableRow key={trip.id}>
                        <TableCell className="font-mono text-xs font-bold">
                          {trip.id.split("-")[0].toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "SOS" ? "sos" : "in_transit"}
                          >
                            {formatTripStatus(status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{from}</TableCell>
                        <TableCell className="text-xs">{to}</TableCell>
                        <TableCell>
                          <Badge variant={getPriorityVariant(priority)}>
                            {formatPriorityLevel(priority)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {activeTrips.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Немає активних замовлень
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLoader>
  )
}
