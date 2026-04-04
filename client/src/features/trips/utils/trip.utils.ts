import type { ITrip } from "@/shared/types"

// Фільтрування
export const filterTripsByStatus = (trips: ITrip[], status: string) => {
  return trips.filter(
    (trip: ITrip) => trip.status.toLowerCase() === status.toLowerCase()
  )
}

// Форматування
export const formatTripStatus = (status: string) => {
  const s = status.toLowerCase()
  if (s === "scheduled") return "Заплановано"
  if (s === "in_transit" || s === "en_route") return "В дорозі"
  if (s === "completed") return "Завершено"
  if (s === "sos") return "SOS"
  if (s === "cancelled") return "Скасовано"
  return status
}

export const getTripStatusVariant = (status: string) => {
  const s = status.toLowerCase()
  if (s === "pending" || s === "en_route") return "pending"
  if (s === "in_transit") return "in_transit"
  if (s === "delivered") return "delivered"
  if (s === "sos") return "sos"
  if (s === "cancelled") return "destructive"
  return "outline"
}

// Пошук
export const searchTrips = (trips: ITrip[], query: string) => {
  const q = query.toLowerCase()
  return trips.filter((trip: ITrip) => {
    return (
      trip.driverName?.toLowerCase().includes(q) ||
      trip.id.toLowerCase().includes(q)
    )
  })
}
