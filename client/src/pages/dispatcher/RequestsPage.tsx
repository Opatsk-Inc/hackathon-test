import { useState, useCallback } from "react"
import { useRequests } from "@/features/requests"
import { useOrders } from "@/features/orders"
import type { IOrder } from "@/shared/types"
import {
  Inbox,
  ArrowRight,
  Clock,
  Package,
  Contact,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loaders"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  formatPriorityLevel,
  getPriorityVariant,
} from "@/features/orders/utils/order.formatters"

export default function RequestsPage() {
  const { requests: pendingOrders, isLoading, error } = useRequests()
  const { approveOrder, isApproving, approveOrderError } = useOrders()

  const [approveOrderId, setApproveOrderId] = useState<string | null>(null)
  const [driverName, setDriverName] = useState("")
  const [magicLinkData, setMagicLinkData] = useState<{ link: string } | null>(
    null
  )
  const [copySuccess, setCopySuccess] = useState(false)

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
        return true
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        const result = document.execCommand("copy")
        textArea.remove()
        if (result) {
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        }
        return result
      }
    } catch {
      return false
    }
  }, [])

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!approveOrderId || !driverName.trim()) return
    approveOrder(
      { orderId: approveOrderId, payload: { driverName } },
      {
        onSuccess: (response) => {
          const { trip } = response
          const fullUrl = `${window.location.origin}/driver/${trip.magicToken}`
          setMagicLinkData({ link: fullUrl })
          setApproveOrderId(null)
          setDriverName("")
          setCopySuccess(false)
        },
      }
    )
  }

  if (error) {
    return (
      <div className="p-4 text-destructive">
        Помилка завантаження даних: {(error as Error).message}
      </div>
    )
  }

  return (
    <PageLoader isLoading={isLoading} label="Завантаження запитів...">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Inbox className="h-5 w-5 text-foreground" />
            </div>
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Вхідні запити
            </h1>
          </div>
          <p className="ml-12 text-muted-foreground">
            Запити від інших складів на переміщення ресурсів
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {pendingOrders.length === 0 ? (
            <Card className="border-dashed bg-muted/20 shadow-none">
              <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-muted-foreground">
                <Inbox className="h-10 w-10 opacity-20" />
                <p>Немає нових запитів на даний момент.</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((r: IOrder) => (
              <Card key={r.id} className="transition-all hover:bg-muted/30">
                <CardContent className="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-sm font-bold text-foreground">
                        {r.id.split("-")[0].toUpperCase()}
                      </span>
                      <Badge variant={getPriorityVariant(r.priority)}>
                        {formatPriorityLevel(r.priority)}
                      </Badge>
                      <Badge variant="pending">Новий Запит</Badge>
                    </div>

                    <div className="mt-1 flex items-center gap-3 text-base font-medium">
                      <span className="border-b border-dashed border-border pb-0.5 text-muted-foreground">
                        Система (Очікування)
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="border-b border-dashed border-border pb-0.5 text-foreground">
                        {r.requester?.name || "Невідомо"}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {r.resource?.name}
                        </span>
                        <span className="px-1 text-muted-foreground">·</span>
                        <span className="font-mono text-foreground">
                          {r.quantity} од.
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(r.createdAt).toLocaleString("uk-UA")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2 border-t border-border pt-3 md:flex-col md:border-t-0 md:border-l md:pt-0 md:pl-4">
                    <Button
                      size="sm"
                      onClick={() => setApproveOrderId(r.id)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Прийняти
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Відхилити
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog
          open={!!approveOrderId}
          onOpenChange={(open) => !open && setApproveOrderId(null)}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Contact className="h-5 w-5 text-muted-foreground" />
                Призначити водія
              </DialogTitle>
              <DialogDescription>
                Введіть ім'я водія, який буде здійснювати цю доставку, щоб
                створити поїздку.
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
                    disabled={isApproving}
                  />
                  {approveOrderError && (
                    <p className="text-sm text-destructive">
                      {approveOrderError instanceof Error
                        ? approveOrderError.message
                        : String(approveOrderError)}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setApproveOrderId(null)}
                  disabled={isApproving}
                >
                  Скасувати
                </Button>
                <Button type="submit" disabled={isApproving}>
                  {isApproving ? "Обробка..." : "Прийняти замовлення"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Magic Link Success Dialog */}
        <Dialog
          open={!!magicLinkData}
          onOpenChange={(open) => {
            if (!open) {
              setMagicLinkData(null)
              setCopySuccess(false)
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Посилання для водія створено
              </DialogTitle>
              <DialogDescription>
                Скопіюйте посилання та надішліть водію для початку доставки
              </DialogDescription>
            </DialogHeader>
            {magicLinkData && (
              <div className="grid gap-4 py-4">
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={magicLinkData.link}
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(magicLinkData.link)}
                    disabled={copySuccess}
                  >
                    {copySuccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-sm text-green-600">
                    Посилання скопійовано!
                  </p>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMagicLinkData(null)}
              >
                Закрити
              </Button>
              {magicLinkData && (
                <Button
                  type="button"
                  onClick={() => window.open(magicLinkData.link, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Відкрити посилання
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLoader>
  )
}
