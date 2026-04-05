import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import {
  Settings,
  Menu,
  User,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Inbox,
  Truck,
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
import { OfflineBanner } from "@/components/OfflineBanner"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardList,
  Warehouse,
  Inbox,
  Truck,
}

export default function DispatcherLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    removeToken()
    window.location.href = "/"
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <OfflineBanner />
      {/* Desktop Sidebar - Hidden on mobile */}
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
                end={item.to === "/dispatcher"}
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

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card/95 px-3 backdrop-blur sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="h-9 w-9"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <p className="text-sm font-semibold tracking-wide text-foreground">
          Dispatcher
        </p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="h-9 w-9"
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background p-3 pt-16 sm:p-6">
        <Outlet />
      </main>

      {/* Mobile hamburger drawer */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="top-0 left-0 h-full w-[85%] max-w-[320px] translate-x-0 translate-y-0 rounded-none border-r border-border p-0 sm:hidden">
          <div className="flex h-full flex-col">
            <div className="border-b border-border px-4 py-4">
              <Logo />
            </div>

            <div className="mt-2 flex flex-1 flex-col gap-0.5 px-2">
              {NAV_ITEMS.map((item: NavItem) => {
                const Icon =
                  ICON_MAP[item.icon as keyof typeof ICON_MAP] || (() => null)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/dispatcher"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-md px-3 py-3 text-sm no-underline transition-colors ${
                        isActive
                          ? "bg-muted font-semibold text-foreground"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            <div className="mt-auto border-t border-border p-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setSettingsOpen(true)
                }}
                className="w-full justify-start gap-2 px-3 py-2.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                <p className="font-semibold text-foreground">Dispatcher</p>
                <p className="text-sm text-muted-foreground">
                  dispatcher@levtrans.com
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
