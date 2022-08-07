import { createContext } from 'react'

export const SessionContext = createContext({
    token: null,
    sessionToken: null,
    setSesstionToken: () => {},
    refetchSession: () => {},
    setToken: () => {}
})
