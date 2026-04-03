import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <Button 
        size="lg" 
        className="px-8 font-bold text-lg"
        onClick={() => navigate("/dispatcher")}
      >
        Login
      </Button>
    </div>
  )
}
