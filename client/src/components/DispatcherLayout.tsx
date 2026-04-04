import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { 
  Settings, 
  User, 
  LogOut, 
  LayoutDashboard, 
  ClipboardList, 
  Warehouse, 
  Inbox, 
  Truck 
} from "lucide-react"
import Logo from "./Logo"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

const NAV_ITEMS = [
  { to: "/dispatcher", label: "Дашборд", icon: LayoutDashboard },
  { to: "/dispatcher/orders", label: "Замовлення", icon: ClipboardList },
  { to: "/dispatcher/warehouses", label: "Склади", icon: Warehouse },
  { to: "/dispatcher/requests", label: "Вхідні запити", icon: Inbox },
  { to: "/dispatcher/drivers", label: "Водії", icon: Truck },
]

export default function DispatcherLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">

      <nav className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-border py-4 bg-card">
        <Logo/>

        <div className="flex flex-1 flex-col gap-0.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
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
            className="w-full justify-start gap-2 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Settings className="h-4 w-4" />
            Налаштування
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 bg-background">
        <Outlet />
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Налаштування</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 rounded-lg border border-border p-4 bg-muted/30">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted scale-90">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Dispatcher</p>
                <p className="text-sm text-muted-foreground">dispatcher@logitrack.com</p>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={() => alert("Вихід з акаунту")}
              className="w-full gap-2 font-medium"
            >
              <LogOut className="h-4 w-4" />
              Вийти з акаунту
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
