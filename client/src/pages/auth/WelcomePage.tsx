import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div
        className={`w-full max-w-md transform text-center transition-all duration-300 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <h1 className="mb-4 text-5xl font-bold text-gray-900">LevTrans</h1>
        <p className="mb-10 max-w-md text-lg text-gray-600">
          Your logistics platform for seamless transportation management.
          Streamline your operations with our intuitive dashboard.
        </p>

        <div className="space-y-4">
          <Button
            onClick={handleStartClick}
            size="lg"
            className="w-full rounded-xl py-6 text-lg"
          >
            Start
          </Button>

          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <button
              onClick={handleAlreadyHaveAccount}
              className="font-medium text-blue-600 underline transition-colors hover:text-blue-800"
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
