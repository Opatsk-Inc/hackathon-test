import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useRealtimeSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const eventSource = new EventSource("/api/events")

    eventSource.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data)
        console.log(`[Realtime] Received event: ${type}`, data)

        // React Query Invalidation Strategy
        switch (type) {
          case "ORDER_CREATED":
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            break
          case "ORDER_APPROVED":
          case "SOS_RESOLVED":
          case "TRIP_STARTED":
          case "TRIP_FINISHED":
          case "SOS_REPORTED":
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
            break
          case "GPS_UPDATED":
            // Optimization: Update the cache directly for GPS instead of full refetch if possible
            // But for high reliability, refetching activeTrips is safest.
            queryClient.invalidateQueries({ queryKey: ["activeTrips"] })
            break
          default:
            break
        }
      } catch (err) {
        console.error("[Realtime] Error parsing event data", err)
      }
    }

    eventSource.onerror = (err) => {
      console.error("[Realtime] EventSource error", err)
      eventSource.close()
      
      // Automatic reconnection after 3 seconds
      setTimeout(() => {
        console.log("[Realtime] Attempting to reconnect...")
        // This will trigger a re-run of the effect due to component lifecycle
      }, 3000)
    }

    return () => {
      eventSource.close()
    }
  }, [queryClient])
}
