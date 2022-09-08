import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from 'react-query'
import { Row, Col } from 'react-bootstrap'
import { useUser } from '../../hooks/useUser'
import { Submit } from '../_common/FormElements'
import useUserService from '../../api/useUserService'
import useUtilityService from '../../api/useUtilityService'
import { SessionContext } from '../../context'
import SEO from '@americanexpress/react-seo'
import './style.scss'

function Dashboard() {
  const navigate = useNavigate()
  const user = useUser()
  const [getCurrentUser] = useUserService()
  const [, sendVerificationToken] = useUtilityService()
  const { setPageMessageError } = useContext(SessionContext)
  const { data } = useQuery(['get-user'], () => getCurrentUser())
  const { isLoading, mutate: sendVerification } = useMutation((values) => sendVerificationToken(values))
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
      {data && data.currentUser.verified === false &&
        <p className="mb-3 notification error-message">To get the most out of the website, please&nbsp;
          <Submit
            value='Click Here'
            isLoading={isLoading}
            onClick={() => {
              sendVerification({'uid': user.uid}, {
                onError: (res) => setPageMessageError(res.data.message),
                onSuccess: (data) => {
                  // refetch the user data
                  if (data.status === 'pending') {
                    navigate('/verify')
                  } else {
                    setPageMessageError('There was an error with the verification. Please try again later.')
                  }
                }
              })
            }}
          />
        &nbsp;to verify your primary contact!</p>
      }
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
