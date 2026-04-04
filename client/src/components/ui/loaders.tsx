import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface DataLoaderProps {
  /** Optional text to display alongside the spinner */
  label?: string
  /** Optional className for the container */
  className?: string
}

export function DataLoader({
  label = "Завантаження...",
  className,
}: DataLoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        className
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

interface PageLoaderProps {
  /** Whether the page is currently loading data */
  isLoading: boolean
  /** Text shown in the loader while loading */
  label?: string
  /** The page content rendered after loading */
  children?: ReactNode
}

/**
 * Wraps page content and shows a fullscreen DataLoader while isLoading is true.
 * Use this to make loading states occupy the entire Outlet area.
 */
export function PageLoader({ isLoading, label, children }: PageLoaderProps) {
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <DataLoader label={label || "Завантаження..."} className="text-lg" />
      </div>
    )
  }
  return children
}
