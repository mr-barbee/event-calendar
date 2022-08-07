import { createContext } from 'react'

export const SessionContext = createContext({
    sessionToken: null,
    setSesstionToken: () => {},
    refetchSession: () => {}
});
