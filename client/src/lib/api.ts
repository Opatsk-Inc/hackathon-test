/**
 * Basic fetch wrapper to automatically add Authorization token.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("logitrack_token")
  
  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Optionally handle 401 Unauthorized globally here
  if (response.status === 401) {
    localStorage.removeItem("logitrack_token")
    if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
      window.location.href = "/" // Redirect to login
    }
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorBody}`)
  }

  // Handle empty responses
  if (response.status === 204) return null;

  return response.json()
}

// API methods
export const api = {
  getWarehouses: () => fetchWithAuth("/api/warehouses"),
  getGlobalInventory: () => fetchWithAuth("/api/inventory/global"),
  getOrders: () => fetchWithAuth("/api/orders"),
  getActiveTrips: () => fetchWithAuth("/api/trips/active"),
  approveOrder: (orderId: string, payload: { driverName: string }) => 
    fetchWithAuth(`/api/orders/${orderId}/approve`, { method: "PATCH", body: JSON.stringify(payload) }),
  resolveSos: (tripId: string) => 
    fetchWithAuth(`/api/trips/${tripId}/resolve-sos`, { method: "PATCH" }),
}
