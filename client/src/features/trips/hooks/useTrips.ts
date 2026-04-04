import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getActiveTrips as getActiveTripsAPI,
  resolveSos as resolveSosAPI,
} from "../api/trips.api"
import type { IActiveTrip } from "../types/trip.types"

export function useTrips() {
  const queryClient = useQueryClient()

  const {
    data: activeTrips = [],
    isLoading,
    error,
    refetch,
  } = useQuery<IActiveTrip[]>({
    queryKey: ["activeTrips"],
    queryFn: getActiveTripsAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const resolveSosMutation = useMutation({
    mutationFn: (tripId: string) => resolveSosAPI(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })

  return {
    activeTrips,
    isLoading,
    error,
    refetch,
    resolveSos: resolveSosMutation.mutate,
    isResolvingSos: resolveSosMutation.isPending,
    resolveSosError: resolveSosMutation.error,
  }
}
