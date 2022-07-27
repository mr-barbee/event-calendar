import { useState } from 'react'

export function useSessionToken() {
  const [sessionToken, setSesstionTokenInternal] = useState(() => {
    return JSON.parse(localStorage.getItem('sessionToken'))
  });

  const setSesstionToken = newToken => {
    localStorage.setItem('sessionToken', JSON.stringify(newToken))
    setSesstionTokenInternal(newToken)
  }

  return [sessionToken, setSesstionToken]
}
