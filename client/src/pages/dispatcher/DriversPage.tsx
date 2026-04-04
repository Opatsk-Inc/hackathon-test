import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Search, Filter, ShieldAlert, Link as LinkIcon, CheckCircle2 } from "lucide-react"
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

export default function DriversPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ["activeTrips"],
    queryFn: api.getActiveTrips,
  })

  // Mutation for Resolving SOS
  const resolveSosMutation = useMutation({
    mutationFn: (tripId: string) => api.resolveSos(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const handleSos = (tripId: string) => {
    if (confirm("Підтвердити вирішення SOS-ситуації? Поїздка буде скасована, товари повернуті на склад відправника.")) {
      resolveSosMutation.mutate(tripId)
    }
  }

  const copyMagicLink = (magicToken: string) => {
    const link = `${window.location.origin}/driver/${magicToken}`
    navigator.clipboard.writeText(link)
    alert("Magic Link скопійовано!")
  }

  const filteredTrips = trips.filter((t: any) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return t.driverName?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          Активні поїздки та Автопарк
        </h1>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук водія по імені або ID рейсу..."
              className="h-9 w-64 pl-9 bg-card"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
        >
          <Filter className="h-4 w-4" />
          Додаткові фільтри
        </Button>
      </div>

      {/* Main Table Area */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Ім'я водія</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Рейс (Trip)</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Остання локація</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs">Статус</TableHead>
              <TableHead className="font-semibold uppercase tracking-wider text-xs text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Завантаження...</TableCell>
              </TableRow>
            ) : filteredTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Немає активних поїздок</TableCell>
              </TableRow>
            ) : (
              filteredTrips.map((trip: any) => {
                const isSos = trip.status === "SOS"
                
                return (
                  <TableRow 
                    key={trip.id} 
                    className={isSos ? "bg-destructive/5" : ""}
                  >
                    <TableCell className={`font-medium ${isSos ? "text-destructive" : "text-foreground"}`}>
                      {trip.driverName || "Невідомо"}
                    </TableCell>
                    
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {trip.id.split("-")[0].toUpperCase()}
                    </TableCell>
                    
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {trip.currentLat ? `${trip.currentLat.toFixed(4)}, ${trip.currentLng.toFixed(4)}` : "Невідомо"}
                    </TableCell>
                    
                    <TableCell>
                      {isSos ? (
                        <Badge variant="sos">SOS ERROR</Badge>
                      ) : (
                        <Badge variant="in_transit">У рейсі</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      {isSos ? (
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="gap-1.5 font-bold shadow-sm text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleSos(trip.id)}
                          disabled={resolveSosMutation.isPending}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {resolveSosMutation.isPending && resolveSosMutation.variables === trip.id ? "..." : "Resolve SOS"}
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => copyMagicLink(trip.magicToken)}
                        >
                          <LinkIcon className="h-3 w-3" />
                          Copy Magic Link
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
