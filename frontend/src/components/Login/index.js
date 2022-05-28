import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { useToken } from '../../hooks/useToken'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
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
                  helperText="Please input the email you used when signing up with."
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
