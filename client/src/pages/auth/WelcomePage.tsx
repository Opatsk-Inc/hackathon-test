import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import logo from "@/assets/ЛевчикТранс.svg"

const WelcomePage: React.FC = () => {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Use setTimeout to avoid triggering cascading renders
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 10)

    return () => clearTimeout(timer)
  }, [])

  const handleStartClick = () => {
    navigate("/login")
  }

  const handleAlreadyHaveAccount = () => {
    navigate("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div
        className={`w-full max-w-sm transform rounded-xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <div className="mb-6 flex flex-col items-center space-y-4 text-center">
          <img src={logo} alt="Levtrans Logo" className="h-16 w-auto" />
          <h1 className="text-2xl font-bold tracking-tight">Levtrans</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your logistics platform for seamless transportation management.
            Streamline your operations with our intuitive dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleStartClick}
            size="lg"
            className="w-full rounded-xl py-6 text-lg"
          >
            Start
          </Button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <button
              onClick={handleAlreadyHaveAccount}
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* Reduced motion support */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  )
}

export default WelcomePage
