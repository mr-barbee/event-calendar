import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ContactForm from './components/ContactForm'
import ValidateUser from './components/ValidateUser'
import DeleteUser from './components/DeleteUser'
import EventCalendar from './components/Calendar/EventCalendar'
import { Container } from 'react-bootstrap'
import { PrivateRoute } from './auth/PrivateRoute'

export const PageRoutes = () => {
  return (
    <Router>
      <Header />
      <div className="main">
        <Container fluid>
          <Routes>
            <Route exact path='/' element={<PrivateRoute />}>
              <Route exact path='/' element={<Dashboard />}/>
              <Route exact path='/contact-form' element={<ContactForm />}/>
              <Route exact path='/delete-user' element={<DeleteUser />}/>
              <Route exact path='/event-calendar' element={<EventCalendar />}/>
            </Route>
            <Route path='/login' element={<Login />}/>
            <Route path='/please-verify' element={<ValidateUser />}/>
          </Routes>
        </Container>
      </div>
      <Footer />
    </Router>
  )
}
