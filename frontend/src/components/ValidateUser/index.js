import { useState, useEffect } from 'react'
import { Navigate, useSearchParams } from "react-router-dom"
import { useMutation } from 'react-query'
import useUtilityService from '../../api/useUtilityService'
import { useUser } from '../../hooks/useUser'
import { Formik } from 'formik'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import ValidationSchema from './validation'
import './style.scss'

function ValidateUser() {
  let [searchParams] = useSearchParams()
  const user = useUser()
  const [error, setError] = useState('')
  const [uid, setUid] = useState(searchParams.get('uid'))
  const [verified, setVerified] = useState(false)
  const token = searchParams.get("token")
  const [,, verifyToken] = useUtilityService()
  const [, sendVerificationToken] = useUtilityService()
  const { data: verifyData, mutate: verify } = useMutation((values) => verifyToken(values), { retry: 0 })
  const { isLoading, data: verificationData, mutate: sendVerification } = useMutation((values) => sendVerificationToken(values))
  const updatePassword = searchParams.get('updatePassword')
  const newUser = searchParams.get('newUser')

  const formSubmit = values => {
    if (values.code) {
      verify({'uid': uid, 'code': values.code}, { onError: () => setError('There was an error with the verification') })
    } else {
      setError("Token is not set.")
    }
  }

  const resendCode = () => {
    sendVerification({'uid': uid}, { onError: (res) => setError(res.data.error_message) })
  }

  useEffect(() => {
    if (uid === null && user === null) {
      setError('Theres an issue verfiying your accounts identity!')
    } else if (user && uid === null) {
      setUid(user.uid)
    }
  }, [uid, user, setError])

  useEffect(() => {
    if (token) {
      verify({'uid': uid, 'code': token}, { onError: () => setError('There was an error with the verification') })
    }
  }, [uid, token, verify])

  useEffect(() => {
    if (verificationData) {
      if (verificationData.status === 'pending') {
        setError('New Code Sent.')
      } else {
        setError(verificationData.error_message ?? 'There was an error with the verification')
      }
    }
  }, [verificationData, setVerified])

  useEffect(() => {
    if (verifyData) {
      // we want to verify the status is pending.
      if (verifyData.status === 'approved') {
        setVerified(true)
      } else {
        setError(verifyData.error_message ?? 'There was an error with the verification')
      }
    }
  }, [verifyData, setVerified])

  // Direct to the portal page if token is set.
  if (verified) return <Navigate to={updatePassword ? `/activate-account?sid=${verifyData.token}&uid=${uid}` : '/'} />

  return (
    <div className="validate-user">
      {newUser &&
        <>
          <h3>Please confirm your account. See your email for further steps.</h3>
          <p>Your account has been made and we have sent a confirmatio email to you. Please check your email and get started.</p>
          <p><i>Please also check you *SPAM* Folder! Click the link attached to the email or copy the activation code in the field below.</i></p>
        </>
      }
      <h4>Enter Code sent to device:</h4>
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
              <Col><Submit value={newUser ? 'Activate Account' : 'Verify'} isLoading={isLoading} /></Col>
            </Row>
          </Form>
        )}
      </Formik>
      <Row className="mb-3">
        <Col>
          <Col sm="6">
            Resend the Code? <button className='resend-link' onClick={() => { resendCode() }}>Click Here</button>
          </Col>
        </Col>
      </Row>
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}

export default ValidateUser;
