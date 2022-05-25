import { useState, useEffect } from 'react'
import { useToken } from '../auth/useToken'
import { useUser } from '../auth/useUser'
import useUserService from '../api/useUserService'
import { FaSignOutAlt } from "react-icons/fa"
import useLogout from './Common/useLogout'
import { useMutation, useQuery } from 'react-query'

function Logout() {
  const user = useUser()
  const [token] = useToken()
  const [logout] = useLogout()
  const [skip, setSkip] = useState(false)
  const [,,, logoutUser, fetchSessionToken] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isError, error, mutate: userLogout } = useMutation((values) => logoutUser(values), { onSuccess: () => logout() })
  // We want to fetch a session token for the logout process bc a fresh token is needed.
  const { isLoading: sessionIsLoading, data: sessionToken } = useQuery(['sessionToken'], () => fetchSessionToken(), { enabled: skip, onSuccess: () => setSkip(false) })

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (user && !sessionIsLoading) {
      // Set the skip for
      // the query.
      setSkip(true)
    }
  }, [user, sessionIsLoading])

  if (isError) console.log(error.message)

  return (
    <div>
      {user && token && sessionToken &&
        <button className="logout-button" type="submit" onClick={() => {userLogout({'logoutToken': token.logout_token, 'sessionToken': sessionToken})}}><FaSignOutAlt /></button>
      }
    </div>
  )
}

export default Logout;
