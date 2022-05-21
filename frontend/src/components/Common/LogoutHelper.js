import { useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useToken } from '../../auth/useToken'

export default function LogoutHelper () {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [, setToken] = useToken()

  return {
    logout
  }

  // We want to clear user queries, cache
  // and token and redirect to the login page.
  function logout() {
    // Clear the token and queries
    localStorage.removeItem('token')
    queryClient.removeQueries('get-user')
    // We want to clear
    // all of the cache data.
    clearCacheData()
    // Set the user token to null.
    setToken(null)
    console.log('in')
    // We want to navigate
    // back to the login page.
    navigate('/login')
  }

  // Function to clear complete cache data
  function clearCacheData() {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name)
      })
    })
  }

}
