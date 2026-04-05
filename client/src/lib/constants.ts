export const ORDER_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  PACKED: "PACKED",
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
}

export const TRIP_STATUS = {
  SCHEDULED: "SCHEDULED",
  IN_TRANSIT: "IN_TRANSIT",
  COMPLETED: "COMPLETED",
  SOS: "SOS",
  CANCELLED: "CANCELLED",
}

export const PRIORITY_LEVELS = {
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
}

export const BADGE_VARIANTS = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  SOS: "sos",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
}

export const MAP_CONFIG = {
  DEFAULT_CENTER: [31.1656, 48.3794] as [number, number],
  DEFAULT_ZOOM: 5,
}

export const NAV_ITEMS = [
  { to: "/dispatcher", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/dispatcher/orders", label: "Orders", icon: "ClipboardList" },
  { to: "/dispatcher/warehouses", label: "Warehouses", icon: "Warehouse" },
  { to: "/dispatcher/requests", label: "Incoming Requests", icon: "Inbox" },
  { to: "/dispatcher/drivers", label: "Drivers", icon: "Truck" },
]

export const DATE_FORMAT_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
} as const

export const DATETIME_FORMAT_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
} as const
