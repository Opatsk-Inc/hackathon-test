import type { IWarehouse as SharedIWarehouse } from "@/shared/types"

export interface IWarehouseWithTotals extends SharedIWarehouse {
  totalItems: number
  reservedItems: number
  activeShipments: number
}

export interface IGlobalInventory {
  resource: {
    id: string
    name?: string
  }
  totalAvailable: number
  totalReserved: number
}
