import { useContext} from 'react'
import { SessionContext } from '../../context'
import { useUser } from '../../hooks/useUser'
import useUserService from '../../api/useUserService'
import { FaSignOutAlt } from "react-icons/fa"
import useLogout from '../../hooks/useLogout'
import { useMutation } from 'react-query'
import { Submit } from '../_common/FormElements'

function Logout() {
  const user = useUser()
  const { token, setPageMessage } = useContext(SessionContext)
  const [logout] = useLogout()
  const [,,, logoutUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isError, error, mutate: userLogout } = useMutation((values) => logoutUser(values), { onSuccess: () => logout() })

  if (isError) console.log(error)

  return (
    <div>
      {user && token &&
        <Submit
          className="logout-button"
          value={ <FaSignOutAlt /> }
          onClick={() => {
            setPageMessage('You have successfully logged out!')
            userLogout({'logoutToken': token.logout_token})
          }}
        />
      }
    </div>
  )
}

export default Logout;
