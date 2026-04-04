import { NavLink, Outlet } from "react-router-dom"
import {
  Package,
  TruckIcon,
  PlusCircle,
  ClipboardCheck,
  LogOut,
} from "lucide-react"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { removeToken } from "@/shared/api/auth"

interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV_ITEMS: NavItem[] = [
  { to: "/manager/resources", label: "Ресурси", icon: Package },
  { to: "/manager/orders", label: "Замовлення", icon: TruckIcon },
  { to: "/manager/replenish", label: "Поповнення", icon: PlusCircle },
  { to: "/manager/inventory", label: "Інвентар", icon: ClipboardCheck },
]

export default function ManagerLayout() {
  const handleLogout = () => {
    removeToken()
    window.location.href = "/"
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground sm:flex-row">
      {/* Desktop sidebar */}
      <nav className="hidden w-60 shrink-0 flex-col border-r border-border bg-card py-4 sm:flex">
        <div className="px-4">
          <Logo />
        </div>

        <div className="mt-4 flex flex-1 flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive: active }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto border-t border-border px-3 pt-3">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 px-3 py-3 text-sm text-muted-foreground hover:bg-muted/50"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 pb-16 sm:pb-6">
        <div className="mx-auto max-w-2xl px-4 pt-4 sm:px-6 sm:pt-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="safe-area-bottom fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-1 sm:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive: active }) =>
              `flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground active:bg-muted/50"
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
