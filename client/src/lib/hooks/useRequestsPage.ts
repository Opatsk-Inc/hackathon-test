import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getOrders, approveOrder, type IApproveOrderResponse } from "@/lib/api"
import type { IOrder } from "@/lib/types"

export function useRequestsPage() {
  const queryClient = useQueryClient()
  const [approveOrderId, setApproveOrderId] = useState<string | null>(null)
  const [driverName, setDriverName] = useState("")

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

  const approveMutation = useMutation({
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
      // Скидаємо стан форми
      setApproveOrderId(null)
      setDriverName("")
    },
  })

  const pendingOrders = orders.filter((o: IOrder) => o.status === "PENDING")

  const handleApproveSubmit = (orderId: string, driver: string) => {
    if (!orderId || !driver) return
    approveMutation.mutate({ orderId, payload: { driverName: driver } })
  }

  return {
    pendingOrders,
    isLoading,
    error,
    refetch,
    approveOrderId,
    setApproveOrderId,
    driverName,
    setDriverName,
    handleApproveSubmit,
    isApproving: approveMutation.isPending,
    approveError: approveMutation.error,
  }
}
