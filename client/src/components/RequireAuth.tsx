import { Navigate, Outlet, useLocation } from "react-router-dom"
import {
  isAuthenticated,
  getCurrentUserRole,
  getRoleDefaultPath,
} from "@/shared/api/auth"
import type { Role } from "@/shared/types"

interface RequireAuthProps {
  allowedRoles?: Role[]
}

/**
 * Guard component:
 * - Redirects to / if not authenticated
 * - Redirects to role's default path if user's role not in allowedRoles
 * - Renders <Outlet /> if access granted
 */
export default function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const location = useLocation()
  const authenticated = isAuthenticated()

  if (!authenticated) {
    return <Navigate to="/" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getCurrentUserRole()
    if (!role || !allowedRoles.includes(role)) {
      const fallback = getRoleDefaultPath(role)
      return <Navigate to={fallback} replace />
    }
  }

  return <Outlet />
}
