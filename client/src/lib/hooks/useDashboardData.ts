import { useQuery } from "@tanstack/react-query"
import { getOrders, getWarehouses } from "../api"
import type { IOrder, IWarehouse } from "../types"

export function useDashboardData() {
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
    staleTime: 30000, // 30 сек до "протухання"
    gcTime: 5 * 60 * 1000, // 5 хв тримати в пам'яті
    retry: 2, // Повтор при помилці
  })

  const {
    data: warehouses = [],
    isLoading: warehousesLoading,
    error: warehousesError,
  } = useQuery<IWarehouse[]>({
    queryKey: ["warehouses"],
    queryFn: getWarehouses,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Вся логіка тут - активні доставки
  const activeTrips = orders.filter(
    (o: IOrder) => o.trip?.status === "IN_TRANSIT" || o.status === "IN_TRANSIT"
  )

  return {
    orders,
    warehouses,
    activeTrips,
    isLoading: ordersLoading || warehousesLoading,
    error: ordersError || warehousesError,
  }
}
