import { useQueries } from "@tanstack/react-query"
import type { LngLat } from "@/features/trips/types/trip.types"
import { useEffect, useRef } from "react"
import {
  buildRoutingUrl,
  downsampleTrack,
  sanitizeTrack,
  trackSignature,
} from "../utils/routing"

const MAX_POINTS = 90
const ROUTING_TIMEOUT_MS = 12000

// LRU cache for road routes
const LRU_MAX_SIZE = 200
const lruCache = new Map<string, LngLat[]>()

function lruGet(key: string): LngLat[] | undefined {
  const val = lruCache.get(key)
  if (val !== undefined) {
    lruCache.delete(key)
    lruCache.set(key, val)
  }
  return val
}

function lruSet(key: string, value: LngLat[]): void {
  if (lruCache.has(key)) {
    lruCache.delete(key)
  } else if (lruCache.size >= LRU_MAX_SIZE) {
    // evict oldest entry
    const firstKey = lruCache.keys().next().value
    if (firstKey !== undefined) {
      lruCache.delete(firstKey)
    }
  }
  lruCache.set(key, value)
}

function lruKeyFromTrack(track: LngLat[]): string {
  return JSON.stringify(track.map((p) => [p[0].toFixed(3), p[1].toFixed(3)]))
}

interface UseDashboardRoadRoutesParams {
  /** tripId -> baseTrack (LngLat[]) from useDashboardTripTracks */
  baseTracks: Record<string, LngLat[]>
}

interface RoadRouteResult {
  /** Road-snapped geometry, or null if unavailable */
  geometry: LngLat[] | null
  /** True while route is being fetched */
  isFetching: boolean
  /** Error if any (kept for logging, fallback is automatic) */
  error: Error | null
}

async function fetchRoadRoute(
  tripId: string,
  track: LngLat[]
): Promise<LngLat[]> {
  // Check LRU cache first
  const lk = lruKeyFromTrack(track)
  const cached = lruGet(lk)
  if (cached) return cached

  const url = buildRoutingUrl(track)
  if (!url) {
    throw new Error(`Invalid track for trip ${tripId}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ROUTING_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      throw new Error(
        `Routing API returned ${response.status} for trip ${tripId}`
      )
    }

    const data = await response.json()

    if (!data.routes?.[0]?.geometry?.coordinates) {
      throw new Error(`No route found for trip ${tripId}`)
    }

    const coords = data.routes[0].geometry.coordinates as LngLat[]
    lruSet(lk, coords)
    return coords
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Routing request timed out after ${ROUTING_TIMEOUT_MS}ms for trip ${tripId}`
      )
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Hook that fetches road-snapped routes for all active trips.
 * Falls back to baseTrack if routing API fails.
 */
/** In-flight previous routes map (tripId -> last successful geometry) */
const previousRoutes = new Map<string, LngLat[]>()

export function useDashboardRoadRoutes({
  baseTracks,
}: UseDashboardRoadRoutesParams): Record<string, RoadRouteResult> {
  const tripIds = Object.keys(baseTracks)
  const prefetchDoneRef = useRef(false)

  // Prefetch active trips on mount or when baseTracks change
  useEffect(() => {
    if (prefetchDoneRef.current) return
    prefetchDoneRef.current = true

    const activeTrips = tripIds.filter((tid) => {
      const t = baseTracks[tid]
      return t && t.length >= 2
    })

    // Low-priority prefetch in next idle frame
    if ("requestIdleCallback" in window) {
      requestIdleCallback(() => prefetchTrips(activeTrips))
    } else {
      setTimeout(() => prefetchTrips(activeTrips), 0)
    }
  }, [tripIds, baseTracks])

  const routeQueries = useQueries({
    queries: tripIds.map((tripId) => {
      const rawTrack = baseTracks[tripId]
      const cleanTrack = sanitizeTrack(rawTrack)
      const sampledTrack = downsampleTrack(cleanTrack, MAX_POINTS)
      const sig = trackSignature(sampledTrack)

      return {
        queryKey: ["tripRoadRoute", tripId, sig] as const,
        queryFn: () => fetchRoadRoute(tripId, sampledTrack),
        enabled: sampledTrack.length >= 2,
        staleTime: 60_000,
        gcTime: 15 * 60 * 1000,
        retry: 1,
        retryDelay: 500,
        refetchOnWindowFocus: false,
      }
    }),
  })

  const result: Record<string, RoadRouteResult> = {}

  tripIds.forEach((tripId, i) => {
    const query = routeQueries[i]
    const baseTrack = baseTracks[tripId]

    if (query.data) {
      // Successful data — store as previous
      previousRoutes.set(tripId, query.data)
      result[tripId] = {
        geometry: query.data,
        isFetching: query.isFetching,
        error: null,
      }
    } else if (query.error) {
      // Use last successful route if available, else fallback to baseTrack
      const prev = previousRoutes.get(tripId)
      result[tripId] = {
        geometry:
          prev ?? (baseTrack && baseTrack.length >= 2 ? baseTrack : null),
        isFetching: false,
        error: query.error,
      }
    } else {
      // Still loading or disabled — use last successful or fallback
      const prev = previousRoutes.get(tripId)
      result[tripId] = {
        geometry:
          prev ?? (baseTrack && baseTrack.length >= 2 ? baseTrack : null),
        isFetching: query.isLoading,
        error: null,
      }
    }
  })

  return result
}

async function prefetchTrips(tripIds: string[]): Promise<void> {
  // Minimal prefetch — triggers queries in low priority
  // Actual fetch happens via useQueries when enabled
  for (const tripId of tripIds) {
    // Prefetch is handled naturally by the query system
    // This stub ensures no blocking behavior
    void tripId
  }
}
