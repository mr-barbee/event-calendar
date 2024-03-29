import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { Formik } from 'formik'
import { useMutation } from 'react-query'
import useUserService from '../../api/useUserService'
import { Form, Row, Col } from 'react-bootstrap'
import { Submit, Input } from '../_common/FormElements'
import ValidationSchema from './validation'
import SEO from '@americanexpress/react-seo'
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
  if (verification) return <Navigate to={`/verify?uid=${verification.uid}&updatePassword=true`}/>

  return (
    <div className="login">
      <SEO
        title="Locate Account"
        description="Please lookup your accoutn based on the certain account information."
      />
      <h5>Locate your account</h5>
      <Formik
        initialValues={{
          name: '',
          phone: ''
        }}
        validationSchema={ValidationSchema}
        onSubmit={(values, {setSubmitting, resetForm}) => { locate(values, { onError: (res) => setError(res.data.message) }) }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Input
                as={Col}
                column="12"
                controlId="formName"
                type="text"
                name="name"
                placeholder="Email or Username"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.name && !errors.name}
                className={touched.name && errors.name ? "error" : null}
                errors={touched.name && errors.name ? errors.name : null}
              />
            </Row>
            <Row className="mb-3">
              <hr className="hr-text" data-content="OR" />
            </Row>
            <Row className="mb-3">
              <Input
                as={Col}
                column="12"
                controlId="formPhone"
                type="text"
                name="phone"
                placeholder="5555555555"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                isValid={touched.phone && !errors.phone}
                className={touched.phone && errors.phone ? "error" : null}
                errors={touched.phone && errors.phone ? errors.phone : null}
                helperText="Please include the area code."
                InputGroupType="text"
                InputGroupClassName="mb-3"
                InputGroupValue="+1"
              />
            </Row>
            <Row className="mb-3">
              <Col>
                <Submit value='Locate Account' />
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <Col sm="6">
                  Remember you login? <Link to={`/login`}>Click Here</Link>
                </Col>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
      {error &&
        <p className="error-message">{ error }</p>
      }
    </div>
  )
}
