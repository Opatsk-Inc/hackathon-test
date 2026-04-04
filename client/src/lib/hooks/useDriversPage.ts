import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getActiveTrips, resolveSos } from "@/lib/api"
import type { ITrip } from "@/lib/types"

export function useDriversPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: trips = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ITrip[]>({
    queryKey: ["activeTrips"],
    queryFn: getActiveTrips,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const resolveSosMutation = useMutation({
    mutationFn: (tripId: string) => resolveSos(tripId),
    onSuccess: (updatedTrip: ITrip) => {
      // Оновлюємо кеш активних поїздок
      queryClient.setQueryData(
        ["activeTrips"],
        (old: ITrip[] | undefined) =>
          old?.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)) || []
      )
      // Також оновлюємо кеш замовлень, бо після вирішення SOS можуть бути зміни
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const filteredTrips = trips.filter((t: ITrip) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      t.driverName?.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
    )
  })

  const handleSos = (tripId: string) => {
    resolveSosMutation.mutate(tripId)
  }

  const copyMagicLink = (magicToken: string) => {
    const link = `${window.location.origin}/driver/${magicToken}`
    navigator.clipboard.writeText(link)
  }

  return {
    trips: filteredTrips,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
    handleSos,
    copyMagicLink,
    isResolvingSos: resolveSosMutation.isPending,
    resolveSosVariables: resolveSosMutation.variables,
  }
}
