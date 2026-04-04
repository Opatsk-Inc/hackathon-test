import { useQuery } from "@tanstack/react-query"
import { getWarehouses as getWarehousesAPI } from "../api/warehouses.api"
import type { IWarehouse } from "@/shared/types"
import {
  calculateReservedQuantity,
  calculateAvailableQuantity,
} from "../utils/warehouse.utils"

export function useWarehouses() {
  const {
    data: warehouses = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehousesAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Calculate totals for each warehouse
  const warehousesWithTotals = warehouses.map((warehouse: IWarehouse) => ({
    ...warehouse,
    totalItems: calculateAvailableQuantity(warehouse.inventory || []),
    reservedItems: calculateReservedQuantity(warehouse.inventory || []),
    activeShipments: warehouse.ordersOut ? warehouse.ordersOut.length : 0,
  }))

  return {
    warehouses: warehousesWithTotals,
    isLoading,
    error,
    refetch,
  }
}
