export interface IResource {
  id: string
  name: string
  category: string
  description?: string
}

export interface IProvider {
  id: string
  name: string
  address?: string
}

export interface IRequester {
  id: string
  name: string
  address?: string
}

export interface IOrder {
  id: string
  status: string
  priority: string
  quantity: number
  createdAt: string
  updatedAt: string
  provider?: IProvider
  requester?: IRequester
  resource?: IResource
  trip?: ITrip
}

export interface IWarehouse {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  inventory?: IInventory[]
  ordersOut?: IOrder[]
}

export interface IInventory {
  id: string
  warehouseId: string
  resourceId: string
  quantityAvailable: number
  quantityReserved: number
  quantityUsed: number
  resource?: IResource
}

export interface ITrip {
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

export interface IDriver {
  id: string
  name: string
  licenseNumber?: string
  phone?: string
  status: string
  currentTripId?: string
}

export interface IApiResponse<T> {
  data: T
  message?: string
  error?: string
}
