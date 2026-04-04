import { useQuery } from "@tanstack/react-query"
import { getWarehouses } from "@/lib/api"
import type { IWarehouse } from "@/lib/types"
import { calculateReservedQuantity, calculateAvailableQuantity } from "@/lib/utils"

export function useWarehousesPage() {
  const {
    data: warehouses = [],
    isLoading,
    error,
    refetch,
  } = useQuery<IWarehouse[]>({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Calculate totals for each warehouse
  const warehousesWithTotals = warehouses.map((warehouse) => ({
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
