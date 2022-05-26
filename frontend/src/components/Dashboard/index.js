import { useNavigate } from 'react-router-dom'
import { Button, Row, Col } from 'react-bootstrap'
import { useUser } from '../../hooks/useUser'
import './style.scss'

function Dashboard() {
  const navigate = useNavigate()
  const user = useUser()
  const navigation = where => {
    switch (where) {
      case 'profile':
        navigate('/contact-form')
        break;
      case 'delete':
        navigate('/delete-user')
        break;
      case 'events':
        navigate('/event-calendar')
        break;
      default:
    }
  }

  return (
    <div className="dashboard">
      <Row>
        <Col sm={12}>
          <p><strong>Username</strong>: {user.name}</p>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Row className="mb-5">
            <p>Click here if you need to update your contact and/or profile information.</p>
            <Button variant="secondary" type="submit" onClick={() => {navigation('profile')}}>Update Profile</Button>
          </Row>
          <Row className="mb-5">
            <p>If you wish to delete your profile please click here.</p>
            <Button variant="secondary" type="submit" onClick={() => {navigation('delete')}}>Delete Profile</Button>
          </Row>
        </Col>
        <Col sm={12}>
          <Row className="mb-5">
            <Button variant="primary" type="submit" onClick={() => {navigation('events')}}>View Event Calendar</Button>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col>
          <p><strong>Note:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed id placerat mi. Quisque cursus, arcu id dignissim tristique, velit sapien maximus augue, ac aliquet mauris nunc blandit tortor.</p>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
