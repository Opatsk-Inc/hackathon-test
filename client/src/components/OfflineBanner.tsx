import { useState, useEffect } from "react"
import { WifiOff, AlertTriangle } from "lucide-react"

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 z-[1000] flex w-full items-center justify-center gap-2 bg-destructive px-4 py-2 text-[10px] font-bold tracking-widest text-destructive-foreground uppercase shadow-lg animate-in slide-in-from-top duration-300">
      <WifiOff className="h-3 w-3" />
      <span>Offline Mode</span>
      <span className="hidden opacity-80 sm:inline">
        — Using cached data. Actions will sync when connection returns.
      </span>
      <AlertTriangle className="h-3 w-3 opacity-80" />
    </div>
  )
}
