import { useState } from "react"
import { useDrivers } from "@/features/drivers"
import type { IActiveTrip } from "@/features/trips/types/trip.types"
import {
  Search,
  Filter,
  ShieldAlert,
  Link as LinkIcon,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PageLoader } from "@/components/ui/loaders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SosConfirmDialog } from "@/components/ui/sos-confirm-dialog"

export default function DriversPage() {
  const {
    trips,
    isLoading,
    error,
    resolveSos,
    isResolvingSos,
    resolveSosError,
  } = useDrivers()

  const [searchQuery, setSearchQuery] = useState("")
  const [copiedTripId, setCopiedTripId] = useState<string | null>(null)
  const [fallbackTrip, setFallbackTrip] = useState<IActiveTrip | null>(null)
  const [confirmTripId, setConfirmTripId] = useState<string | null>(null)

  const handleSosConfirm = () => {
    if (confirmTripId) {
      resolveSos(confirmTripId)
      setConfirmTripId(null)
    }
  }

  const copyMagicLink = async (tripId: string, magicToken: string) => {
    const url = `${window.location.origin}/driver/${magicToken}`
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
        setCopiedTripId(tripId)
        setTimeout(() => setCopiedTripId(null), 2000)
      } else {
        throw new Error("Clipboard API not available")
      }
    } catch {
      // Fallback: show dialog with manual copy option
      const trip = trips.find((t: IActiveTrip) => t.id === tripId)
      if (trip) {
        setFallbackTrip(trip)
      }
    }
  }

  const filteredTrips = trips.filter((trip: IActiveTrip) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (trip.driverName || "").toLowerCase().includes(q) ||
      trip.id.toLowerCase().includes(q)
    )
  })

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Error loading data: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Loading drivers...">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Active Trips & Fleet
          </h1>
        </div>

        {/* Control Bar: Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for driver by name or trip ID..."
                className="h-9 w-64 bg-card pl-9"
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
          >
            <Filter className="h-4 w-4" />
            Additional filters
          </Button>
        </div>

        {/* SOS Error Banner */}
        {resolveSosError && (
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {resolveSosError instanceof Error
              ? resolveSosError.message
              : String(resolveSosError)}
          </div>
        )}

        {/* Main Table Area */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Driver Name
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Trip ID
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Last Location
                </TableHead>
                <TableHead className="text-xs font-semibold tracking-wider uppercase">
                  Status
                </TableHead>
                <TableHead className="text-right text-xs font-semibold tracking-wider uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No active trips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip: IActiveTrip, i: number) => {
                  const isSos = trip.status === "SOS"
                  const isPending = trip.status === "PENDING"

                  return (
                    <TableRow
                      key={trip.id}
                      className={`${isSos ? "bg-destructive/5" : ""} ${
                        i % 2 === 1 ? "bg-muted/50" : ""
                      }`}
                    >
                      <TableCell
                        className={`font-medium ${isSos ? "text-destructive" : "text-foreground"}`}
                      >
                        {trip.driverName || "Unknown"}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {trip.id.split("-")[0].toUpperCase()}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {trip.currentLat && trip.currentLng
                          ? `${trip.currentLat.toFixed(4)}, ${trip.currentLng.toFixed(4)}`
                          : "Unknown"}
                      </TableCell>

                      <TableCell>
                        {isSos ? (
                          <Badge variant="sos">SOS ERROR</Badge>
                        ) : isPending ? (
                          <Badge variant="outline">Waiting to start</Badge>
                        ) : (
                          <Badge variant="in_transit">In transit</Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        {isSos ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1.5 font-bold text-destructive-foreground shadow-sm hover:bg-destructive/90"
                            onClick={() => setConfirmTripId(trip.id)}
                            disabled={isResolvingSos}
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            {isResolvingSos ? "..." : "Resolve SOS"}
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() =>
                              copyMagicLink(trip.id, trip.magicToken)
                            }
                          >
                            {copiedTripId === trip.id ? (
                              <>
                                <Check className="h-3 w-3 text-green-600" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="h-3 w-3" />
                                Copy Magic Link
                              </>
                            )}
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

        {/* Clipboard Fallback Dialog */}
        <Dialog
          open={!!fallbackTrip}
          onOpenChange={(open) => {
            if (!open) setFallbackTrip(null)
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Copy link manually</DialogTitle>
              <DialogDescription>
                Please copy the driver link manually
              </DialogDescription>
            </DialogHeader>
            {fallbackTrip && (
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/driver/${fallbackTrip.magicToken}`}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    const url = `${window.location.origin}/driver/${fallbackTrip.magicToken}`
                    navigator.clipboard
                      .writeText(url)
                      .then(() => {
                        setFallbackTrip(null)
                      })
                      .catch(() => {
                        setFallbackTrip(null)
                      })
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* SOS Confirm Dialog */}
        <SosConfirmDialog
          open={!!confirmTripId}
          onOpenChange={() => setConfirmTripId(null)}
          onConfirm={handleSosConfirm}
          isConfirming={isResolvingSos}
        />
      </div>
    </PageLoader>
  )
}
