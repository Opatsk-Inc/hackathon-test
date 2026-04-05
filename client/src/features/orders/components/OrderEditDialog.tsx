import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateOrder } from "../api/orders.api"
import type { IOrder } from "@/shared/types"

interface OrderEditDialogProps {
  order: IOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function OrderEditDialog({
  order,
  open,
  onOpenChange,
  onSuccess,
}: OrderEditDialogProps) {
  const [quantity, setQuantity] = useState<number>(order?.quantity || 0)
  const [priority, setPriority] = useState<string>(order?.priority || "NORMAL")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset state when order changes
  useState(() => {
    if (order) {
      setQuantity(order.quantity)
      setPriority(order.priority)
    }
  })

  const handleSubmit = async () => {
    if (!order) return
    setIsSubmitting(true)
    setError(null)
    try {
      await updateOrder(order.id, { quantity, priority })
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Request</DialogTitle>
          <DialogDescription>
            Modify the quantity or priority for this resource request.
            Inventory will be automatically recalculated.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="resource" className="text-right text-sm font-medium text-muted-foreground">
              Resource
            </label>
            <div className="col-span-3 text-sm font-medium">
              {order.resource?.name}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="quantity" className="text-right text-sm font-medium text-muted-foreground">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="col-span-3"
              min={1}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="priority" className="text-right text-sm font-medium text-muted-foreground">
              Priority
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
