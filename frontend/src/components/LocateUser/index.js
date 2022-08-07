import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import { ValidationSchema } from './validation'
import './style.scss'

export default function Register() {
  const [verification, setVerification] = useState('')
  const [error, setError] = useState('')
  const [,,,,,,,, locateUser] = useUserService()
  // Mutation to locate the user and send a password reset call to user perfered message.
  const { data: locateData, mutate: locate } = useMutation((values) => locateUser(values))

  useEffect(() => {
    if (locateData) {
      // we want to run the
      // current user api.
      if (locateData && locateData.status === 'pending') {
        setVerification(locateData)
      } else {
        setError('There was an error with the verification. Please contact site administrator.')
      }
    }
  }, [locateData, setVerification, setError])

  // Direct to the verification page if token is set to verify user email.
  if (verification) return <Navigate to={`/verify-account?uid=${verification.uid}`}/>

  return (
    <div className="login">
        <h5>Locate your account using your Email or Username</h5>
        <Formik
          initialValues={{
            name: '',
            email: ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { locate(values, { onError: (res) => setError(res.data.error_message) }) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Input
                  as={Col}
                  column="6"
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
                />
              </Row>
              <Row className="mb-3">
                <Col><center><p><strong>-- OR --</strong></p></center></Col>
              </Row>
              <Row className="mb-3">
                <Input
                  as={Col}
                  column="6"
                  controlId="formName"
                  type="text"
                  name="name"
                  placeholder="Username"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.name && !errors.name}
                  className={touched.name && errors.name ? "error" : null}
                  errors={touched.name && errors.name ? errors.name : null}
                />
              </Row>
              <Row className="mb-3">
                <Col>
                  <Submit value='Locate Account' />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}
