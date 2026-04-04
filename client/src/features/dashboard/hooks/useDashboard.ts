import { useQuery } from "@tanstack/react-query"
import { getOrders as getOrdersAPI } from "../../orders/api/orders.api"
import { getWarehouses as getWarehousesAPI } from "../../warehouses/api/warehouses.api"
import { getActiveTrips as getActiveTripsAPI } from "../../trips/api/trips.api"
import type { IOrder } from "@/shared/types"
import type { IActiveTrip } from "../../trips/types/trip.types"

export function useDashboard() {
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: getOrdersAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const {
    data: warehouses = [],
    isLoading: warehousesLoading,
    error: warehousesError,
  } = useQuery({
    queryKey: ["warehouses"],
    queryFn: getWarehousesAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const {
    data: activeTrips = [],
    isLoading: tripsLoading,
    error: tripsError,
  } = useQuery<IActiveTrip[]>({
    queryKey: ["activeTrips"],
    queryFn: getActiveTripsAPI,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  return {
    orders,
    warehouses,
    activeTrips,
    isLoading: ordersLoading || warehousesLoading || tripsLoading,
    error: ordersError || warehousesError || tripsError,
  }
}
