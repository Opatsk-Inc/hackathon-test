export interface NavItem {
  to: string
  label: string
  icon: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/manager", label: "Resources", icon: "Package" },
  { to: "/manager/orders", label: "Orders", icon: "TruckIcon" },
  { to: "/manager/replenish", label: "Replenish", icon: "PlusCircle" },
  { to: "/manager/inventory", label: "Inventory", icon: "ClipboardCheck" },
]
