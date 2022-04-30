import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from "react-router-dom"
import { useMutation } from 'react-query'
import UtilityService from '../api/UtilityService'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { Button, Form, Row, Col } from 'react-bootstrap'

const ContactFormSchema = Yup.object().shape({
 code: Yup.string()
    .matches(/^[0-9]+$/, "Must be only digits")
    .min(6, 'Too Short!')
    .max(9, 'Too Long!')
    .required('Required')
})

function ValidateUser() {
  let [searchParams] = useSearchParams()
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const sid = searchParams.get("sid")

  const { data: verificationData, mutate: sendVerification } = useMutation((values) => UtilityService.verifyToken(values))

  const formSubmit = values => {
    console.log(values)
    if (values.code) {
      sendVerification({'sid': sid, 'code': values.code}, { onError: (res) => setError(res.data.error_message) })
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
        validationSchema={ContactFormSchema}
        onSubmit={(values, {setSubmitting, resetForm}) => { formSubmit(values) }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group
                as={Col}
                md="6"
                controlId="formCode"
              >
                <Form.Control
                  type="text"
                  name="code"
                  placeholder="* Access Code"
                  value={values.code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.code && !errors.code}
                  className={touched.code && errors.code ? "error" : null}
                />
                {touched.code && errors.code ? (
                  <div className="error-message">{errors.code}</div>
                ): null}
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Col><Button variant="primary" type="submit">Verify</Button></Col>
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
