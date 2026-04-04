import type { LngLat } from "@/features/trips/types/trip.types"

const ROUTING_API_BASE =
  import.meta.env.VITE_ROUTING_API_BASE ?? "https://router.project-osrm.org"

/**
 * Build OSRM-compatible routing URL.
 * Returns URL string or null if coordinates are insufficient.
 */
export function buildRoutingUrl(track: LngLat[]): string | null {
  if (!track || track.length < 2) return null

  const coordString = track.map(([lng, lat]) => `${lng},${lat}`).join(";")

  return `${ROUTING_API_BASE}/route/v1/driving/${encodeURIComponent(coordString)}?overview=full&geometries=geojson`
}

/**
 * Downsample a track to a maximum number of points while preserving endpoints.
 * Uses simple uniform sampling for long tracks.
 */
export function downsampleTrack(
  track: LngLat[],
  maxPoints: number = 25
): LngLat[] {
  if (track.length <= maxPoints) return track

  const step = (track.length - 1) / (maxPoints - 1)
  const result: LngLat[] = []

  for (let i = 0; i < maxPoints; i++) {
    const idx = Math.round(i * step)
    result.push(track[idx])
  }

  return result
}

/**
 * Remove duplicate consecutive points and filter invalid coordinates.
 * Returns a clean track ready for routing requests.
 */
export function sanitizeTrack(track: LngLat[]): LngLat[] {
  const isValid = (c: LngLat): boolean =>
    c.length === 2 &&
    Number.isFinite(c[0]) &&
    Number.isFinite(c[1]) &&
    c[0] >= -180 &&
    c[0] <= 180 &&
    c[1] >= -90 &&
    c[1] <= 90

  const cleaned: LngLat[] = []

  for (const point of track) {
    if (!isValid(point)) continue

    const last = cleaned[cleaned.length - 1]
    if (!last || last[0] !== point[0] || last[1] !== point[1]) {
      cleaned.push(point)
    }
  }

  return cleaned
}

/**
 * Generate track signature for React Query cache key.
 * Uses first, middle, and last points to create a compact identifier.
 */
/** Length bucket size for signature stability. */
const LENGTH_BUCKET = 5

/**
 * Generate track signature for React Query cache key.
 * Uses coarser quantization (toFixed(3)) and length buckets
 * to reduce cache-key churn on micro-changes.
 */
export function trackSignature(track: LngLat[]): string {
  if (track.length === 0) return "empty"
  if (track.length === 1) return pointKey(track[0])

  const last = track[track.length - 1]
  const midIdx = Math.floor(track.length / 2)
  const bucket = Math.floor(track.length / LENGTH_BUCKET)

  return `${pointKey(track[0])}-${pointKey(track[midIdx])}-${pointKey(last)}|L${bucket}`
}

function pointKey([lng, lat]: LngLat): string {
  return `${lng.toFixed(3)},${lat.toFixed(3)}`
}
