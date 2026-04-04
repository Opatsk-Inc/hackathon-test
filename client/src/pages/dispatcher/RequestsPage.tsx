import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Inbox, ArrowRight, Clock, Package, Contact } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function RequestsPage() {
  const queryClient = useQueryClient()
  
  const [approveOrderId, setApproveOrderId] = useState<string | null>(null)
  const [driverName, setDriverName] = useState("")

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: api.getOrders,
  })

  const approveMutation = useMutation({
    mutationFn: (vars: { orderId: string; payload: { driverName: string } }) =>
      api.approveOrder(vars.orderId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setApproveOrderId(null)
      setDriverName("")
    },
  })

  const pendingOrders = orders.filter((o: any) => o.status === "PENDING")

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!approveOrderId || !driverName) return
    approveMutation.mutate({ orderId: approveOrderId, payload: { driverName } })
  }

  const getUrgencyLabel = (priority: string) => {
    const p = priority.toLowerCase()
    if (p === "critical") return "Критичний"
    if (p === "high") return "Високий"
    return "Звичайний"
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Inbox className="h-5 w-5 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Вхідні запити</h1>
        </div>
        <p className="text-muted-foreground ml-12">Запити від інших складів на переміщення ресурсів</p>
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <Card className="border-dashed shadow-none bg-muted/20">
            <CardContent className="flex justify-center p-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" /> Завантаження запитів...
              </div>
            </CardContent>
          </Card>
        ) : pendingOrders.length === 0 ? (
          <Card className="border-dashed shadow-none bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
              <Inbox className="h-10 w-10 opacity-20" />
              <p>Немає нових запитів на даний момент.</p>
            </CardContent>
          </Card>
        ) : (
          pendingOrders.map((r: any) => (
            <Card key={r.id} className="transition-all hover:bg-muted/30">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                      {r.id.split('-')[0].toUpperCase()}
                    </span>
                    <Badge variant={r.priority.toLowerCase() as any}>
                      {getUrgencyLabel(r.priority)}
                    </Badge>
                    <Badge variant="pending">Новий Запит</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-base font-medium mt-1">
                    <span className="text-muted-foreground border-b border-dashed border-border pb-0.5">Система (Очікування)</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground border-b border-dashed border-border pb-0.5">{r.requester?.name || "Невідомо"}</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{r.resource?.name}</span>
                      <span className="text-muted-foreground px-1">·</span>
                      <span className="font-mono text-foreground">{r.quantity} од.</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(r.createdAt).toLocaleString("uk-UA")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
                  <Button
                    size="sm"
                    onClick={() => setApproveOrderId(r.id)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Прийняти
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Відхилити
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!approveOrderId} onOpenChange={(open) => !open && setApproveOrderId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5 text-muted-foreground" />
              Призначити водія
            </DialogTitle>
            <DialogDescription>
              Введіть ім'я водія, який буде здійснювати цю доставку, щоб створити поїздку.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApproveSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  id="name"
                  placeholder="Наприклад: М. Шевченко"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setApproveOrderId(null)}>
                Скасувати
              </Button>
              <Button type="submit" disabled={approveMutation.isPending}>
                {approveMutation.isPending ? "Обробка..." : "Прийняти замовлення"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
