import { fetchWithAuth } from "@/shared/api/http"
import type { IGlobalInventory } from "../types/warehouse.types"

// WAREHOUSES
export const getWarehouses = () => fetchWithAuth("/api/warehouses")

export const getGlobalInventory = () =>
  fetchWithAuth("/api/inventory/global") as Promise<IGlobalInventory[]>
