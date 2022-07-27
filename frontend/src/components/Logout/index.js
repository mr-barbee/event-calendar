import { useToken } from '../../hooks/useToken'
import { useUser } from '../../hooks/useUser'
import useUserService from '../../api/useUserService'
import { FaSignOutAlt } from "react-icons/fa"
import useLogout from '../../hooks/useLogout'
import { useMutation } from 'react-query'
import { Submit } from '../_common/FormElements'

function Logout() {
  const user = useUser()
  const [token] = useToken()
  const [logout] = useLogout()
  const [,,, logoutUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isError, error, mutate: userLogout } = useMutation((values) => logoutUser(values), { onSuccess: () => logout() })

  if (isError) console.log(error.message)

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
