import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"
import { Settings, User, LogOut } from "lucide-react"
import Logo from "./Logo"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

const NAV_ITEMS = [
  { to: "/dispatcher", label: "🏠 Дашборд" },
  { to: "/dispatcher/orders", label: "📋 Замовлення" },
  { to: "/dispatcher/warehouses", label: "🏭 Склади" },
  { to: "/dispatcher/requests", label: "📨 Вхідні запити" },
  { to: "/dispatcher/drivers", label: "🚚 Водії" },
]

export default function DispatcherLayout() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="flex min-h-screen">

      <nav className="flex w-56 shrink-0 flex-col border-r border-zinc-200 py-4 dark:border-zinc-700">
        <Logo/>

        <div className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dispatcher"}
              className={({ isActive }) =>
                `block px-4 py-2.5 text-sm no-underline transition-colors ${
                  isActive
                    ? "border-r-[3px] border-zinc-800 bg-zinc-100 font-semibold text-zinc-900 dark:border-zinc-200 dark:bg-zinc-800 dark:text-zinc-100"
                    : "border-r-[3px] border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-300"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-auto border-t border-zinc-200 px-3 pt-3 dark:border-zinc-700">
          <Button
            variant="ghost"
            onClick={() => setSettingsOpen(true)}
            className="w-full justify-start gap-2 px-3 py-2.5 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <Settings className="h-4 w-4" />
            Налаштування
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Налаштування</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 scale-90">
                <User className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">Dispatcher</p>
                <p className="text-sm text-zinc-400">dispatcher@logitrack.com</p>
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
