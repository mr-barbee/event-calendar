import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import { PasswordSchema } from './validation'
import './style.scss'

export default function MakePassword() {
  let [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const sid = searchParams.get('sid')
  const uid = searchParams.get('uid')
  const [updated, setUpdated] = useState(false)
  const [,,,,,,, updateUserPassword] = useUserService()
  // Login mutation for the login form with an email and password.
  const { isLoading, data: updatePasswordData, mutate: updatePassword } = useMutation((values) => updateUserPassword(values))

  const formSubmit = values => {
    // Add the verification sid
    // and user id to the values.
    values.sid = sid
    values.uid = uid
    updatePassword(values, { onError: (res) => setError(res.data.error_message) })
  }

  useEffect(() => {
    if (updatePasswordData) {
      // we want to run the
      // current user api.
      if (updatePasswordData && updatePasswordData.valid) {
        setUpdated(true)
      } else {
        setError('There was an error issue with setting your password. Please contact site administrator.')
      }
    }
  }, [updatePasswordData, setError, setUpdated])

  // Direct to the home page if verified var is set
  // bc the user doesn not need to be verifed.
  if (updated) return <Navigate to={`/login`}/>

  return (
    <div className="login">
      <>
        <h3>Set Your New Password</h3>
        <Formik
          initialValues={{
            pass: '',
            confirmPass: ''
          }}
          validationSchema={PasswordSchema}
          onSubmit={(values) => { formSubmit(values) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Input
                as={Col}
                column="6"
                controlId="formPass"
                type="password"
                name="pass"
                placeholder="* Password"
                value={values.pass}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.pass && !errors.pass}
                className={touched.pass && errors.pass ? "error" : null}
                errors={touched.pass && errors.pass ? errors.pass : null}
                helperText="Please enter your new password"
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
                  <Submit value='Set Password' isLoading={isLoading} />
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </>
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}
