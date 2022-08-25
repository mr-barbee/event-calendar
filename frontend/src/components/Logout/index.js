import { useContext } from 'react'
import { SessionContext } from '../../context'
import { useUser } from '../../hooks/useUser'
import useUserService from '../../api/useUserService'
import { FaSignOutAlt } from "react-icons/fa"
import useLogout from '../../hooks/useLogout'
import { useMutation } from 'react-query'
import { Submit } from '../_common/FormElements'

function Logout() {
  const user = useUser()
  const { token, setPageMessage, setPageMessageError } = useContext(SessionContext)
  const [logout] = useLogout()
  const [,,, logoutUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { mutate: userLogout } = useMutation((values) => logoutUser(values), {
    // We want to se the page error message
    // if an error was found.
    onError: (res) => setPageMessageError(res.data.message),
    onSuccess: () => {
      logout()
      setPageMessage('You have successfully logged out!')
    },
  })

  return (
    <div>
      {user && token &&
        <Submit
          className="logout-button"
          value={ <FaSignOutAlt /> }
          onClick={() => {
            userLogout({'logoutToken': token.logout_token})
          }}
        />
      }
    </div>
  )
}

export default Logout;
