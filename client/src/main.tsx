import { createRoot } from "react-dom/client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from "@/components/theme-provider.tsx"
import App from "./App.tsx"
import "./index.css"

import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
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

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'LEVTRANS_OFFLINE_CACHE',
})

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
})

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </ThemeProvider>
)
