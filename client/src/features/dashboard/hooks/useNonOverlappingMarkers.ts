import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import type { Map as MapLibreMap } from "maplibre-gl"
import type { IWarehouse } from "@/shared/types"
import type { IActiveTrip } from "@/features/trips/types/trip.types"
import {
  computeNonOverlappingPositions,
  interpolatePosition,
  prefersReducedMotion,
  zoomToBucket,
  shouldApplyOverlap,
  type MarkerEntity,
  type DisplayPosition,
} from "@/features/dashboard/utils/use-marker-overlap"

/** Результат хука */
export type NonOverlappingMarkersResult = {
  positions: Map<string, DisplayPosition>
  isOverlapMode: boolean
}

/** Вхідні параметри хука */
export type UseNonOverlappingMarkersInput = {
  map: MapLibreMap | null
  warehouses: IWarehouse[]
  activeTrips: IActiveTrip[]
}

// ============================================================
// Constants
// ============================================================

/** Епсилон для географічних координат (градуси) */
const EPSILON_WORLD = 0.00001

/** Розмір зум-букета */
const ZOOM_BUCKET = 0.25

/** Довжина анімації після стабілізації (мс) */
const SETTLE_TWEEN_MS = 200

/** Затримка перед переходом у settling після moveend (мс) */
const SETTLING_DELAY_MS = 80

// ============================================================
// Camera interaction state
// ============================================================

type InteractionPhase = "idle" | "interacting" | "settling"

// ============================================================
// Hook
// ============================================================

