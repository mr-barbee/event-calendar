import { useState, useEffect, useContext } from 'react'
import { SessionContext } from '../context'

export function useUser() {
  const { token } = useContext(SessionContext)

  const getPayloadFromToken = token => {
    return token.current_user
  }

  const [user, setUser] = useState(() => {
    if (!token) return null
    return getPayloadFromToken(token)
  });

  useEffect(() => {
    // Here we check if the token is
    // not set and the expiration time
    // has not yet expired.
    if (!token) {
      setUser(null)
    } else {
      setUser(getPayloadFromToken(token))
    }
  }, [token])

  return user
}
