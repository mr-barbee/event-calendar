import { Link } from 'react-router-dom'
import SEO from '@americanexpress/react-seo'

export default function PageNotFound() {

  return (
    <div>
      <SEO
        title="Page Not Found"
        description="The page you accessed was not found."
      />
      <h2 style={{textAlign:"center"}}>Page Not Found</h2>
      <p style={{textAlign:"center"}}>
        <Link to="/">Go to Home </Link>
      </p>
    </div>
  )
}
