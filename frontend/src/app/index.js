import PageRoutes from '../routes'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { GoogleOAuthProvider } from '@react-oauth/google'
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
      retry: 1
    }
  },
})

// Redirect the user https if not already.
// @TODO do this on the server.
if (window.location.protocol === 'http:') {
    window.location.href =
        window.location.href.replace(
                   'http:', 'https:')
}
export default function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <div className="app">
          <PageRoutes />
        </div>
        <ReactQueryDevtools initialIsOpen={true} />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}
