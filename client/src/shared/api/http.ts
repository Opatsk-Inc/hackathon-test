/**
 * Basic fetch wrapper to automatically add Authorization token.
 */
import { getToken, removeToken } from "./auth"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken()

  const headers = new Headers(options.headers || {})
  headers.set("Content-Type", "application/json")

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    removeToken()
    if (window.location.pathname !== "/") {
      window.location.href = "/"
    }
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error")
    throw new Error(`Error ${response.status}: ${errorBody}`)
  }

  // Handle empty responses
  if (response.status === 204) return null

  return response.json()
}
