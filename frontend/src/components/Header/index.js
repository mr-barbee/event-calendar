import Logout from '../Logout'
import { useNavigate, useMatch } from "react-router-dom"
import { FaHome } from "react-icons/fa"
import { Submit } from '../_common/FormElements'
import './style.scss'

export default function Header() {
  const navigate = useNavigate()
  const homePage = useMatch('/')
  const login = useMatch('/login')
  const register = useMatch('/register')
  const activate = useMatch('/activate-account')
  const verify = useMatch('/verify-account')

  return (
    <header className="header">
      <div className="header--wrapper">
        <div className="header--back">
          {!homePage && !login && !register && !activate && !verify &&
            <Submit
              className="back-button"
              value={ <FaHome /> }
              onClick={() => { navigate('/') }}
            />
          }
        </div>
        <div className="header--title">
        </div>
        <div className="header--login">
          {!login &&
            <Logout />
          }
        </div>
      </div>
    </header>
  )
}
