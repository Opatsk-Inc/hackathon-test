import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  Settings,
  User,
  LogOut,
  Package,
  TruckIcon,
  PlusCircle,
  ClipboardCheck,
} from "lucide-react"
import { NAV_ITEMS, type NavItem } from "../constants/navItems"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { removeToken } from "@/shared/api/auth"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Package,
  TruckIcon,
  PlusCircle,
  ClipboardCheck,
}

export default function ManagerLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  const handleLogout = () => {
    removeToken()
    window.location.href = "/"
  }

  return (
    <div className="flex h-screen overflow-x-hidden bg-background text-foreground">
      {/* Desktop sidebar */}
      <nav className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-card py-4 sm:flex">
        <Logo />

        <div className="mt-2 flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item: NavItem) => {
            const Icon =
              ICON_MAP[item.icon as keyof typeof ICON_MAP] || (() => null)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/manager"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 text-sm no-underline transition-colors ${
                    isActive
                      ? "border-r-[3px] border-primary bg-muted font-semibold text-foreground"
                      : "border-r-[3px] border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            )
          })}
        </div>

        <div className="mt-auto border-t border-border px-3 pt-3">
          <Button
            variant="ghost"
            onClick={() => setSettingsOpen(true)}
            className="w-full justify-start gap-2 px-3 py-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="min-w-0 flex-1 overflow-y-auto bg-background p-3 pb-20 sm:p-6">
        <header className="mb-4 flex items-center justify-end sm:mb-6 sm:hidden">
          <Button
            variant="ghost"
            onClick={() => setSettingsOpen(true)}
            className="h-10 w-10 p-0 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </header>
        <Outlet />
      </main>

      {/* Mobile bottom navigation (horizontal scroll) */}
      <nav
        className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 flex min-w-0 overflow-x-auto border-t border-border bg-card py-1 sm:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`nav::-webkit-scrollbar{display:none}`}</style>
        {NAV_ITEMS.map((item: NavItem) => {
          const Icon =
            ICON_MAP[item.icon as keyof typeof ICON_MAP] || (() => null)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/manager"}
              className={({ isActive }) =>
                `flex shrink-0 flex-col items-center gap-1 px-3 py-1.5 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:bg-muted/50"
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs whitespace-nowrap">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Manager</p>
                <p className="text-sm text-muted-foreground">
                  manager@logitrack.com
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
