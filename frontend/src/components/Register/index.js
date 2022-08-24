import { useState, useEffect, useContext } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import { SocialLogins } from '../_common/SocialLogins'
import { RegisterSchema } from './validation'
import { SessionContext } from '../../context'
import './style.scss'

export default function Register() {
  const [verification, setVerification] = useState('')
  const { token } = useContext(SessionContext)
  const [error, setError] = useState('')
  const [,,,,,, registerUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isLoading, data: registerData, mutate: register } = useMutation((values) => registerUser(values), { retry: 0 })

  useEffect(() => {
    if (registerData) {
      // we want to run the
      // current user api.
      if (registerData && registerData.status === 'pending') {
        setVerification(registerData)
      } else {
        setError('There was an error with the verification. Please contact site administrator.')
      }
    }
  }, [registerData, setVerification, setError])

  // Direct to the verification page if token is set to verify user email.
  if (verification) return <Navigate to={`/verify?uid=${verification.uid}&updatePassword=true&newUser=true`}/>

  // Direct to the home page if verified var is set
  // bc the user doesn not need to be verifed.
  if (token) return <Navigate to={`/`}/>

  return (
    <div className="login">
      <>
        <h5>It's a great day to Volunteer</h5>
        <Formik
          initialValues={{
            name: '',
            email: '',
            fullName: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { register(values, { onError: (res) => setError(res.data.error_message) }) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Input
                  as={Col}
                  column="12"
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
              </Row>
              <Row className="mb-3">
                <Input
                  as={Col}
                  column="12"
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
                  column="12"
                  controlId="formFullName"
                  type="text"
                  name="fullName"
                  placeholder="* Full Name"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.fullName && !errors.fullName}
                  className={touched.fullName && errors.fullName ? "error" : null}
                  errors={touched.fullName && errors.fullName ? errors.fullName : null}
                />
              </Row>
              <Row className="mb-3">
                <Col>
                  <Submit value='Sign up' isLoading={isLoading} />
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
              onError={(error) => {setError(error)}}
            />
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Col sm="6">
              Already Signed up? <Link to={`/login`}>Click Here</Link>
            </Col>
          </Col>
        </Row>
      </>
      {error &&
        <p className="error-message">{ error }</p>
      }
    </div>
  )
}
