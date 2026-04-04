import { fetchWithAuth } from "@/shared/api/http"
import type { IGlobalInventory } from "../types/warehouse.types"
import type { IInventory, IOrder } from "@/shared/types"

// ─── DISPATCHER ENDPOINTS ───────────────────────────────────────────

// WAREHOUSES
export const getWarehouses = () => fetchWithAuth("/api/warehouses")

export const getGlobalInventory = () =>
  fetchWithAuth("/api/inventory/global") as Promise<IGlobalInventory[]>

// ─── WAREHOUSE MANAGER ENDPOINTS ────────────────────────────────────

// Inventory
export const getMyInventory = () =>
  fetchWithAuth("/api/inventory/my") as Promise<IInventory[]>

export type AdjustInventoryPayload = {
  resourceId: string
  quantity: number
}

export const adjustInventory = (payload: AdjustInventoryPayload) =>
  fetchWithAuth("/api/inventory/my/adjust", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

// Orders
export const getMyOrders = () =>
  fetchWithAuth("/api/orders/my") as Promise<IOrder[]>

export type CreateOrderPayload = {
  resourceId: string
  quantity: number
  priority: string
}

export const createOrder = (payload: CreateOrderPayload) =>
  fetchWithAuth("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

export const packOrder = (orderId: string) =>
  fetchWithAuth(`/api/orders/${orderId}/pack`, {
    method: "PATCH",
  })
