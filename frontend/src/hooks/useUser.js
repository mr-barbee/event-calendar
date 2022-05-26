import { useState, useEffect } from 'react'
import { useToken } from './useToken'

export function useUser() {
  const [token] = useToken()

  const getPayloadFromToken = token => {
    return token.current_user
  }

  const [user, setUser] = useState(() => {
    if (!token) return null
    return getPayloadFromToken(token)
  });

  useEffect(() => {
    if (!token) {
      setUser(null)
    } else {
      setUser(getPayloadFromToken(token))
    }
  }, [token])

  return user
}
