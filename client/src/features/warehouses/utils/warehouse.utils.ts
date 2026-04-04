import type { IInventory } from "@/shared/types"

export const calculateReservedQuantity = (inventory: IInventory[]) => {
  return (
    inventory?.reduce(
      (acc: number, inv: IInventory) => acc + inv.quantityReserved,
      0
    ) || 0
  )
}

export const calculateAvailableQuantity = (inventory: IInventory[]) => {
  return (
    inventory?.reduce(
      (acc: number, inv: IInventory) => acc + inv.quantityAvailable,
      0
    ) || 0
  )
}
