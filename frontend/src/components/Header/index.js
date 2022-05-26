import Logout from '../Logout'
import { useNavigate, useMatch } from "react-router-dom"
import { FaReply } from "react-icons/fa"
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
            <button className="back-button" type="submit" onClick={() => { navigate(-1)}}><FaReply /></button>
          }
        </div>
        <div className="header--title">
          <div>Event Volunteers</div>
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
