import { useState, useMemo, type FormEvent, type ChangeEvent } from "react"
import {
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Package,
  Info,
} from "lucide-react"
import { DataLoader } from "@/components/ui/loaders"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useReplenishmentRequest,
  validateReplenishmentForm,
  type ReplenishmentFormState,
} from "@/features/warehouses"
import type { IResource, IInventory } from "@/shared/types"

const PRIORITIES = [
  {
    value: "NORMAL",
    label: "Normal",
    color:
      "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "HIGH",
    label: "High",
    color:
      "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    color: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400",
  },
]

export default function ReplenishPage() {
  const { resources, inventory, isLoadingResources, createOrder, isCreating } =
    useReplenishmentRequest()

  const [form, setForm] = useState<ReplenishmentFormState>({
    resourceId: "",
    quantity: "",
    priority: "NORMAL",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Find selected resource inventory info
  const selectedInventory = useMemo(() => {
    if (!form.resourceId) return null
    return inventory.find((i: IInventory) => i.resourceId === form.resourceId)
  }, [form.resourceId, inventory])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleSelect = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[name]
        return copy
      })
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const validationErrors = validateReplenishmentForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    createOrder({
      resourceId: form.resourceId,
      quantity: parseInt(form.quantity, 10),
      priority: form.priority,
    })

    setSubmitted(true)
  }

  const resetForm = () => {
    setForm({ resourceId: "", quantity: "", priority: "NORMAL" })
    setErrors({})
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2">
          <PlusCircle className="h-5 w-5 shrink-0 text-foreground" />
          <h1 className="truncate text-lg font-bold sm:text-xl">Replenishment</h1>
        </div>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Request created!
            </h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Replenishment request successfully sent.
            </p>
            <Button onClick={resetForm} className="mt-6 w-full" size="lg">
              Create another
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <PlusCircle className="h-5 w-5 shrink-0 text-foreground" />
        <h1 className="truncate text-lg font-bold sm:text-xl">
          New Replenishment
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <div className="order-1 lg:col-span-2">
          <Card className="shadow-sm">
            <CardContent className="pt-4 sm:pt-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Resource */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground sm:mb-2">
                    Resource <span className="text-destructive">*</span>
                  </label>
                  {isLoadingResources ? (
                    <DataLoader label="Loading resources..." />
                  ) : (
                    <Select
                      value={form.resourceId}
                      onValueChange={(v) => handleSelect("resourceId", v)}
                    >
                      <SelectTrigger
                        className={`h-11 text-sm sm:h-12 ${
                          errors.resourceId ? "border-destructive" : ""
                        }`}
                      >
                        <SelectValue placeholder="Select resource" />
                      </SelectTrigger>
                      <SelectContent>
                        {resources.map((r: IResource) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.resourceId && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive sm:text-sm">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {errors.resourceId}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground sm:mb-2">
                    Quantity <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="quantity"
                    type="number"
                    min={1}
                    placeholder="Enter quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className={`h-11 sm:h-12 ${errors.quantity ? "border-destructive" : ""}`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive sm:text-sm">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {errors.quantity}
                    </p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground sm:mb-2">
                    Priority <span className="text-destructive">*</span>
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => handleSelect("priority", p.value)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all sm:flex-1 sm:py-3 ${
                          form.priority === p.value
                            ? p.color
                            : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {errors.priority && (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive sm:text-sm">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {errors.priority}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <div className="sticky bottom-0 -mx-4 border-t bg-background px-4 pt-3 sm:static sm:border-0 sm:bg-transparent sm:pt-0">
                  {isCreating && <DataLoader label="Sending request..." />}
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="w-full"
                    size="lg"
                  >
                    Send request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Resource Info Panel */}
        <div className="order-2">
          <Card className="shadow-sm">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Info className="h-4 w-4 shrink-0" />
                <span className="truncate">Resource Info</span>
              </div>

              {selectedInventory ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedInventory.resource?.name}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">
                        {selectedInventory.resource?.category ?? "—"}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Available</span>
                      <span className="font-semibold tabular-nums">
                        {selectedInventory.quantityAvailable}
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Reserved</span>
                      <span className="text-muted-foreground tabular-nums">
                        {selectedInventory.quantityReserved}
                      </span>
                    </div>
                  </div>
                  {selectedInventory.quantityAvailable <= 10 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Low stock — replenishment recommended</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Select a resource to view info
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
