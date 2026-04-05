import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCurrentUserWarehouseId } from "@/shared/api/auth"
import {
  getMyInventory,
  adjustInventory,
  getMyOrders,
  createOrder,
  type AdjustInventoryPayload,
  type CreateOrderPayload,
} from "../api/warehouses.api"
import type { IInventory, IOrder, IResource } from "@/shared/types"

// ─── RESOURCES AVAILABILITY ─────────────────────────────────────────

export function useResourcesAvailability() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")

  const {
    data: inventory = [],
    isLoading,
    error,
  } = useQuery<IInventory[]>({
    queryKey: ["manager", "my-inventory"],
    queryFn: getMyInventory,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Filter inventory items
  const filteredItems = inventory.filter((item) => {
    const matchesSearch = searchQuery
      ? (item.resource?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ?? false)
      : true

    const matchesCategory =
      categoryFilter === "all" ||
      item.resource?.category?.toLowerCase() === categoryFilter.toLowerCase()

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "ok" && item.quantityAvailable > 10) ||
      (stockFilter === "low" &&
        item.quantityAvailable <= 10 &&
        item.quantityAvailable > 0) ||
      (stockFilter === "out" && item.quantityAvailable === 0)

    return matchesSearch && matchesCategory && matchesStock
  })

  // Get unique categories for filter
  const categories = [
    ...new Set(
      inventory.map((i) => i.resource?.category).filter((c): c is string => !!c)
    ),
  ]

  return {
    inventory: filteredItems,
    allInventory: inventory, // raw unfiltered data for KPI
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    stockFilter,
    setStockFilter,
    categories,
  }
}

// ─── INVENTORY ADJUSTMENT ───────────────────────────────────────────

export function useInventoryAdjustment() {
  const queryClient = useQueryClient()

  const {
    data: inventory = [],
    isLoading,
    error,
  } = useQuery<IInventory[]>({
    queryKey: ["manager", "my-inventory"],
    queryFn: getMyInventory,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  const adjustMutation = useMutation({
    mutationFn: (payload: AdjustInventoryPayload) => adjustInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["manager", "my-inventory"],
      })
    },
  })

  return {
    inventory,
    isLoading,
    error,
    adjustInventory: adjustMutation.mutate,
    isAdjusting: adjustMutation.isPending,
    adjustError: adjustMutation.error,
  }
}

// ─── MY ORDERS (INCOMING / OUTGOING) ────────────────────────────────

export function useMyOrders() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "incoming"
  )

  const warehouseId = getCurrentUserWarehouseId()

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<IOrder[]>({
    queryKey: ["manager", "my-orders"],
    queryFn: getMyOrders,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Incoming = manager's warehouse is the provider (order.providerId === warehouseId)
  // Outgoing = manager's warehouse is the requester (order.requesterId === warehouseId)
  const incomingOrders = orders.filter((o) => o.providerId === warehouseId)
  const outgoingOrders = orders.filter((o) => o.requesterId === warehouseId)

  const displayedOrders =
    activeTab === "incoming" ? incomingOrders : outgoingOrders

  return {
    orders: displayedOrders,
    allOrders: orders, // raw data for KPI
    incomingOrders,
    outgoingOrders,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refetch,
  }
}

// ─── REPLENISHMENT REQUEST ──────────────────────────────────────────

export function useReplenishmentRequest() {
  const queryClient = useQueryClient()

  const {
    data: inventory = [],
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useQuery<IInventory[]>({
    queryKey: ["manager", "my-inventory"],
    queryFn: getMyInventory,
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  })

  // Derive resources from inventory
  const resources = useMemo<IResource[]>(
    () =>
      inventory
        .map((i) => i.resource)
        .filter((r): r is IResource => !!r)
        .filter((r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx),
    [inventory]
  )

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager", "my-orders"] })
    },
  })

  return {
    resources,
    inventory,
    isLoadingResources: isLoadingInventory,
    resourcesError: inventoryError,
    createOrder: createOrderMutation.mutate,
    isCreating: createOrderMutation.isPending,
    createError: createOrderMutation.error,
  }
}
