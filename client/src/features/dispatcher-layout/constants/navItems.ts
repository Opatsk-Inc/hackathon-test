export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dispatcher", label: "Дашборд", icon: "LayoutDashboard" },
  { to: "/dispatcher/orders", label: "Замовлення", icon: "ClipboardList" },
  { to: "/dispatcher/warehouses", label: "Склади", icon: "Warehouse" },
  { to: "/dispatcher/requests", label: "Вхідні запити", icon: "Inbox" },
  { to: "/dispatcher/drivers", label: "Водії", icon: "Truck" },
]
