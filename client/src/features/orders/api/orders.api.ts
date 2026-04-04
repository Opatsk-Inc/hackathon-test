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
