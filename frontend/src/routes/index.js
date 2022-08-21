import { useEffect, useState } from 'react'
import useUserService from '../api/useUserService'
import { useQuery } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '../components/Header'
import Login from '../components/Login'
import Register from '../components/Register'
import MakePassword from '../components/MakePassword'
import LocateUser from '../components/LocateUser'
import Dashboard from '../components/Dashboard'
import ContactForm from '../components/ContactForm'
import ValidateUser from '../components/ValidateUser'
import DeleteUser from '../components/DeleteUser'
import EventCalendar from '../components/Calendar'
import BlockQuote from '../components/BlockQuote'
import IdleTimer from '../components/IdleTimer'
import PageNotFound from '../components/PageNotFound'
import { Container, Spinner } from 'react-bootstrap'
import { PrivateRoute } from './PrivateRoute'
import { SessionContext } from '../context'
import './style.scss'

export default function PageRoutes() {
  const [,,,, fetchSessionToken] = useUserService()
  const [sessionToken, setSessionToken] = useState()
  // Get the user session token.
  const { isLoading, data, refetch } = useQuery(['session-token'], () => fetchSessionToken(), { staleTime: 1800000 })
  // Fetch the login token from starage.
  const [token, setTokenInternal] = useState(() => {
    return JSON.parse(localStorage.getItem('token'))
  });
  // save the Token to local starage.
  const setToken = newToken => {
    localStorage.setItem('token', JSON.stringify(newToken))
    setTokenInternal(newToken)
  }

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (data && !isLoading) {
      // Set session token to be
      // used on every api call.
      setSessionToken(data)
    }
  }, [data, setSessionToken, isLoading])

  if (!sessionToken && !isLoading) return <h1>Error loading browser session</h1>

  return (
    <SessionContext.Provider value={{
      token: token,
      sessionToken: sessionToken,
      setSessionToken: (value) => { setSessionToken(value) },
      refetchSession: () => { refetch() },
      setToken: (value) => { setToken(value) }
    }}>
      {isLoading &&
        <Spinner animation="border" role="status" size="lg" >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      }
      {!isLoading && sessionToken &&
        <Router>
          <div className="split left">
            <div className="centered">
              <BlockQuote />
            </div>
          </div>
          <div className="split right">
            <Header />
            <div className="main">
              <Container className="main-container" fluid>
                <Routes>
                  <Route exact path='/' element={<PrivateRoute />}>
                    <Route exact path='/' element={<Dashboard />}/>
                    <Route exact path='/contact-form' element={<ContactForm />}/>
                    <Route exact path='/delete-user' element={<DeleteUser />}/>
                    <Route exact path='/event-calendar' element={<EventCalendar />}>
                      <Route path=':id' element={<EventCalendar />}/>
                    </Route>
                  </Route>
                  <Route path='/login' element={<Login />}/>
                  <Route path='/register' element={<Register />}/>
                  <Route path='/locate-account' element={<LocateUser />}/>
                  <Route path='/verify' element={<ValidateUser />}/>
                  <Route path='/activate-account' element={<MakePassword />}/>
                  <Route path='*' element={<PageNotFound />}/>
                </Routes>
              </Container>
            </div>
          </div>
          {token &&
            <IdleTimer />
          }
        </Router>
      }
    </SessionContext.Provider>
  )
}
