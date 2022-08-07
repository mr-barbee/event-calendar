import { useState, useEffect, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import ValidationSchema from './validation'
import { SessionContext } from '../../context'
import './style.scss'

export default function Login() {
  const [error, setError] = useState('')
  const [, loginUser, facebookLoginUser] = useUserService()
  const { token, setToken, setSessionToken } = useContext(SessionContext)
  // Login mutation for the login form with an email and password.
  const { data: mutationData, mutate: mutatePostLogin } = useMutation((values) => loginUser(values))
  // Login mutation for the facebook data.
  const { data: facebookData, mutate: mutateFacebookLogin } = useMutation((accessToken) => facebookLoginUser(accessToken))
  const formatError = error => {
    // if this error returns than the user some how has a loged in session.
    if (error.includes('This route can only be accessed by anonymous users')) setError('Please clear your browser cookies.')
    else setError(error)
  }
  // Reponse callback for the facebook login.
  const responseFacebook = response => {
    // Set the data from the Facebook API.
    if (response.accessToken) mutateFacebookLogin(response.accessToken, { onError: (res) => formatError(res.data.message) })
    else setError('Sorry, unable to authenticate with Facebook.')
  }

  useEffect(() => {
    if (mutationData || facebookData) {
      // we want to run the
      // current user api.
      let tokenData = mutationData ?? facebookData
      setToken(tokenData)
      setSessionToken(tokenData.csrf_token)
    }
  }, [mutationData, facebookData, setToken, setSessionToken])

  // Direct to the login page if token is set.
  if (token) return <Navigate to="/" />

  return (
    <div className="login">
      <>
        <h4>Please Login with your <strong>Email</strong> or <strong>Username</strong></h4>
        <Formik
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { mutatePostLogin(values, { onError: (res) => formatError(res.data.message) }) }}
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
                  placeholder="Email"
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
                  <Submit value='Login' />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
        <Row className="mb-3">
          <Col><p><strong>-- OR --</strong></p></Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <FacebookLogin
              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
              autoLoad={false}
              fields='name,email,picture'
              scope='public_profile,user_friends'
              callback={responseFacebook}
              icon='fa-facebook' />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Col sm="6">
              Are you a new volunteer? <Link to={`/register`}>Click Here</Link>
            </Col>
          </Col>
        </Row>
      </>
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}
