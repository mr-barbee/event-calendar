import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useToken } from './useToken'

// We want to clear user queries, cache
// and token and redirect to the login page.
const useLogout = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [, setToken] = useToken()
  // Helper function to clear user
  // data saved in browser.
  const clearCacheData = () => {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name)
      })
    })
  }
  const logout = () => {
    // Clear the token and queries
    localStorage.removeItem('token')
    queryClient.removeQueries('get-user')
    // We want to clear
    // all of the cache data.
    clearCacheData()
    // Set the user token to null.
    setToken(null)
    // We want to navigate
    // back to the login page.
    navigate('/login')
  }

  return [logout]
}

export default useLogout
