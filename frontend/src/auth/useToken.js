import { useState } from 'react'

export function useToken() {
  const [token, setTokenInternal] = useState(() => {
    return JSON.parse(localStorage.getItem('token'))
  });

  const setToken = newToken => {
    localStorage.setItem('token', JSON.stringify(newToken))
    setTokenInternal(newToken)
  }

  return [token, setToken]
}
