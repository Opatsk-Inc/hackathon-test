/**
 * Auth helpers for token management and role extraction.
 * JWT payload shape: { id, email, role, warehouseId, iat, exp }
 * No signature validation — decoded client-side only.
 */

import type { Role } from "@/shared/types"

const TOKEN_KEY = "logitrack_token"

/** Decode base64url segment safely */
function decodeBase64Url(str: string): string {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
  const pad = base64.length % 4
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64
  try {
    return decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
  } catch {
    return atob(padded)
  }
}

interface JWTPayload {
  id: number
  email: string
  role: string
  warehouseId?: string | null
  iat: number
  exp: number
}

/** Decode JWT payload without signature validation. Returns null on failure. */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null
    const decoded = JSON.parse(decodeBase64Url(parts[1])) as JWTPayload
    return decoded
  } catch {
    return null
  }
}

/** Normalize role string to uppercase constant format */
export function normalizeRole(role: string): Role {
  const upper = role.toUpperCase()
  if (upper === "DISPATCHER") return "DISPATCHER"
  if (upper === "WAREHOUSE_MANAGER") return "WAREHOUSE_MANAGER"
  return "DISPATCHER" // safe fallback
}

/** Get raw token from localStorage */
export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Set token in localStorage */
export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // storage full or disabled
  }
}

/** Remove token from localStorage */
export function removeToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

/** Check if user is authenticated with a non-expired token */
export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const payload = decodeJWT(token)
  if (!payload) return false
  // Check expiration
  const now = Date.now() / 1000
  return payload.exp > now
}

/** Get current user's role from token. Returns null if not authenticated. */
export function getCurrentUserRole(): Role | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeJWT(token)
  if (!payload) return null
  const now = Date.now() / 1000
  if (payload.exp <= now) return null
  return normalizeRole(payload.role)
}

/** Get current user's warehouseId from token. Returns null if not authenticated. */
export function getCurrentUserWarehouseId(): string | null {
  const token = getToken()
  if (!token) return null
  const payload = decodeJWT(token)
  if (!payload) return null
  const now = Date.now() / 1000
  if (payload.exp <= now) return null
  return payload.warehouseId ?? null
}

/** Get redirect path based on role */
export function getRoleDefaultPath(role: Role | null): string {
  switch (role) {
    case "DISPATCHER":
      return "/dispatcher"
    case "WAREHOUSE_MANAGER":
      return "/manager"
    default:
      return "/"
  }
}
