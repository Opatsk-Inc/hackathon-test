export interface IOrderDetails {
  id: string
  status: string
  priority: string
  quantity: number
  resource?: {
    id: string
    name: string
    category: string
  }
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
}

export interface ITripWithOrder {
  id: string
  status: string
  driverName?: string
  currentLat?: number
  currentLng?: number
  magicToken: string
  createdAt: string
  updatedAt: string
  order?: IOrderDetails
}
