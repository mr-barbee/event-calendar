import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Login from '../components/Login'
import Register from '../components/Register'
import MakePassword from '../components/Register/components/MakePassword'
import Dashboard from '../components/Dashboard'
import ContactForm from '../components/ContactForm'
import ValidateUser from '../components/ValidateUser'
import DeleteUser from '../components/DeleteUser'
import EventCalendar from '../components/Calendar'
import { Container } from 'react-bootstrap'
import { PrivateRoute } from './PrivateRoute'
import { SessionToken } from './SessionToken'

export const PageRoutes = () => {
  return (
    <Router>
      <Header />
      <SessionToken />
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
            <Route path='/verify-account' element={<ValidateUser />}/>
            <Route path='/activate-account' element={<MakePassword />}/>
          </Routes>
        </Container>
      </div>
      <Footer />
    </Router>
  )
}
