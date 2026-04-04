import type { IOrder as SharedIOrder } from "@/shared/types"

export interface IApproveOrderPayload {
  driverName: string
}

export interface IApproveOrderResponse {
  order: SharedIOrder
  trip: {
    id: string
    magicToken: string
    status: string
    driverName?: string
  }
  magicLink: string
}
