import type { ITrip as SharedITrip } from "@/shared/types"

export interface IActiveTrip extends SharedITrip {
  order: {
    id: string
    status: string
    priority: string
    quantity: number
    createdAt: string
    updatedAt: string
    providerId?: string
    requesterId?: string
    provider?: {
      id: string
      name: string
      address?: string
    }
    requester?: {
      id: string
      name: string
      address?: string
    }
    resource?: {
      id: string
      name: string
      category: string
      description?: string
    }
  }
}

export interface IResolveSosResponse {
  id: string
  status: string
  driverName?: string
  currentLat?: number
  currentLng?: number
  magicToken: string
  createdAt: string
  updatedAt: string
  sosResolvedAt?: string
  sosResolvedBy?: string
}

export interface ITripPoint {
  id: string
  tripId: string
  lat: number
  lng: number
  createdAt: string
}

export type LngLat = [number, number]
