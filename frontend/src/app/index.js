import { PageRoutes } from '../routes'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import './style.scss'

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
    mutations: {
      retry: 2
    }
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
