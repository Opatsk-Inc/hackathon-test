import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getOrders, approveOrder, type IApproveOrderResponse } from "@/lib/api"
import type { IOrder } from "@/lib/types"
import { searchOrders } from "@/lib/utils"

export function useOrdersPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [urgencyFilter, setUrgencyFilter] = useState("all")

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<IOrder[]>({
    queryKey: ["orders"],
    queryFn: getOrders,
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
    }) => approveOrder(orderId, payload),
    onSuccess: (response: IApproveOrderResponse) => {
      const updatedOrder = response.order
      // Оновлюємо кеш замість перезавантаження
      queryClient.setQueryData(
        ["orders"],
        (old: IOrder[] | undefined) =>
          old?.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)) || []
      )
    },
  })

  // Filter functionality
  const filteredOrders = orders.filter((o: IOrder) => {
    // Search query match
    const matchesSearch = searchQuery
      ? searchOrders([o], searchQuery).length > 0
      : true

    // Status filter match
    const matchesStatus =
      statusFilter === "all" || o.status.toLowerCase() === statusFilter

    // Urgency match
    const matchesUrgency =
      urgencyFilter === "all" || o.priority.toLowerCase() === urgencyFilter

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
    approveOrder: approveOrderMutation.mutate,
    isApproving: approveOrderMutation.isPending,
  }
}
