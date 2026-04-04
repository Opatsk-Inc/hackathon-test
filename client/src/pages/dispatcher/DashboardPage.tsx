import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { LayoutDashboard, Truck, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Map, MapControls, MapMarker, MarkerContent, MarkerTooltip } from "@/components/ui/map";

export default function DashboardPage() {
  const { data: orders = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  })

  // Fetch warehouses to plot them on the map
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses"],
    queryFn: api.getWarehouses,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Головний Дашборд</h1>
      </div>

      <div className="flex flex-col gap-6">
        {/* Карта */}
        <Card className="relative min-h-[500px] w-full overflow-hidden border-dashed bg-muted/10 shadow-none">
          <CardContent className="absolute inset-0 p-0">
            <Map center={[31.1656, 48.3794]} zoom={5}>
              <MapControls />
              {warehouses.map((w: any) => (
                <MapMarker key={w.id} longitude={w.lng} latitude={w.lat}>
                  <MarkerContent>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-background hover:scale-110 transition-transform">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </MarkerContent>
                  <MarkerTooltip>
                    <div className="flex flex-col gap-0.5 min-w-52 p-1">
                      <strong className="text-sm font-semibold">{w.name}</strong>
                      <span className="text-xs text-muted-foreground">{w.address}</span>
                      <div className="mt-2 pt-2 border-t border-border flex justify-between text-xs">
                        <span className="text-muted-foreground">Зарезервовано:</span>
                        <strong className="text-foreground">{w.inventory?.reduce((acc: number, inv: any) => acc + inv.quantityReserved, 0) || 0} од.</strong>
                      </div>
                    </div>
                  </MarkerTooltip>
                </MapMarker>
              ))}
            </Map>
          </CardContent>
        </Card>

        {/* Список доставок */}
        <Card className="flex-1 shadow-sm bg-card">
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
                {orders.slice(0, 5).map((o: any) => {
                  const status = o.trip?.status || o.status
                  const from = o.provider?.name || "Невідомо"
                  const to = o.requester?.name || "Невідомо"
                  
                  return (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono font-bold text-xs">{o.id.split('-')[0].toUpperCase()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          status.toLowerCase() === "pending" || status.toLowerCase() === "en_route" ? "pending" :
                          status.toLowerCase() === "in_transit" ? "in_transit" : "outline" as any
                        }>
                          {status.toLowerCase() === "in_transit" || status.toLowerCase() === "en_route" ? "В дорозі" :
                            status.toLowerCase() === "pending" ? "Очікує" : status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{from}</TableCell>
                      <TableCell className="text-xs">{to}</TableCell>
                      <TableCell>
                        <Badge variant={
                          o.priority === "CRITICAL" ? "critical" :
                          o.priority === "HIGH" ? "high" : "normal" as any
                        }>
                          {o.priority === "CRITICAL" ? "Критичний" :
                            o.priority === "HIGH" ? "Високий" : "Звичайний"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {orders.length === 0 && (
                  <TableRow>
                     <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Немає активних замовлень</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
