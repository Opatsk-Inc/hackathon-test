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

  // OSRM path segment must preserve comma/semicolon separators.
  return `${ROUTING_API_BASE}/route/v1/driving/${coordString}?overview=full&geometries=geojson`
}

/**
 * Calculate the perpendicular distance from point p to line segment [p1, p2].
 */
function perpendicularDistance(p: LngLat, p1: LngLat, p2: LngLat): number {
  const [x, y] = p
  const [x1, y1] = p1
  const [x2, y2] = p2

  const dx = x2 - x1
  const dy = y2 - y1

  if (dx === 0 && dy === 0) {
    const ddx = x - x1
    const ddy = y - y1
    return Math.sqrt(ddx * ddx + ddy * ddy)
  }

  const t = ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)
  let closestX = x1
  let closestY = y1

  if (t > 0) {
    if (t < 1) {
      closestX = x1 + t * dx
      closestY = y1 + t * dy
    } else {
      closestX = x2
      closestY = y2
    }
  }

  const finalDx = x - closestX
  const finalDy = y - closestY
  return Math.sqrt(finalDx * finalDx + finalDy * finalDy)
}

/**
 * Downsample a track using Douglas-Peucker algorithm while enforcing a max boundary.
 * It's optimal for preserving the curve shape.
 */
export function downsampleTrack(
  track: LngLat[],
  maxPoints: number = 25,
  epsilon: number = 0.001
): LngLat[] {
  if (track.length <= maxPoints) return track

  // Helper function for Douglas-Peucker
  function douglasPeucker(pts: LngLat[], eps: number): LngLat[] {
    if (pts.length <= 2) return pts

    let dmax = 0
    let index = 0
    const end = pts.length - 1

    for (let i = 1; i < end; i++) {
        const d = perpendicularDistance(pts[i], pts[0], pts[end])
        if (d > dmax) {
            index = i
            dmax = d
        }
    }

    if (dmax > eps) {
        const recResults1 = douglasPeucker(pts.slice(0, index + 1), eps)
        const recResults2 = douglasPeucker(pts.slice(index), eps)
        return recResults1.slice(0, recResults1.length - 1).concat(recResults2)
    } else {
        return [pts[0], pts[end]]
    }
  }

  let simplified = douglasPeucker(track, epsilon)

  // If we still have too many points, dynamically increase epsilon (or just slice but keeping endpoints)
  while (simplified.length > maxPoints) {
    epsilon *= 1.5
    simplified = douglasPeucker(track, epsilon)
  }

  return simplified
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
