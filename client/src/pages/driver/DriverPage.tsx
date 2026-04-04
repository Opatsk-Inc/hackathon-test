import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useDriverTrip } from "@/features/driver-magic-link/hooks/useDriverTrip"
import { DataLoader } from "@/components/ui/loaders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Package,
  MapPin,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Truck,
  Flag,
} from "lucide-react"

export default function DriverPage() {
  const { magicToken = "" } = useParams<{ magicToken: string }>()
  const {
    trip,
    isLoading,
    error,
    notFound,
    refetch,
    startTrip,
    isStartingTrip,
    startTripError,
    sendSos,
    isSendingSos,
    sosError,
    finishTrip,
    isFinishingTrip,
    finishTripError,
    sendGpsMutation,
  } = useDriverTrip(magicToken)

  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gpsInFlightRef = useRef(false)

  useEffect(() => {
    const isActive = trip?.status === "EN_ROUTE" && !!magicToken
    if (!isActive) {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current)
        gpsIntervalRef.current = null
      }
      return
    }

    gpsIntervalRef.current = setInterval(() => {
      if (gpsInFlightRef.current) return
      if (!navigator.geolocation) return

      gpsInFlightRef.current = true
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (
            latitude >= -90 &&
            latitude <= 90 &&
            longitude >= -180 &&
            longitude <= 180
          ) {
            sendGpsMutation.mutate(
              { lat: latitude, lng: longitude },
              {
                onSettled: () => {
                  gpsInFlightRef.current = false
                },
              }
            )
          } else {
            gpsInFlightRef.current = false
          }
        },
        () => {
          gpsInFlightRef.current = false
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5000 }
      )
    }, 10_000)

    return () => {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current)
        gpsIntervalRef.current = null
      }
    }
  }, [trip?.status, magicToken, sendGpsMutation])

  const [sosModalOpen, setSosModalOpen] = useState(false)

  const handleSosConfirm = () => {
    if (isSendingSos) return
    sendSos(undefined, {
      onSuccess: () => {
        setSosModalOpen(false)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <DataLoader
          label="Завантаження даних доставки..."
          className="text-lg"
        />
      </div>
    )
  }

  if (notFound || error?.includes("404")) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center text-xl">
              Посилання недійсне
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Це посилання не знайдено або термін його дії минув.</p>
            <p className="mt-2 text-sm">
              Зверніться до диспетчера за новим посиланням.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-center text-xl">
              Помилка завантаження
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button
              onClick={() => {
                refetch()
              }}
              variant="outline"
              className="mt-4 gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Спробувати знову
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = trip?.order
  const statusLabels: Record<string, string> = {
    PENDING: "Очікує",
    EN_ROUTE: "В дорозі",
    DELIVERED: "Доставлено",
    SOS: "SOS",
  }

  // Status visibility rules
  const canStartTrip = trip?.status === "PENDING"
  const canShowSOS = trip?.status === "EN_ROUTE"
  const canFinishTrip = trip?.status === "EN_ROUTE"
  const showActiveActions =
    trip?.status !== "DELIVERED" && trip?.status !== "SOS"

  const handleSos = () => {
    setSosModalOpen(true)
  }

  const handleFinishTrip = () => {
    finishTrip()
  }

  const anyActionError = startTripError || sosError || finishTripError

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-lg space-y-4">
        {/* Header with title left and SOS right */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Інформація про доставку</h1>
              {order?.id && (
                <p className="text-sm text-muted-foreground">
                  <code className="font-mono font-medium">
                    {order.id.slice(0, 8)}
                  </code>
                </p>
              )}
            </div>
          </div>
          {canShowSOS && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleSos}
              disabled={!showActiveActions || isSendingSos}
              className="gap-1 text-sm"
            >
              <AlertTriangle className="h-3 w-3" />
              SOS
            </Button>
          )}
        </div>

        {/* Status */}
        {trip?.status && (
          <div className="flex justify-center">
            <Badge
              variant={
                trip.status === "DELIVERED"
                  ? "default"
                  : trip.status === "EN_ROUTE"
                    ? "secondary"
                    : trip.status === "SOS"
                      ? "destructive"
                      : "outline"
              }
              className="px-3 py-1 text-sm"
            >
              {statusLabels[trip.status] ?? trip.status}
            </Badge>
          </div>
        )}

        {/* Action Errors */}
        {anyActionError && (
          <div className="rounded-lg bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
            {anyActionError instanceof Error
              ? anyActionError.message
              : String(anyActionError)}
          </div>
        )}

        {/* Order info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Ресурс
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-md bg-muted p-3">
              <p className="font-medium">
                {order?.resource?.name ?? "Невідомий ресурс"}
              </p>
              {order?.resource?.category && (
                <p className="text-xs text-muted-foreground">
                  {order.resource.category}
                </p>
              )}
              {order?.quantity && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Кількість: {order.quantity}
                </p>
              )}
            </div>

            {/* Route */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Відправлення</p>
                  <p className="font-medium">
                    {order?.provider?.name ?? "Не відомо"}
                  </p>
                  {order?.provider?.address && (
                    <p className="text-xs text-muted-foreground">
                      {order.provider.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <ArrowRight className="h-4 w-4 rotate-90 text-muted-foreground" />
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Доставка</p>
                  <p className="font-medium">
                    {order?.requester?.name ?? "Не відомо"}
                  </p>
                  {order?.requester?.address && (
                    <p className="text-xs text-muted-foreground">
                      {order.requester.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver info */}
        {trip?.driverName && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Водій</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{trip.driverName}</p>
            </CardContent>
          </Card>
        )}

        {/* Start Trip Button - only for PENDING */}
        {canStartTrip && (
          <Button
            variant="default"
            className="w-full gap-2 py-6 text-lg font-bold"
            onClick={() => startTrip()}
            disabled={isStartingTrip}
          >
            <Truck className="h-6 w-6" />
            {isStartingTrip ? "Запуск..." : "Почати поїздку"}
          </Button>
        )}

        {/* Finish Trip Button - only for EN_ROUTE */}
        {canFinishTrip && (
          <Button
            variant="default"
            className="w-full gap-2 py-6 text-lg font-bold"
            onClick={handleFinishTrip}
            disabled={isFinishingTrip}
          >
            <Flag className="h-6 w-6" />
            {isFinishingTrip ? "Завершення..." : "Завершити замовлення"}
          </Button>
        )}

        {/* SOS Active Card */}
        {trip?.status === "SOS" && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                SOS активний
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Сигнал SOS надіслано. Очікуйте допомоги.</p>
            </CardContent>
          </Card>
        )}

        {/* SOS Confirmation Modal */}
        <Dialog open={sosModalOpen} onOpenChange={setSosModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Підтвердження SOS
              </DialogTitle>
              <DialogDescription>
                Ви впевнені, що хочете надіслати сигнал SOS? Це скасує поточне
                замовлення.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setSosModalOpen(false)}
                disabled={isSendingSos}
              >
                Назад
              </Button>
              <Button
                variant="destructive"
                onClick={handleSosConfirm}
                disabled={isSendingSos}
              >
                {isSendingSos ? "Надсилання..." : "Скасувати замовлення"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
