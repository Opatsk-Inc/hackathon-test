import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  isAuthenticated,
  getCurrentUserRole,
  getRoleDefaultPath,
  setToken,
} from "@/shared/api/auth"

export default function LoginPage() {
  const navigate = useNavigate()

  // Redirect authenticated user to their role path
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getCurrentUserRole()
      navigate(getRoleDefaultPath(role), { replace: true })
    }
  }, [navigate])

  const [email, setEmail] = useState("manager@test.com")
  const [password, setPassword] = useState("password123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const apiBase = import.meta.env.VITE_API_URL || ""
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await response.json()
      if (data.token) {
        setToken(data.token)
        const role = getCurrentUserRole()
        navigate(getRoleDefaultPath(role))
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
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">LogiTrack</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access the portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm leading-none font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
          </span>
          <button
            onClick={() => navigate("/signup/role")}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  )
}
