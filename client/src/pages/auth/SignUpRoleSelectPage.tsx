import React from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

const SignUpRoleSelectPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleRoleSelect = (role: "DISPATCHER" | "WAREHOUSE_MANAGER") => {
    // Preserve any existing query parameters and add the selected role
    const queryParams = new URLSearchParams(searchParams.toString())
    queryParams.set("role", role)

    navigate(`/signup?${queryParams.toString()}`)
  }

  return (
    <div className="relative min-h-screen w-full">
      {/* Mobile layout - vertical split */}
      <div className="absolute inset-0 flex flex-col md:hidden">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-px -translate-y-1/2 bg-border" />

        {/* Top half - Dispatcher */}
        <button
          onClick={() => handleRoleSelect("DISPATCHER")}
          className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-6 text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Select Dispatcher role"
        >
          <span className="pointer-events-none absolute inset-0 origin-bottom scale-y-0 bg-muted/12 transition-transform duration-300 ease-out group-hover:scale-y-100" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Dispatcher
            </h2>
            <p className="max-w-md text-muted-foreground">
              Coordinate shipments, manage driver assignments, and optimize
              delivery routes to ensure timely and efficient transportation.
            </p>
            <span className="mt-4 inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              Logistics Coordination
            </span>
          </div>
        </button>

        {/* Bottom half - Warehouse Manager */}
        <button
          onClick={() => handleRoleSelect("WAREHOUSE_MANAGER")}
          className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-6 text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Select Warehouse Manager role"
        >
          <span className="pointer-events-none absolute inset-0 origin-top scale-y-0 bg-muted/12 transition-transform duration-300 ease-out group-hover:scale-y-100" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Warehouse Manager
            </h2>
            <p className="max-w-md text-muted-foreground">
              Manage inventory, oversee warehouse operations, and coordinate
              with dispatchers to ensure efficient logistics flow.
            </p>
            <span className="mt-4 inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              Warehouse Operations
            </span>
          </div>
        </button>
      </div>

      {/* Desktop layout - horizontal split */}
      <div className="relative hidden min-h-screen w-full md:grid md:grid-cols-2">
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-border" />

        {/* Left half - Warehouse Manager */}
        <button
          onClick={() => handleRoleSelect("WAREHOUSE_MANAGER")}
          className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-12 text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Select Warehouse Manager role"
        >
          <span className="pointer-events-none absolute inset-0 origin-right scale-x-0 bg-muted/12 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Warehouse Manager
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Manage inventory, oversee warehouse operations, and coordinate
              with dispatchers to ensure efficient logistics flow.
            </p>
            <span className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              Warehouse Operations
            </span>
          </div>
        </button>

        {/* Right half - Dispatcher */}
        <button
          onClick={() => handleRoleSelect("DISPATCHER")}
          className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-background p-12 text-center focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-label="Select Dispatcher role"
        >
          <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-muted/12 transition-transform duration-300 ease-out group-hover:scale-x-100" />
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Dispatcher
            </h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Coordinate shipments, manage driver assignments, and optimize
              delivery routes to ensure timely and efficient transportation.
            </p>
            <span className="inline-flex items-center rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
              Logistics Coordination
            </span>
          </div>
        </button>
      </div>

      {/* Reduced motion support */}
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              transform: none !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default SignUpRoleSelectPage
