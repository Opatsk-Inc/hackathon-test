/**
 * Утиліти для детекції та розв'язання накладання маркерів у піксельному просторі.
 * Використовує map.project / map.unproject для перетворення між координатами та пікселями.
 */

import type { Map as MapLibreMap, PointLike } from "maplibre-gl"

// ============================================================
// Конфігурація
// ============================================================

export const OVERLAP_CONFIG = {
  /** Радіус колізії в пікселях */
  COLLISION_RADIUS_PX: 16,
  /** Максимальний зум для входу в overlap режим (hysteresis: enter) */
  OVERLAP_ENTER_MAX_ZOOM: 11.6,
  /** Мінімальний зум для виходу з overlap режиму (hysteresis: exit) */
  OVERLAP_EXIT_MIN_ZOOM: 12.6,
  /** Максимальний зум, при якому активне накладання (deprecated, use hysteresis) */
  OVERLAP_ACTIVE_MAX_ZOOM: 12,
  /** Відступ між маркерами у групі (пікселі) */
  SPACING_PX: 22,
  /** Час анімації переходу (мс) */
  ANIMATION_MS: 220,
  /** Максимальний розмір групи для layout (після цього — кластеризація) */
  MAX_GROUP_LAYOUT: 12,
  /** Відступ від країв viewport (px) */
  VIEWPORT_PADDING_PX: 20,
} as const

// ============================================================
// Типи
// ============================================================

export type MarkerEntity = {
  id: string
  type: "warehouse" | "driver"
  realLng: number
  realLat: number
  /** Пріоритет: більше значення = вищий пріоритет (driver > warehouse) */
  priority: number
  /** Додаткові дані для tooltip/icon */
  payload?: Record<string, unknown>
}

export type DisplayPosition = {
  displayLng: number
  displayLat: number
  isOverlapped: boolean
  clusterSize: number
  /** Інтерпольована позиція для анімації */
  animatedLng?: number
  animatedLat?: number
}

export type PositionOffset = {
  dx: number
  dy: number
}

// ============================================================
// Детекція накладання
// ============================================================

/**
 * Перевіряє, чи дві точки перетинаються в піксельному просторі.
 */
function pointsOverlap(
  a: { x: number; y: number },
  b: { x: number; y: number },
  radius: number
): boolean {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const distanceSquared = dx * dx + dy * dy
  const thresholdSquared = radius * 2 * (radius * 2)
  return distanceSquared < thresholdSquared
}

/**
 * Побудова груп накладання (connected components).
 * Використовує Union-Find для ефективного групування.
 */
function buildOverlapGroups(
  screenPoints: Array<{ x: number; y: number }>,
  radius: number
): number[][] {
  const n = screenPoints.length
  const parent = Array.from({ length: n }, (_, i) => i)

  const find = (i: number): number => {
    if (parent[i] !== i) {
      parent[i] = find(parent[i])
    }
    return parent[i]
  }

  const union = (i: number, j: number): void => {
    const rootI = find(i)
    const rootJ = find(j)
    if (rootI !== rootJ) {
      parent[rootI] = rootJ
    }
  }

  // O(n²) pairwise check — достатньо для <100 маркерів
  // Для більшої кількості рекомендується spatial hash
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (pointsOverlap(screenPoints[i], screenPoints[j], radius)) {
        union(i, j)
      }
    }
  }

  // Збираємо групи
  const groups: Map<number, number[]> = new Map()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    if (!groups.has(root)) {
      groups.set(root, [])
    }
    groups.get(root)!.push(i)
  }

  return Array.from(groups.values())
}

// ============================================================
// Розкладка маркерів у групі
// ============================================================

/**
 * Генерує зміщення для маркерів у групі.
 * - 2-4 маркери: горизонтальний ряд
 * - 5+: півколо
 */
function generateGroupOffsets(
  groupSize: number,
  spacing: number
): PositionOffset[] {
  const offsets: PositionOffset[] = []

  if (groupSize <= 1) {
    return [{ dx: 0, dy: 0 }]
  }

  if (groupSize <= 4) {
    // Горизонтальний ряд з центруванням
    const totalWidth = (groupSize - 1) * spacing
    for (let i = 0; i < groupSize; i++) {
      const x = -totalWidth / 2 + i * spacing
      offsets.push({ dx: x, dy: 0 })
    }
    return offsets
  }

  // Півколо для 5+ маркерів
  const radius = spacing * Math.ceil(groupSize / 2)
  const arcAngle = Math.PI // 180 градусів
  const startAngle = Math.PI // починаємо зліва
  for (let i = 0; i < groupSize; i++) {
    const angle = startAngle - (i / (groupSize - 1)) * arcAngle
    offsets.push({
      dx: radius * Math.cos(angle),
      dy: radius * Math.sin(angle),
    })
  }

  return offsets
}

// ============================================================
// Головний алгоритм
// ============================================================

/** Clamp value to [min, max] */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Обчислює display-позиції для всіх маркерів з урахуванням накладання.
 *
 * @param markers Масив маркерних сутностей
 * @param map Екземпляр MapLibre
 * @param config Опціональна override конфігурація
 * @returns Мапа id -> DisplayPosition
 */
