import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { IOrder, ITrip, IInventory } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Filtering
export const filterOrdersByStatus = (orders: IOrder[], status: string) => {
  return orders.filter(
    (order: IOrder) => order.status.toLowerCase() === status.toLowerCase()
  )
}

export const filterTripsByStatus = (trips: ITrip[], status: string) => {
  return trips.filter(
    (trip: ITrip) => trip.status.toLowerCase() === status.toLowerCase()
  )
}

export const filterOrdersByPriority = (orders: IOrder[], priority: string) => {
  return orders.filter(
    (order: IOrder) => order.priority.toLowerCase() === priority.toLowerCase()
  )
}

// Formatting
export const formatOrderStatus = (status: string) => {
  const s = status.toLowerCase()
  if (s === "pending") return "Pending"
  if (s === "approved") return "Approved"
  if (s === "packed") return "Packed"
  if (s === "in_transit") return "In transit"
  if (s === "delivered") return "Delivered"
  if (s === "cancelled") return "Cancelled"
  if (s === "rejected") return "Rejected"
  return status
}

export const formatTripStatus = (status: string) => {
  const s = status.toLowerCase()
  if (s === "scheduled") return "Scheduled"
  if (s === "in_transit") return "In transit"
  if (s === "completed") return "Completed"
  if (s === "sos") return "SOS"
  if (s === "cancelled") return "Cancelled"
  return status
}

export const formatPriorityLevel = (priority: string) => {
  const p = priority.toLowerCase()
  if (p === "normal") return "Normal"
  if (p === "high") return "High"
  if (p === "critical") return "Critical"
  return priority
}

export const formatDate = (date: string | Date) => {
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString("en-US")
  }
  return date.toLocaleDateString("en-US")
}

export const formatDateTime = (date: string | Date) => {
  if (typeof date === "string") {
    return new Date(date).toLocaleString("en-US")
  }
  return date.toLocaleString("en-US")
}

// Calculation
export const calculateReservedQuantity = (inventory: IInventory[]) => {
  return (
    inventory?.reduce(
      (acc: number, inv: IInventory) => acc + inv.quantityReserved,
      0
    ) || 0
  )
}

export const calculateAvailableQuantity = (inventory: IInventory[]) => {
  return (
    inventory?.reduce(
      (acc: number, inv: IInventory) => acc + inv.quantityAvailable,
      0
    ) || 0
  )
}

export const getOrderPriority = (order: IOrder) => {
  if (order.priority === "CRITICAL") return 3
  if (order.priority === "HIGH") return 2
  return 1
}

export const getTripStatusVariant = (status: string) => {
  const s = status.toLowerCase()
  if (s === "pending") return "pending"
  if (s === "in_transit") return "in_transit"
  if (s === "delivered") return "delivered"
  if (s === "sos") return "sos"
  if (s === "cancelled") return "destructive"
  return "outline"
}

export const getOrderStatusVariant = (status: string) => {
  const s = status.toLowerCase()
  if (s === "pending" || s === "en_route") return "pending"
  if (s === "in_transit") return "in_transit"
  if (s === "delivered") return "delivered"
  if (s === "sos" || s === "cancelled" || s === "rejected") return "destructive"
  return "outline"
}

export const getPriorityVariant = (priority: string) => {
  const p = priority.toLowerCase()
  if (p === "critical") return "critical"
  if (p === "high") return "high"
  if (p === "normal") return "normal"
  return "outline"
}

// Search
export const searchOrders = (orders: IOrder[], query: string) => {
  const q = query.toLowerCase()
  return orders.filter((order: IOrder) => {
    return (
      order.id.toLowerCase().includes(q) ||
      (order.resource?.name || "").toLowerCase().includes(q) ||
      (order.provider?.name || "").toLowerCase().includes(q) ||
      (order.requester?.name || "").toLowerCase().includes(q)
    )
  })
}

export const searchTrips = (trips: ITrip[], query: string) => {
  const q = query.toLowerCase()
  return trips.filter((trip: ITrip) => {
    return (
      trip.driverName?.toLowerCase().includes(q) ||
      trip.id.toLowerCase().includes(q)
    )
  })
}
