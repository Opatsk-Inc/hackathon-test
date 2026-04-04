export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/manager/resources", label: "Ресурси", icon: "Package" },
  { to: "/manager/orders", label: "Замовлення", icon: "TruckIcon" },
  { to: "/manager/replenish", label: "Поповнення", icon: "PlusCircle" },
  { to: "/manager/inventory", label: "Інвентар", icon: "ClipboardCheck" },
]
