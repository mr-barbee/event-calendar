import { useEffect, useState } from 'react'
import useUserService from '../api/useUserService'
import { useQuery } from 'react-query'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Login from '../components/Login'
import Register from '../components/Register'
import MakePassword from '../components/MakePassword'
import LocateUser from '../components/LocateUser'
import Dashboard from '../components/Dashboard'
import ContactForm from '../components/ContactForm'
import ValidateUser from '../components/ValidateUser'
import DeleteUser from '../components/DeleteUser'
import EventCalendar from '../components/Calendar'
import { Container } from 'react-bootstrap'
import { PrivateRoute } from './PrivateRoute'
import { SessionContext } from '../context'

export default function PageRoutes() {
  // let logoutTimer
  const [,,,, fetchSessionToken] = useUserService()
  const [sessionToken, setSessionToken] = useState()
  const { isLoading, data: token, refetch } = useQuery(['session-token'], () => fetchSessionToken())
  // const [tokenExpirationTime, setTokenExpirationTime] = useState()

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (token && !isLoading) {
      // Set session token to be
      // used on every api call.
      setSessionToken(token)
    }
  }, [token, setSessionToken, isLoading])

  // @TODO new useEffect hook to set the timer if the expiration time is in future otherwise we clear the timer here
  // useEffect(() => {
  //     if (token && tokenExpirationTime) {
  //        const remainingTime = tokenExpirationTime.getTime() - new Date().getTime()
  //        logoutTimer = setTimeout(refetch(), remainingTime)
  //      } else {
  //        clearTimeout(logoutTimer);
  //      }
  //  }, [token, tokenExpirationTime]);


  if (!sessionToken && !isLoading) return <p>Error loading browser session</p>

  return (
    <SessionContext.Provider value={{
      sessionToken: sessionToken,
      setSessionToken: (value) => { setSessionToken(value) },
      refetchSession: () => { refetch() }
    }}>
      {isLoading &&
        <p>Loading</p>
      }
      {!isLoading && sessionToken &&
        <Router>
          <Header />
            <div className="main">
              <Container fluid>
                <Routes>
                  <Route exact path='/' element={<PrivateRoute />}>
                    <Route exact path='/' element={<Dashboard />}/>
                    <Route exact path='/contact-form' element={<ContactForm />}/>
                    <Route exact path='/delete-user' element={<DeleteUser />}/>
                    <Route path='/verify' element={<ValidateUser />}/>
                    <Route exact path='/event-calendar' element={<EventCalendar />}>
                      <Route path=':id' element={<EventCalendar />}/>
                    </Route>
                  </Route>
                  <Route path='/login' element={<Login />}/>
                  <Route path='/register' element={<Register />}/>
                  <Route path='/locate-account' element={<LocateUser />}/>
                  <Route path='/verify-account' element={<ValidateUser />}/>
                  <Route path='/activate-account' element={<MakePassword />}/>
                </Routes>
              </Container>
            </div>
          <Footer />
        </Router>
      }
    </SessionContext.Provider>
  )
}