export function useNonOverlappingMarkers({
  map,
  warehouses,
  activeTrips,
}: UseNonOverlappingMarkersInput): NonOverlappingMarkersResult {
  const [positions, setPositions] = useState<Map<string, DisplayPosition>>(
    () => new Map()
  )
  const [isOverlapMode, setIsOverlapMode] = useState(false)

  // Попередні позиції для анімації
  const prevPositionsRef = useRef<Map<string, DisplayPosition>>(new Map())
  const animationFrameRef = useRef<number | null>(null)
  const animationStartRef = useRef<number>(0)

  // Поточні маркери (зберігаємо в ref для доступу в callbacks)
  const markersRef = useRef<MarkerEntity[]>([])

  // Camera interaction state
  const interactionPhaseRef = useRef<InteractionPhase>("idle")
  // Settling debounce timer
  const settlingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Last stable layout (frozen during interaction, updated on settle)
  const lastStableLayoutRef = useRef<Map<string, DisplayPosition>>(new Map())

  // Last significant change snapshot (world-space + zoom bucket)
  const lastSignificantRef = useRef<{
    targets: Map<string, DisplayPosition>
    zoomBucket: number
  } | null>(null)

  // Overlap hysteresis state
  const overlapModeRef = useRef(false)

  // =====================
  // Entity builders
  // =====================

  const warehouseEntities = useMemo<MarkerEntity[]>(() => {
    return warehouses.map((w) => ({
      id: `warehouse-${w.id}`,
      type: "warehouse" as const,
      realLng: w.lng,
      realLat: w.lat,
      priority: 1,
      payload: { warehouse: w },
    }))
  }, [warehouses])

  const driverEntities = useMemo<MarkerEntity[]>(() => {
    return activeTrips
      .filter(
        (t): t is IActiveTrip & { currentLat: number; currentLng: number } =>
          typeof t.currentLat === "number" &&
          typeof t.currentLng === "number" &&
          Number.isFinite(t.currentLat) &&
          Number.isFinite(t.currentLng)
      )
      .map((t) => ({
        id: `driver-${t.id}`,
        type: "driver" as const,
        realLng: t.currentLng,
        realLat: t.currentLat,
        priority: 2,
        payload: { trip: t },
      }))
  }, [activeTrips])

  useEffect(() => {
    markersRef.current = [...warehouseEntities, ...driverEntities]
  }, [warehouseEntities, driverEntities])

  // =====================
  // Significance check (world-space + zoom bucket)
  // =====================

  const hasSignificantChange = useCallback(
    (targets: Map<string, DisplayPosition>, zoom: number): boolean => {
      const last = lastSignificantRef.current
      if (!last) return true // first compute

      if (targets.size !== last.targets.size) return true

      // Zoom bucket check
      const currentBucket = zoomToBucket(zoom, ZOOM_BUCKET)
      if (Math.abs(currentBucket - last.zoomBucket) > 0) return true

      // World-space lng/lat check
      for (const [id, target] of targets) {
        const prev = last.targets.get(id)
        if (!prev) return true

        const dLng = Math.abs(target.displayLng - prev.displayLng)
        const dLat = Math.abs(target.displayLat - prev.displayLat)
        if (dLng > EPSILON_WORLD || dLat > EPSILON_WORLD) return true
      }
      return false
    },
    []
  )

  /** Update last significant snapshot */
  const updateSignificantSnapshot = useCallback(
    (targets: Map<string, DisplayPosition>, zoom: number) => {
      const bucket = zoomToBucket(zoom, ZOOM_BUCKET)
      lastSignificantRef.current = {
        targets: new Map(targets),
        zoomBucket: bucket,
      }
    },
    []
  )

  // =====================
  // Animation engine with restart lock
  // =====================

  const animateToTargets = useCallback(
    (targets: Map<string, DisplayPosition>) => {
      const phase = interactionPhaseRef.current

      // During active interaction: freeze layout, do not chase camera
      if (phase === "interacting") {
        // Store the new targets as the next stable layout, but don't animate yet
        lastStableLayoutRef.current = new Map(targets)
        // Keep current positions on screen — do NOT call setPositions
        return
      }

      // Check significance
      const significant = hasSignificantChange(targets, map ? map.getZoom() : 0)

      // Animation restart lock: if change is not significant and animation is running, skip restart
      if (!significant && animationFrameRef.current !== null) {
        return // keep current animation running
      }

      // If not significant, update targets gradually without restart
      if (!significant) {
        // Silent target update — will be picked up on next frame
        prevPositionsRef.current = new Map(targets)
        lastSignificantRef.current = {
          targets: new Map(targets),
          zoomBucket: zoomToBucket(map?.getZoom() ?? 0, ZOOM_BUCKET),
        }
        // Store as stable layout for interaction freeze
        lastStableLayoutRef.current = new Map(targets)
        setPositions(new Map(targets))
        return
      }

      // Significant change: restart animation
      // Preserve current interpolated position as start for smoothness
      let startPositions: Map<string, DisplayPosition>
      if (prevPositionsRef.current.size > 0) {
        startPositions = new Map(prevPositionsRef.current)
      } else {
        // First time: use targets as start to avoid snap
        startPositions = new Map(targets)
      }

      animationStartRef.current = performance.now()

      const reducedMotion = prefersReducedMotion()
      // Determine duration based on interaction phase
      let duration: number
      if (reducedMotion) {
        duration = 0
      } else if (phase === "settling") {
        duration = SETTLE_TWEEN_MS
      } else {
        duration = SETTLE_TWEEN_MS
      }

      // Cancel running animation
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }

      const step = (now: number) => {
        const elapsed = now - animationStartRef.current
        const progress = duration > 0 ? Math.min(elapsed / duration, 1) : 1

        const animated = new Map<string, DisplayPosition>()
        for (const [id, target] of targets) {
          const prev = startPositions.get(id)
          if (prev && progress < 1) {
            const interpolated = interpolatePosition(
              { lng: prev.displayLng, lat: prev.displayLat },
              { lng: target.displayLng, lat: target.displayLat },
              progress
            )
            animated.set(id, {
              ...target,
              displayLng: interpolated.lng,
              displayLat: interpolated.lat,
            })
          } else {
            animated.set(id, target)
          }
        }

        setPositions(animated)

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(step)
        } else {
          prevPositionsRef.current = animated
          animationFrameRef.current = null
          // Update snapshot and stable layout after animation completes
          updateSignificantSnapshot(animated, map?.getZoom() ?? 0)
          lastStableLayoutRef.current = new Map(animated)
        }
      }

      animationFrameRef.current = requestAnimationFrame(step)
    },
    [map, hasSignificantChange, updateSignificantSnapshot]
  )

  // =====================
  // Main compute function
  // =====================

  const computePositions = useCallback(() => {
    if (!map || markersRef.current.length === 0) return

    const zoom = map.getZoom()

    // Apply hysteresis: decide whether overlap mode should be active
    const currentOverlapMode = overlapModeRef.current
    const applyOverlap = shouldApplyOverlap(zoom, currentOverlapMode)

    let targets: Map<string, DisplayPosition>
    if (applyOverlap) {
      targets = computeNonOverlappingPositions(markersRef.current, map)
    } else {
      // No overlap: direct mapping
      targets = new Map<string, DisplayPosition>()
      for (const m of markersRef.current) {
        targets.set(m.id, {
          displayLng: m.realLng,
          displayLat: m.realLat,
          isOverlapped: false,
          clusterSize: 1,
        })
      }
    }

    overlapModeRef.current = applyOverlap

    const overlapActive =
      targets.size > 0 &&
      Array.from(targets.values()).some((p) => p.isOverlapped)
    setIsOverlapMode(overlapActive)

    animateToTargets(targets)
  }, [map, animateToTargets])

  // =====================
  // Map event handlers
  // =====================

  useEffect(() => {
    if (!map) return

    const handleMoveStart = () => {
      interactionPhaseRef.current = "interacting"
      // Clear settling timer if user starts interacting again
      if (settlingTimerRef.current !== null) {
        clearTimeout(settlingTimerRef.current)
        settlingTimerRef.current = null
      }
    }

    const handleMoveEnd = () => {
      // Transition to settling after delay
      interactionPhaseRef.current = "settling"
      if (settlingTimerRef.current !== null) {
        clearTimeout(settlingTimerRef.current)
      }
      settlingTimerRef.current = setTimeout(() => {
        interactionPhaseRef.current = "idle"
        settlingTimerRef.current = null
        // Final recompute when fully settled — this is the authoritative update
        computePositions()
      }, SETTLING_DELAY_MS)
    }

    // During interaction: do NOT recompute layout on every move event.
    // The last stable layout from lastStableLayoutRef stays on screen.
    // This eliminates jitter caused by chasing camera motion.

    map.on("movestart", handleMoveStart)
    map.on("moveend", handleMoveEnd)
    map.on("zoomend", handleMoveEnd)

    // Initial computation
    const initTimer = setTimeout(computePositions, 0)

    return () => {
      clearTimeout(initTimer)
      map.off("movestart", handleMoveStart)
      map.off("moveend", handleMoveEnd)
      map.off("zoomend", handleMoveEnd)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (settlingTimerRef.current !== null) {
        clearTimeout(settlingTimerRef.current)
      }
    }
  }, [map, computePositions])

  // Recompute when data changes, even during interaction.
  // Use setTimeout(0) to break the synchronous setState chain and avoid cascading renders.
  const prevWarehouseCountRef = useRef(warehouses.length)
  const prevTripCountRef = useRef(activeTrips.length)

  useEffect(() => {
    const dataChanged =
      warehouses.length !== prevWarehouseCountRef.current ||
      activeTrips.length !== prevTripCountRef.current

    if (!dataChanged || !map) return

    prevWarehouseCountRef.current = warehouses.length
    prevTripCountRef.current = activeTrips.length

    // Reset phase to idle so recompute proceeds even if "interacting"
    const wasInteracting = interactionPhaseRef.current === "interacting"
    if (wasInteracting) {
      interactionPhaseRef.current = "idle"
    }

    const timer = setTimeout(() => {
      computePositions()
      if (wasInteracting) {
        interactionPhaseRef.current = "interacting"
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [warehouses.length, activeTrips.length, map, computePositions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (settlingTimerRef.current !== null) {
        clearTimeout(settlingTimerRef.current)
      }
    }
  }, [])

  return { positions, isOverlapMode }
}
