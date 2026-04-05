export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dispatcher", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/dispatcher/orders", label: "Orders", icon: "ClipboardList" },
  { to: "/dispatcher/warehouses", label: "Warehouses", icon: "Warehouse" },
  { to: "/dispatcher/requests", label: "Incoming Requests", icon: "Inbox" },
  { to: "/dispatcher/drivers", label: "Drivers", icon: "Truck" },
]
