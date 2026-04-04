import { useTrips } from "../../trips/hooks/useTrips"
import type { IActiveTrip } from "../../trips/types/trip.types"

// Thin wrapper over useTrips to maintain backward compatibility
// with DriversPage API while reusing shared trip logic.
export function useDrivers() {
  const tripsData = useTrips()

  return {
    trips: tripsData.activeTrips as IActiveTrip[],
    isLoading: tripsData.isLoading,
    error: tripsData.error,
    refetch: tripsData.refetch,
    resolveSos: tripsData.resolveSos,
    isResolvingSos: tripsData.isResolvingSos,
    resolveSosError: tripsData.resolveSosError,
  }
}
