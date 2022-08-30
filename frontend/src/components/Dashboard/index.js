import { useNavigate } from 'react-router-dom'
import { Row, Col } from 'react-bootstrap'
import { useUser } from '../../hooks/useUser'
import { Submit } from '../_common/FormElements'
import SEO from '@americanexpress/react-seo'
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
      <SEO
        title="Dashboard"
        description="Access the volunteer signup dashboard"
      />
      <Row>
        <Col sm={12}>
          <p><strong>Username</strong>: {user.name}</p>
        </Col>
      </Row>
      <Row>
        <Col sm={12}>
          <Row className="mb-5">
            <p>Click here if you need to update your contact and/or profile information.</p>
            <Submit
              variant="secondary"
              value='Update Profile'
              onClick={() => { navigation('profile') }}
            />
          </Row>
          <Row className="mb-5">
            <p>If you wish to delete your profile please click here.</p>
            <Submit
              variant="secondary"
              value='Delete Profile'
              onClick={() => { navigation('delete') }}
            />
          </Row>
        </Col>
        <Col sm={12}>
          <Row className="mb-5">
            <Submit
              value='View Event Calendar'
              onClick={() => { navigation('events') }}
            />
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