export function computeNonOverlappingPositions(
  markers: MarkerEntity[],
  map: MapLibreMap,
  config?: Partial<typeof OVERLAP_CONFIG> & { skipClamp?: boolean }
): Map<string, DisplayPosition> {
  const cfg = { ...OVERLAP_CONFIG, ...config }
  const result = new Map<string, DisplayPosition>()

  const zoom = map.getZoom()

  // Якщо маркерів немає або зум не передбачає overlap — повертаємо реальні позиції
  if (markers.length === 0 || zoom >= 14) {
    for (const m of markers) {
      result.set(m.id, {
        displayLng: m.realLng,
        displayLat: m.realLat,
        isOverlapped: false,
        clusterSize: 1,
      })
    }
    return result
  }

  // Проектуємо всі точки в пікселі
  const screenPoints = markers.map((m) => {
    const point = map.project([m.realLng, m.realLat])
    return { x: point.x, y: point.y }
  })

  // Визначаємо групи накладання
  const groups = buildOverlapGroups(screenPoints, cfg.COLLISION_RADIUS_PX)

  // Для кожної групи обчислюємо розкладку
  for (const group of groups) {
    const groupSize = group.length
    const isGroupOverlapped = groupSize > 1

    if (!isGroupOverlapped) {
      // Одиночний маркер — без змін
      const marker = markers[group[0]]!
      result.set(marker.id, {
        displayLng: marker.realLng,
        displayLat: marker.realLat,
        isOverlapped: false,
        clusterSize: 1,
      })
      continue
    }

    // Сортуємо маркери за пріоритетом (стабільний порядок)
    const sortedIndices = [...group].sort((a, b) => {
      const pa = markers[a]!.priority
      const pb = markers[b]!.priority
      if (pa !== pb) return pb - pa
      // При рівному пріоритеті — за id (лексикографічно)
      return markers[a]!.id.localeCompare(markers[b]!.id)
    })

    // Центральна точка групи (середнє піксельне)
    const centerX =
      sortedIndices.reduce((sum, idx) => sum + screenPoints[idx]!.x, 0) /
      groupSize
    const centerY =
      sortedIndices.reduce((sum, idx) => sum + screenPoints[idx]!.y, 0) /
      groupSize

    // MAX_GROUP_LAYOUT fallback: layout only first N, show badge count for rest
    const layoutCount = Math.min(groupSize, cfg.MAX_GROUP_LAYOUT)
    const overflowCount = groupSize - layoutCount

    // Генеруємо зміщення тільки для layouted markers
    const offsets = generateGroupOffsets(layoutCount, cfg.SPACING_PX)

    // Отримуємо розміри контейнера для viewport clamp
    const container = map.getContainer()
    const viewportWidth = container.clientWidth
    const viewportHeight = container.clientHeight
    const padding = cfg.VIEWPORT_PADDING_PX

    // Для кожного маркера в групі
    for (let i = 0; i < layoutCount; i++) {
      const markerIndex = sortedIndices[i]!
      const marker = markers[markerIndex]!
      const offset = offsets[i] ?? { dx: 0, dy: 0 }

      // Обчислюємо pixel-позицію з offset
      let pixelX = centerX + offset.dx
      let pixelY = centerY + offset.dy

      // Clamp до viewport (skip if requested, e.g. during interaction)
      if (!config?.skipClamp) {
        pixelX = clamp(pixelX, padding, viewportWidth - padding)
        pixelY = clamp(pixelY, padding, viewportHeight - padding)
      }

      // Перетворюємо назад у lng/lat
      const offsetLngLat = map.unproject({ x: pixelX, y: pixelY } as PointLike)

      result.set(marker.id, {
        displayLng: offsetLngLat.lng,
        displayLat: offsetLngLat.lat,
        isOverlapped: true,
        clusterSize: groupSize,
      })
    }

    // Overflow markers: place them at the anchor position with badge info
    for (let i = layoutCount; i < sortedIndices.length; i++) {
      const markerIndex = sortedIndices[i]!
      const marker = markers[markerIndex]!
      result.set(marker.id, {
        displayLng: marker.realLng,
        displayLat: marker.realLat,
        isOverlapped: true,
        clusterSize: overflowCount,
      })
    }
  }

  return result
}

// ============================================================
// Анімація інтерполяції
// ============================================================

/**
 * Easing: easeOutCubic
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Інтерполює між двома позиціями.
 *
 * @param from Початкова позиція
 * @param to Кінцева позиція
 * @param progress Прогрес від 0 до 1
 * @param easing Функція easing (за замовчуванням easeOutCubic)
 */
export function interpolatePosition(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number },
  progress: number,
  easing: (t: number) => number = easeOutCubic
): { lng: number; lat: number } {
  const t = easing(Math.min(1, Math.max(0, progress)))
  return {
    lng: from.lng + (to.lng - from.lng) * t,
    lat: from.lat + (to.lat - from.lat) * t,
  }
}

/**
 * Перевіряє, чи користувач увімкнув prefers-reduced-motion.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// ============================================================
// Hysteresis helpers
// ============================================================

/**
 * Convert zoom to bucket for significance comparison.
 */
export function zoomToBucket(zoom: number, bucketSize: number = 0.25): number {
  return Math.floor(zoom / bucketSize)
}

/**
 * Whether overlap mode should be active given current zoom and previous state.
 * Implements hysteresis: enter at lower zoom, exit at higher zoom.
 */
export function shouldApplyOverlap(
  zoom: number,
  wasOverlapMode: boolean,
  config?: Partial<typeof OVERLAP_CONFIG>
): boolean {
  const cfg = { ...OVERLAP_CONFIG, ...config }
  if (wasOverlapMode) {
    // Stay in overlap until zoom exceeds exit threshold
    return zoom < cfg.OVERLAP_EXIT_MIN_ZOOM
  }
  // Enter overlap when zoom drops below enter threshold
  return zoom <= cfg.OVERLAP_ENTER_MAX_ZOOM
}
