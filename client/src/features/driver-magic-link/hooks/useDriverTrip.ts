import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ITripWithOrder } from "../types"

async function fetchTripByMagicToken(
  magicToken: string
): Promise<ITripWithOrder> {
  const response = await fetch(`/api/driver/${magicToken}`)

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

async function startTrip(magicToken: string): Promise<ITripWithOrder> {
  const response = await fetch(`/api/driver/${magicToken}/start`, {
    method: "PATCH",
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

async function sendSos(magicToken: string): Promise<ITripWithOrder> {
  const response = await fetch(`/api/driver/${magicToken}/sos`, {
    method: "PATCH",
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

async function finishTrip(magicToken: string): Promise<ITripWithOrder> {
  const response = await fetch(`/api/driver/${magicToken}/finish`, {
    method: "PATCH",
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorText}`)
  }

  return response.json()
}

export function useDriverTrip(magicToken: string) {
  const queryClient = useQueryClient()

  const {
    data: trip,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["driver-trip", magicToken],
    queryFn: () => fetchTripByMagicToken(magicToken),
    enabled: !!magicToken,
    retry: false,
    staleTime: 0,
  })

  const startTripMutation = useMutation({
    mutationFn: () => startTrip(magicToken),
    onSuccess: (data) => {
      queryClient.setQueryData(["driver-trip", magicToken], data)
    },
  })

  const sosMutation = useMutation({
    mutationFn: () => sendSos(magicToken),
    onSuccess: (data) => {
      queryClient.setQueryData(["driver-trip", magicToken], data)
    },
  })

  const finishTripMutation = useMutation({
    mutationFn: () => finishTrip(magicToken),
    onSuccess: (data) => {
      queryClient.setQueryData(["driver-trip", magicToken], data)
    },
  })

  const notFound = error instanceof Error && error.message.includes("404")

  return {
    trip,
    isLoading,
    error: error instanceof Error ? error.message : null,
    notFound,
    refetch,
    startTrip: startTripMutation.mutate,
    isStartingTrip: startTripMutation.isPending,
    startTripError: startTripMutation.error,
    sendSos: sosMutation.mutate,
    isSendingSos: sosMutation.isPending,
    sosError: sosMutation.error,
    finishTrip: finishTripMutation.mutate,
    isFinishingTrip: finishTripMutation.isPending,
    finishTripError: finishTripMutation.error,
  }
}
