import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  isAuthenticated,
  getCurrentUserRole,
  getRoleDefaultPath,
  setToken,
} from "@/shared/api/auth"
import type { Role } from "@/shared/types"

export default function SignUpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Redirect authenticated user to their role path
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getCurrentUserRole()
      navigate(getRoleDefaultPath(role), { replace: true })
    }
  }, [navigate])

  // Get role from URL params, validate it, and redirect if invalid
  useEffect(() => {
    const urlRole = searchParams.get("role") as Role | null
    if (urlRole && ["DISPATCHER", "WAREHOUSE_MANAGER"].includes(urlRole)) {
      setRole(urlRole)
    } else if (!urlRole) {
      // If no role is specified in URL, redirect to role selection
      navigate("/signup/role", { replace: true })
    } else {
      // If role is invalid, redirect to role selection
      navigate("/signup/role", { replace: true })
    }
  }, [searchParams, navigate])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("DISPATCHER") // This will be set by useEffect
  const [warehouseId, setWarehouseId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        email,
        password,
        role,
        ...(role === "WAREHOUSE_MANAGER" && warehouseId && { warehouseId }),
      }

      const apiBase = import.meta.env.VITE_API_URL || ""
      const response = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Registration failed")
      }

      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        const userRole = getCurrentUserRole()
        navigate(getRoleDefaultPath(userRole))
      } else {
        throw new Error("No token received")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Don't render the form until we have a valid role from URL
  if (!["DISPATCHER", "WAREHOUSE_MANAGER"].includes(role as string)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm animate-in rounded-xl border border-zinc-200 bg-white p-8 shadow-sm duration-300 fade-in zoom-in dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">LogiTrack</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Create an account to get started
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label
              className="text-sm leading-none font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {/* Hidden role field - role comes from URL */}
          <input type="hidden" value={role} />

          {role === "WAREHOUSE_MANAGER" && (
            <div className="animate-in space-y-2 duration-200 slide-in-from-top-2">
              <label
                className="text-sm leading-none font-medium"
                htmlFor="warehouseId"
              >
                Warehouse ID
              </label>
              <Input
                id="warehouseId"
                placeholder="UUID of the warehouse"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                required={role === "WAREHOUSE_MANAGER"}
              />
              <p className="text-[10px] text-zinc-400">
                Contact your administrator for the Warehouse UUID.
              </p>
            </div>
          )}

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/login")}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
