import { useState, useEffect, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import { SocialLogins } from '../_common/SocialLogins'
import ValidationSchema from './validation'
import { SessionContext } from '../../context'
import SEO from '@americanexpress/react-seo'
import './style.scss'

export default function Login() {
  const [error, setError] = useState('')
  const [, loginUser,,,,,,,,,,, forceLogout] = useUserService()
  const { token, setToken, setSessionToken, ReactGA } = useContext(SessionContext)
  // Login mutation for the login form with an email and password.
  const { isLoading, data: mutationData, mutate: mutatePostLogin } = useMutation((values) => loginUser(values))
  const { mutate: mutateForceLogout } = useMutation((values) => forceLogout(values), {
    onSuccess: () => setError('Error: Please try agian. If problem persists, please contact site administrator.'),
    onError: () => setError('Error: Please try agian. If problem persists, please contact site administrator.')
  })
  const formatError = error => {
    // if this error returns than the user some how has a loged in session.
    // If so we want to force logout that user from the backend.
    if (error.includes('This route can only be accessed by anonymous users')) mutateForceLogout()
    else setError(error)
  }

  useEffect(() => {
    if (mutationData) {
      // we want to run the current user api.
      setToken(mutationData)
      setSessionToken(mutationData.csrf_token)
    }
  }, [mutationData, setToken, setSessionToken])

  // Direct to the login page if token is set.
  if (token) return <Navigate to="/" />

  return (
    <div className="login">
      <SEO
        title="Login"
        description="Please login into your event calendar application."
      />
      <h5>Please Login with your <strong>Email</strong> or <strong>Username</strong></h5>
      <Formik
        initialValues={{
          email: '',
          password: ''
        }}
        validationSchema={ValidationSchema}
        onSubmit={(values, {setSubmitting, resetForm}) => { mutatePostLogin(values, {onSuccess: () => {
              ReactGA.event({
                event_name: "login",
                category: "login",
                action: "login",
                nonInteraction: false,
                transport: "xhr",
              })
            },
            onError: (res) => formatError(res.data.message) }) }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Input
                as={Col}
                column="12"
                controlId="formEmail"
                groupClassName="position-relative"
                type="text"
                name="email"
                placeholder="Email or Username"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.email && !errors.email}
                className={touched.email && errors.email ? "error" : null}
                errors={touched.email && errors.email ? errors.email : null}
                helperText="You can use your username or email address to login."
              />
            </Row>
            <Row className="mb-3">
              <Input
                as={Col}
                column="12"
                controlId="formPassword"
                groupClassName="position-relative"
                type="password"
                name="password"
                placeholder="Password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.password && !errors.password}
                className={touched.password && errors.password ? "error" : null}
                errors={touched.password && errors.password ? errors.password : null}
              />
            </Row>
            <Row className="mb-3">
              <Col>
                <Link to={`/locate-account`}>Forgot Your Password?</Link>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Submit value='Login' isLoading={isLoading} />
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
      <Row className="mb-3">
        <hr className="hr-text" data-content="OR" />
      </Row>
      <Row className="mb-3">
        <Col>
          <SocialLogins
            onError={(error) => {formatError(error)}}
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Col sm="12">
            Are you a new volunteer? <Link to={`/register`}>Click Here</Link>
          </Col>
        </Col>
      </Row>
      {error &&
        <p className="error-message">{ error }</p>
      }
    </div>
  )
}
