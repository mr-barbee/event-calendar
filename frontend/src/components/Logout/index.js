import { useState, useEffect } from 'react'
import { useToken } from '../../hooks/useToken'
import { useUser } from '../../hooks/useUser'
import useUserService from '../../api/useUserService'
import { FaSignOutAlt } from "react-icons/fa"
import useLogout from '../../hooks/useLogout'
import { useMutation, useQuery } from 'react-query'
import { Submit } from '../_common/FormElements'

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
        <Submit
          className="logout-button"
          value={ <FaSignOutAlt /> }
          onClick={() => {
            userLogout({'logoutToken': token.logout_token, 'sessionToken': sessionToken})
          }}
        />
      }
    </div>
  )
}

export default Logout;
