import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { useToken } from '../../hooks/useToken'
import { Button, Form, Row, Col } from 'react-bootstrap'
import ValidationSchema from './validation'
import './style.scss'

export default function Login() {
  const [token, setToken] = useToken()
  const [error, setError] = useState('')
  const [, loginUser, facebookLoginUser] = useUserService()
  // Login mutation for the login form with an email and password.
  const { data: mutationData, mutate: mutatePostLogin } = useMutation((values) => loginUser(values))
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
      let tokenData = mutationData ? mutationData : facebookData
      setToken(tokenData)
    }
  }, [mutationData, facebookData, setToken])

  // Direct to the login page if token is set.
  if (token) return <Navigate to="/" />

  return (
    <div className="login">
      <>
        <h3>Please Sign in below with your <strong>Email</strong>:</h3>
        <Formik
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { mutatePostLogin(values, { onError: (res) => setError(res.data.message) }) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="formEmail"
                  className="position-relative"
                >
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.email && !errors.email}
                    className={touched.email && errors.email ? "error" : null}
                  />
                  {touched.email && errors.email ? (
                    <div className="error-message">{errors.email}</div>
                  ): null}
                  <Form.Text className="text-muted">
                    Please input the email you used when signing up with.
                  </Form.Text>
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="formPassword"
                  className="position-relative"
                >
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.password && !errors.password}
                    className={touched.password && errors.password ? "error" : null}
                  />
                  {touched.password && errors.password ? (
                    <div className="error-message">{errors.password}</div>
                  ): null}
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Col><Button variant="primary" type="submit">Login</Button></Col>
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
              appId='1123351384872679'
              autoLoad={false}
              fields='name,email,picture'
              scope='public_profile,user_friends'
              callback={responseFacebook}
              icon='fa-facebook' />
          </Col>
        </Row>
      </>
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}
