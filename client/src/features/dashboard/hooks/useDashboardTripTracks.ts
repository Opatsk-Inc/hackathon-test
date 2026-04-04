import { useQueries } from "@tanstack/react-query"
import { getTripTrack } from "@/features/trips/api/trips.api"
import type { IWarehouse } from "@/shared/types"
import type {
  IActiveTrip,
  ITripPoint,
  LngLat,
} from "@/features/trips/types/trip.types"

function isValidCoord(val: unknown): val is number {
  return typeof val === "number" && Number.isFinite(val)
}

function makeCoord(lat: number, lng: number): LngLat {
  return [lng, lat]
}

type CoordsBuilder = (lat: number, lng: number) => LngLat | null

function buildFallbackRoute(
  trip: IActiveTrip,
  warehouseById: Map<string, IWarehouse>
): LngLat[] | null {
  const collect: LngLat[] = []

  const addIfValid: CoordsBuilder = (lat, lng) => {
    if (isValidCoord(lat) && isValidCoord(lng)) {
      const coord = makeCoord(lat, lng)
      const last = collect[collect.length - 1]
      if (!last || last[0] !== coord[0] || last[1] !== coord[1]) {
        collect.push(coord)
      }
    }
    return null
  }

  // Provider warehouse (origin)
  const providerWh = trip.order.providerId
    ? warehouseById.get(trip.order.providerId)
    : undefined
  if (providerWh) {
    addIfValid(providerWh.lat, providerWh.lng)
  }

  // Current trip position
  if (isValidCoord(trip.currentLat) && isValidCoord(trip.currentLng)) {
    addIfValid(trip.currentLat!, trip.currentLng!)
  }

  // Requester warehouse (destination)
  const requesterWh = trip.order.requesterId
    ? warehouseById.get(trip.order.requesterId)
    : undefined
  if (requesterWh) {
    addIfValid(requesterWh.lat, requesterWh.lng)
  }

  return collect.length >= 2 ? collect : null
}

interface UseDashboardTripTracksParams {
  activeTrips: IActiveTrip[]
  warehouses: IWarehouse[]
}

export function useDashboardTripTracks({
  activeTrips,
  warehouses,
}: UseDashboardTripTracksParams) {
  const warehouseById = new Map<string, IWarehouse>(
    warehouses.map((w) => [w.id, w])
  )

  const tripTrackQueries = useQueries({
    queries: activeTrips.map((trip) => ({
      queryKey: ["tripTrack", trip.id],
      queryFn: () => getTripTrack(trip.id),
      enabled: !!trip.id,
      staleTime: 20000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      select: (data: ITripPoint[]): LngLat[] => {
        const validPoints = data.filter(
          (point) =>
            typeof point.lat === "number" &&
            typeof point.lng === "number" &&
            Number.isFinite(point.lat) &&
            Number.isFinite(point.lng)
        )

        // Sort by createdAt ascending
        validPoints.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        return validPoints.map((point) => [point.lng, point.lat])
      },
    })),
  })

  // Build normalized map: tripId -> LngLat[]
  const routesMap: Record<string, LngLat[]> = {}

  activeTrips.forEach((trip, index) => {
    const queryResult = tripTrackQueries[index]
    if (queryResult.data && queryResult.data.length >= 2) {
      routesMap[trip.id] = queryResult.data
    } else {
      // Fallback: build route from warehouse + current coords
      const fallback = buildFallbackRoute(trip, warehouseById)
      if (fallback) {
        routesMap[trip.id] = fallback
      }
    }
  })

  return routesMap
}
