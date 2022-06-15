import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from "react-router-dom"
import { useMutation } from 'react-query'
import useUtilityService from '../../api/useUtilityService'
import { Formik } from 'formik'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import ValidationSchema from './validation'

function ValidateUser() {
  let [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const sid = searchParams.get("sid")
  const [,, verifyToken] = useUtilityService()
  const { data: verificationData, mutate: sendVerification } = useMutation((values) => verifyToken(values), { retry: 0 })

  const formSubmit = values => {
    if (values.code) {
      sendVerification({'sid': sid, 'code': values.code}, { onError: (res) => setError('There was an error with the verification') })
    } else {
      setError("Token is not set.")
    }
  }

  useEffect(() => {
    if (verificationData) {
      // we want to verify the status is pending.
      if (verificationData.status === 'approved') {
        setVerified(true)
      } else {
        const error = verificationData.error_message ?? 'There was an error with the verification'
        setError(error)
      }
    }
  }, [verificationData, setVerified])

  // Direct to the portal page if token is set.
  if (verified) return <Navigate to="/" />

  return (
    <div className="validate-user">
      <h3>Enter Code sent to device:</h3>
      <Formik
        initialValues={{
          code: '',
        }}
        validationSchema={ValidationSchema}
        onSubmit={(values, {setSubmitting, resetForm}) => { formSubmit(values) }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Input
                as={Col}
                column="12"
                controlId="formCode"
                type="text"
                name="code"
                placeholder="* Access Code"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.code && !errors.code}
                className={touched.code && errors.code ? "error" : null}
                errors={touched.code && errors.code ? errors.code : null}
              />
            </Row>
            <Row className="mb-3">
              <Col><Submit value='Verify' /></Col>
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

export default ValidateUser;
