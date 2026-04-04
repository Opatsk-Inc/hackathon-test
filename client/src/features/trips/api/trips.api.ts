import { fetchWithAuth } from "@/shared/api/http"
import type { IResolveSosResponse, ITripPoint } from "../types/trip.types"

// TRIPS
export const getActiveTrips = () => fetchWithAuth("/api/trips/active")

export const getTripTrack = (tripId: string): Promise<ITripPoint[]> =>
  fetchWithAuth(`/api/trips/${tripId}/track`)

export const resolveSos = (tripId: string) =>
  fetchWithAuth(`/api/trips/${tripId}/resolve-sos`, {
    method: "PATCH",
  }) as Promise<IResolveSosResponse>
