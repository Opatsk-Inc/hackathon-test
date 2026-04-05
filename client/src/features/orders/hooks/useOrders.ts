import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getOrders as getOrdersAPI,
  approveOrder as approveOrderAPI,
  rejectOrder as rejectOrderAPI,
} from "../api/orders.api"
import type { IOrder } from "@/shared/types"
import type { IApproveOrderResponse } from "../types/order.types"
import {
  searchOrders,
  filterOrdersByStatus,
  filterOrdersByPriority,
} from "../utils/order.formatters"

export function useOrders() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrdersAPI,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const approveOrderMutation = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string
      payload: { driverName: string }
    }) => approveOrderAPI(orderId, payload),
    onSuccess: (response: IApproveOrderResponse) => {
      const updatedOrder = response.order

      queryClient.setQueryData<IOrder[]>(
        ["orders"],
        (old) =>
          old?.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)) ?? []
      )

      queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })

  // Expose the mutation for component-level success handling
  const approveOrder = (
    params: { orderId: string; payload: { driverName: string } },
    options?: { onSuccess?: (response: IApproveOrderResponse) => void }
  ) => {
    return approveOrderMutation.mutate(params, {
      onSuccess: (response) => {
        const updatedOrder = response.order

        queryClient.setQueryData<IOrder[]>(
          ["orders"],
          (old) =>
            old?.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)) ?? []
        )

        queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
        queryClient.invalidateQueries({ queryKey: ["requests"] })

        // Call component-level success callback if provided
        options?.onSuccess?.(response)
      },
    })
  }

  const rejectOrderMutation = useMutation({
    mutationFn: (orderId: string) => rejectOrderAPI(orderId),
    onSuccess: (updatedOrder: IOrder) => {
      queryClient.setQueryData<IOrder[]>(["orders"], (old) =>
        old?.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)) ?? []
      )
      queryClient.invalidateQueries({ queryKey: ["requests"] })
    },
  })

  // Expose the mutation for component-level success handling
  const rejectOrder = (
    orderId: string,
    options?: { onSuccess?: (response: IOrder) => void }
  ) => {
    return rejectOrderMutation.mutate(orderId, {
      onSuccess: (response) => {
        queryClient.setQueryData<IOrder[]>(["orders"], (old) =>
          old?.map((o) => (o.id === response.id ? response : o)) ?? []
        )
        queryClient.invalidateQueries({ queryKey: ["requests"] })
        options?.onSuccess?.(response)
      },
    })
  }

  // Filter functionality
  const filteredOrders = orders.filter((o: IOrder) => {
    // Search query match
    const matchesSearch = searchQuery
      ? searchOrders([o], searchQuery).length > 0
      : true

    // Status filter match
    const matchesStatus =
      statusFilter === "all" ||
      filterOrdersByStatus([o], statusFilter).length > 0

    // Urgency match
    const matchesUrgency =
      urgencyFilter === "all" ||
      filterOrdersByPriority([o], urgencyFilter).length > 0

    return matchesSearch && matchesStatus && matchesUrgency
  })

  return {
    orders: filteredOrders,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    urgencyFilter,
    setUrgencyFilter,
    refetch,
    approveOrder,
    isApproving: approveOrderMutation.isPending,
    approveOrderError: approveOrderMutation.error,
    rejectOrder,
    isRejecting: rejectOrderMutation.isPending,
    rejectOrderError: rejectOrderMutation.error,
  }
}
