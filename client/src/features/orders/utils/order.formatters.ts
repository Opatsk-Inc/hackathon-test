import type { IOrder } from "@/shared/types"

// Filtering
export const filterOrdersByStatus = (orders: IOrder[], status: string) => {
  return orders.filter(
    (order: IOrder) => order.status.toLowerCase() === status.toLowerCase()
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
  if (s === "in_transit") return "In Transit"
  if (s === "delivered") return "Delivered"
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

export const getOrderPriority = (order: IOrder) => {
  if (order.priority === "CRITICAL") return 3
  if (order.priority === "HIGH") return 2
  return 1
}

export const getOrderStatusVariant = (status: string) => {
  const s = status.toLowerCase()
  if (s === "pending" || s === "en_route") return "pending"
  if (s === "in_transit") return "in_transit"
  if (s === "delivered") return "delivered"
  if (s === "sos" || s === "cancelled") return "destructive"
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
