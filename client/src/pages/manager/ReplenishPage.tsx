import { useState, type FormEvent, type ChangeEvent } from "react"
import { PlusCircle, CheckCircle2, AlertCircle } from "lucide-react"
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
import { useReplenishmentRequest } from "@/features/warehouses"
import type { IResource } from "@/shared/types"

interface FormState {
  resourceId: string
  quantity: string
  priority: string
}

const PRIORITIES = [
  { value: "NORMAL", label: "Звичайний" },
  { value: "HIGH", label: "Високий" },
  { value: "CRITICAL", label: "Критичний" },
]

const validate = (form: FormState) => {
  const errors: Record<string, string> = {}
  if (!form.resourceId) errors.resourceId = "Оберіть ресурс"
  if (!form.quantity || parseInt(form.quantity, 10) < 1) {
    errors.quantity = "Введіть кількість (мін. 1)"
  }
  if (!form.priority) errors.priority = "Оберіть пріоритет"
  return errors
}

export default function ReplenishPage() {
  const { resources, isLoadingResources, createOrder, isCreating } =
    useReplenishmentRequest()

  const [form, setForm] = useState<FormState>({
    resourceId: "",
    quantity: "",
    priority: "NORMAL",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

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
    const validationErrors = validate(form)
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-foreground" />
          <h1 className="text-lg font-bold sm:text-xl">Поповнення</h1>
        </div>
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Заявку створено!
            </h2>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Заявку на поповнення успішно відправлено.
            </p>
            <Button onClick={resetForm} className="mt-6 w-full" size="lg">
              Створити ще одну
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <PlusCircle className="h-5 w-5 text-foreground" />
        <h1 className="text-lg font-bold sm:text-xl">Нове поповнення</h1>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Resource */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Ресурс <span className="text-destructive">*</span>
              </label>
              {isLoadingResources ? (
                <DataLoader label="Завантаження ресурсів..." />
              ) : (
                <Select
                  value={form.resourceId}
                  onValueChange={(v) => handleSelect("resourceId", v)}
                >
                  <SelectTrigger
                    className={`h-12 text-sm ${
                      errors.resourceId ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Оберіть ресурс" />
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
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.resourceId}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Кількість <span className="text-destructive">*</span>
              </label>
              <Input
                name="quantity"
                type="number"
                min={1}
                placeholder="Введіть кількість"
                value={form.quantity}
                onChange={handleChange}
                className={`h-12 ${errors.quantity ? "border-destructive" : ""}`}
              />
              {errors.quantity && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Пріоритет <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => handleSelect("priority", p.value)}
                    className={`flex-1 rounded-lg border px-3 py-3 text-sm font-medium transition-all ${
                      form.priority === p.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {errors.priority && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {errors.priority}
                </p>
              )}
            </div>

            {/* Submit */}
            {isCreating && <DataLoader label="Відправка заявки..." />}
            <Button
              type="submit"
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              Відправити заявку
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
