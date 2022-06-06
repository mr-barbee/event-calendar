import Logout from '../Logout'
import { useNavigate, useMatch } from "react-router-dom"
import { FaReply } from "react-icons/fa"
import { Submit } from '../_common/FormElements'
import './style.scss'

export default function Header() {
  const navigate = useNavigate()
  const homePage = useMatch('/')
  const login = useMatch('/login')

  return (
    <header className="header">
      <div className="header--wrapper">
        <div className="header--back">
          {!homePage && !login &&
            <Submit
              className="back-button"
              value={ <FaReply /> }
              onClick={() => { navigate(-1) }}
            />
          }
        </div>
        <div className="header--title">
          <div onClick={() => { navigate('/') }} >Event Volunteers</div>
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
