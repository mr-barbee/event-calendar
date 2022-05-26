import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

export const PrivateRoute = props => {
  const user = useUser()

  if (!user) return <Navigate to="/login" />

  return <Outlet {...props} />
}
