import { useEffect } from 'react'
import useUserService from '../api/useUserService'
import { useSessionToken } from '../hooks/useSessionToken'
import { useQuery } from 'react-query'

export function SessionToken() {
  const [,,,, fetchSessionToken] = useUserService()
  const [sessionToken, setSesstionToken] = useSessionToken()
  const { isLoading, data: token } = useQuery(['session-token'], () => fetchSessionToken())

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (token && !isLoading) {
      // Set the skip for
      // the query.
      setSesstionToken(token)
    }
  }, [token, setSesstionToken, isLoading])

  if (!sessionToken) return <p>Error loading browser session</p>

  return <></>

}
