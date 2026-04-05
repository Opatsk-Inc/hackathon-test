import { fetchWithAuth } from "@/shared/api/http"
import type {
  IApproveOrderPayload,
  IApproveOrderResponse,
} from "../types/order.types"

// ORDERS
export const getOrders = () => fetchWithAuth("/api/orders")

export const approveOrder = (orderId: string, payload: IApproveOrderPayload) =>
  fetchWithAuth(`/api/orders/${orderId}/approve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }) as Promise<IApproveOrderResponse>

export const rejectOrder = (orderId: string) =>
  fetchWithAuth(`/api/orders/${orderId}/reject`, {
    method: "PATCH",
  })

export const updateOrder = (
  orderId: string,
  payload: { quantity?: number; priority?: string }
) =>
  fetchWithAuth(`/api/orders/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
