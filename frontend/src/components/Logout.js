import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToken } from '../auth/useToken'
import { useUser } from '../auth/useUser'
import UserService from '../api/UserService'
import { FaSignOutAlt } from "react-icons/fa"
import { logout } from './Common/LogoutHelper'
import { useMutation, useQuery, useQueryClient } from 'react-query'

function Logout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useUser()
  const [token, setToken] = useToken()
  const [skip, setSkip] = useState(false)
  // Login mutation for the login form with an email and password.
  const { isError, error, mutate: userLogout } = useMutation((values) => UserService.logoutUser(values), { onSuccess: () => logout() })
  // We want to fetch a session token for the logout process bc a fresh token is needed.
  const { isLoading: sessionIsLoading, data: sessionToken } = useQuery(['sessionToken'], () => UserService.fetchSessionToken(), { enabled: skip, onSuccess: () => setSkip(false) })

  // We want to clear user queries, cache
  // and token and redirect to the login page.
  // const logout = () =>  {
  //   // Clear the token and queries
  //   localStorage.removeItem('token')
  //   queryClient.removeQueries('get-user')
  //   // We want to clear
  //   // all of the cache data.
  //   clearCacheData()
  //   // Set the user token to null.
  //   setToken(null)
  //   // We want to navigate
  //   // back to the login page.
  //   navigate('/login')
  // }
  //
  // // Function to clear complete cache data
  // const clearCacheData = () => {
  //   caches.keys().then((names) => {
  //     names.forEach((name) => {
  //       caches.delete(name)
  //     })
  //   })
  // }

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (user && !sessionIsLoading) {
      // Set the skip for
      // the query.
      setSkip(true)
    }
  }, [user, sessionIsLoading])

  return (
    <div>
      {user && token && sessionToken &&
        <button className="logout-button" type="submit" onClick={() => {userLogout({'logoutToken': token.logout_token, 'sessionToken': sessionToken})}}><FaSignOutAlt /></button>
      }
      {isError
        ? error.message : ""
      }
    </div>
  )
}

export default Logout;
