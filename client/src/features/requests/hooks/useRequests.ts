import { useQuery } from "@tanstack/react-query"
import { getOrders as getOrdersAPI } from "../../orders/api/orders.api" // Using orders API since requests are essentially pending orders
import type { IOrder } from "@/shared/types"

export function useRequests() {
  const {
    data: requests = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["requests"],
    queryFn: getOrdersAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    select: (data: IOrder[]) =>
      data.filter((request) => request.status === "PENDING"),
  })

  return {
    requests,
    isLoading,
    error,
    refetch,
  }
}
