import { Link } from 'react-router-dom'

export default function PageNotFound() {

  return (
    <div>
      <h2 style={{textAlign:"center"}}>Page Not Found</h2>
      <p style={{textAlign:"center"}}>
        <Link to="/">Go to Home </Link>
      </p>
    </div>
  )
}
