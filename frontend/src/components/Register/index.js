import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import ValidationSchema from './validation'
import './style.scss'

export default function Register() {
  const [verification, setVerification] = useState('')
  const [token, setToken] = useToken()
  const [error, setError] = useState('')
  const [,, facebookLoginUser,,,, registerUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { data: mutationData, mutate: mutatePostLogin } = useMutation((values) => registerUser(values))
  // Login mutation for the facebook data.
  const { data: facebookData, mutate: mutateFacebookLogin } = useMutation((accessToken) => facebookLoginUser(accessToken))
  // Reponse callback for the facebook login.
  const responseFacebook = response => {
    if (response.accessToken) {
      // Set the data from the Facebook API.
      mutateFacebookLogin(response.accessToken, { onError: (res) => setError(res.data.message) })
    } else {
      setError('Sorry, unable to authenticate with Facebook.')
    }
  }

  useEffect(() => {
    if (mutationData || facebookData) {
      // we want to run the
      // current user api.
      if (mutationData && mutationData.status === 'pending') {
        setVerification(mutationData)
      } else if (facebookData) {
        // @TODO Set the users email preference and verfication status.
        setToken(tokenData)
      } else {
        setError('There was an error with the verification. Please contact site administrator.')
      }
    }
  }, [mutationData, facebookData, setVerification, setError])

  // Direct to the verification page if token is set to verify user email.
  if (verification) return <Navigate to={`/please-verify?sid=${verification.token}&uid=${verification.uid}`}/>

  // Direct to the home page if verified var is set
  // bc the user doesn not need to be verifed.
  if (token) return <Navigate to={`/`}/>

  return (
    <div className="login">
      <>
        <h3>It's a great day to Volunteer</h3>
        <Formik
          initialValues={{
            name: '',
            email: '',
            password: '',
            confirmPass: ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { mutatePostLogin(values, { onError: (res) => setError(res.data.error_message) }) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Input
                  as={Col}
                  column="6"
                  controlId="formEmail"
                  groupClassName="position-relative"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.email && !errors.email}
                  className={touched.email && errors.email ? "error" : null}
                  errors={touched.email && errors.email ? errors.email : null}
                  helperText="A valid email address. All emails from the system will be sent to this address. The email address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by email."
                />
                <Input
                  as={Col}
                  column="6"
                  controlId="formName"
                  type="text"
                  name="name"
                  placeholder="* Username"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.name && !errors.name}
                  className={touched.name && errors.name ? "error" : null}
                  errors={touched.name && errors.name ? errors.name : null}
                  helperText="Several special characters are allowed, including space, period (.), hyphen (-), apostrophe (&#39;), underscore (_), and the @ sign."
                />
              </Row>
              <Row className="mb-3">
                <Input
                  as={Col}
                  column="6"
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
                <Input
                  as={Col}
                  column="6"
                  controlId="formConfirmPass"
                  type="password"
                  name="confirmPass"
                  placeholder="* Confirm Password"
                  value={values.confirmPass}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.confirmPass && !errors.confirmPass}
                  className={touched.confirmPass && errors.confirmPass ? "error" : null}
                  errors={touched.confirmPass && errors.confirmPass ? errors.confirmPass : null}
                />
              </Row>
              <Row className="mb-3">
                <Col>
                  <Submit value='Sign up' />
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
              icon='fa-facebook'
              textButton='Sign up with Facebook'
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Col sm="6">
              Already a Signed up? <Link to={`/login`}>Click Here</Link>
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
