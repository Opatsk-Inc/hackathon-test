import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "@/components/theme-provider.tsx"
import App from "./App.tsx"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false, // Prevents unnecessary refetches when coming back offline
      retry: (failureCount, error) => {
        // Retry a bit more on network failures
        if (error.message === 'Failed to fetch' || error.message.includes('Network')) {
          return failureCount < 3;
        }
        return false;
      },
    },
    mutations: {
      networkMode: 'offlineFirst',
    }
  }
})

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ThemeProvider>
)
