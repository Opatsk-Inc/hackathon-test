import { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidePanelProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  width?: "sm" | "md" | "lg"
}

const WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
}

export function SidePanel({
  open,
  onClose,
  title,
  children,
  className,
  width = "md",
}: SidePanelProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 opacity-0 transition-opacity duration-200",
          open && "opacity-100"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full min-w-0 flex-col bg-card shadow-xl transition-transform duration-200 ease-out sm:w-auto",
          WIDTH_MAP[width],
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex min-w-0 items-center justify-between border-b border-border px-4 py-3">
            <h2 className="min-w-0 flex-1 text-base font-semibold wrap-break-word">
              {title}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label="Закрити"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 overflow-y-auto px-3 py-4 sm:px-4">
          {children}
        </div>
      </div>
    </>
  )
}

interface SidePanelSectionProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function SidePanelSection({
  title,
  children,
  className,
}: SidePanelSectionProps) {
  return (
    <div className={cn("py-3", className)}>
      <h3 className="mb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

interface SidePanelRowProps {
  label: string
  value: React.ReactNode
}

export function SidePanelRow({ label, value }: SidePanelRowProps) {
  return (
    <div className="flex min-w-0 justify-between py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right font-medium break-all tabular-nums">
        {value}
      </span>
    </div>
  )
}
