import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  isAuthenticated,
  getCurrentUserRole,
  getRoleDefaultPath,
  setToken,
} from "@/shared/api/auth"
import type { Role } from "@/shared/types"

export default function SignUpPage() {
  const navigate = useNavigate()

  // Redirect authenticated user to their role path
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getCurrentUserRole()
      navigate(getRoleDefaultPath(role), { replace: true })
    }
  }, [navigate])

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("DISPATCHER")
  const [warehouseId, setWarehouseId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload: any = { 
        email, 
        password, 
        role 
      }
      
      if (role === "WAREHOUSE_MANAGER" && warehouseId) {
        payload.warehouseId = warehouseId
      }

      const response = await fetch("/auth/signup", {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in duration-300">
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

          <div className="space-y-2">
            <label className="text-sm leading-none font-medium">Role</label>
            <Select value={role} onValueChange={(val: Role) => setRole(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                <SelectItem value="WAREHOUSE_MANAGER">
                  Warehouse Manager
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "WAREHOUSE_MANAGER" && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
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
            onClick={() => navigate("/")}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
