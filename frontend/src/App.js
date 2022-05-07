import { PageRoutes } from './PageRoutes'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import './App.scss'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // refetchOnmount: false,
      // refetchOnReconnect: false,
      retry: 2,
      staleTime: 5*60*1000,
    },
  },
})

export default function App() {
  return (
    // Provide the client to your App
   <QueryClientProvider client={queryClient}>
      <div className="app">
        <PageRoutes />
      </div>
      <ReactQueryDevtools initialIsOpen={true} />
    </QueryClientProvider>
  )
}
