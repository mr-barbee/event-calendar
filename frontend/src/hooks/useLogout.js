import { useContext } from 'react'
import { useQueryClient } from 'react-query'
import { SessionContext } from '../context'

// We want to clear user queries, cache
// and token and redirect to the login page.
const useLogout = () => {
  const queryClient = useQueryClient()
  const { setToken } = useContext(SessionContext)
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
    queryClient.clear()
    // We want to clear
    // all of the cache data.
    clearCacheData()
    // Set the user
    // token to null.
    setToken(null)
  }

  return [logout]
}

export default useLogout
