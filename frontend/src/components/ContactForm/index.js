import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Formik } from 'formik'
import useUserService from '../../api/useUserService'
import useUtilityService from '../../api/useUtilityService'
import { useUser } from '../../hooks/useUser'
import { Spinner, Form, Row, Col } from 'react-bootstrap'
import { Submit, Input, Check } from '../_common/FormElements'
import ValidationSchema from './validation'

function ContactForm() {
  const user = useUser()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [socialLogin, setSocialLogin] = useState(false)
  const [verification, setVerification] = useState('')
  const [getCurrentUser,,,,, updateUser] = useUserService()
  const [getTaxonomy, sendVerificationToken] = useUtilityService()
  const { isLoading, data: userData } = useQuery(['get-user'], () => getCurrentUser())
  const { isLoading: categoriesLoading, data: categories } = useQuery(['get-volunteer-categories'], () => getTaxonomy('volunteer_categories'))
  const { isLoading: skillsLoading, data: experiences } = useQuery(['get-experience-skills'], () => getTaxonomy('experience_skills'))
  const { mutate: mutateUser } = useMutation((values) => updateUser(values))
  const { data: verificationData, mutate: sendVerification } = useMutation((values) => sendVerificationToken(values))

  const formSubmit = values => {
    mutateUser(values, {
      onError: (res) => setError(res.data.updateUser.errors.message),
      onSuccess: (data) => {
        if (data.updateUser.errors.length) {
          setError(data.updateUser.errors[0].message)
        } else {
          // refetch the user data
          queryClient.invalidateQueries(['get-user'])
          // check to see if we need to verifu the users primary contact.
          if (data.updateUser.user.verified === false) {
            sendVerification({'uid': user.uid}, { onError: (res) => setError(res.data.error_message) })
          } else {
            // We only want navigate to
            // profile page if we dont
            // need to validate contact.
            navigate('/')
          }
        }
      }
    })
  }

  useEffect(() => {
    if (userData) {
      setSocialLogin(userData.currentUser.socialLogin !== null)
    }
  }, [userData, setSocialLogin])

  useEffect(() => {
    if (verificationData) {
      // we want to verify the status is pending.
      if (verificationData.status === 'pending') {
        setVerification(verificationData.token)
      } else {
        setError('There was an error with the verification. Please contact site administator.')
      }
    }
  }, [verificationData, setVerification])

  // Direct to the verification page if token is set.
  if (verification) return <Navigate to={`/verify`} />

  return (
    <div className="contact-form">
      <h3>Please fill out the form below:</h3>
      {userData && !isLoading &&
        <Formik
          initialValues={{
            name: userData.currentUser.name,
            email: userData.currentUser.email,
            currPass: '',
            pass: '',
            confirmPass: '',
            fullName: userData.currentUser.fullName,
            phone: userData.currentUser.phone ?? '',
            primary: userData.currentUser.primary,
            categories: Object.keys(userData.currentUser.categories),
            contact: userData.currentUser.contact,
            experiences: Object.keys(userData.currentUser.experiences),
            note: userData.currentUser.note ?? ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { formSubmit(values) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              {/*} Personal information */}
              {socialLogin &&
                <Row className="mb-3">
                  <Col>
                    <Submit
                      value='Remove Social Login'
                      onClick={() => { setSocialLogin(false) }}
                      />
                  </Col>
                </Row>
              }
              {socialLogin === false &&
                <>
                  {userData.currentUser.socialLogin === null &&
                    <Row>
                      <div className="mb-3">
                        <Input
                          as={Col}
                          column="12"
                          controlId="formCurrPass"
                          type="password"
                          name="currPass"
                          placeholder="Current Password"
                          value={values.currPass}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isValid={touched.currPass && !errors.currPass}
                          className={touched.currPass && errors.currPass ? "error" : null}
                          errors={touched.currPass && errors.currPass ? errors.currPass : null}
                          helperText="If your updating your username, email or password you must enter your current password. Otherwise leave this blank."
                        />
                      </div>
                    </Row>
                  }
                  <Row>
                    <div className="mb-3">
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
                    </div>
                    <div className="mb-3">
                      <Input
                        as={Col}
                        column="12"
                        controlId="formEmail"
                        type="email"
                        name="email"
                        placeholder="* name@example.com"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isValid={touched.email && !errors.email}
                        className={touched.email && errors.email ? "error" : null}
                        errors={touched.email && errors.email ? errors.email : null}
                        helperText="A valid email address. All emails from the system will be sent to this address. The email address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by email."
                      />
                    </div>
                  </Row>
                  <Row>
                    <div className="mb-3">
                      <Input
                        as={Col}
                        column="12"
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
                        helperText="To change user password, enter the new password in both fields. Otherwise leave this blank."
                      />
                    </div>
                    <div className="mb-3">
                      <Input
                        as={Col}
                        column="12"
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
                    </div>
                  </Row>
                </>
              }
              <Row>
                <div className="mb-3">
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
                </div>
                <div className="mb-3">
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
                </div>
              </Row>
              <Row>
                <Check
                  as={Col}
                  column="6"
                  type="radio"
                  controlId="formPrimary"
                  groupClassName="mb-3"
                  formLabel="Primary Contact:"
                  name="primary"
                  checkColumn="12"
                  inline={false}
                  value={values.primary}
                  values={[
                    {id:"email", label:"Email", value:"e"},
                    {id:"phone", label:"Phone", value:"p"}
                  ]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  isValid={touched.primary && !errors.primary}
                  errors={touched.primary && errors.primary ? errors.primary : null}
                  helperText="Please confirm your primary contact."
                />
              </Row>
              {/* Volunteer Categories */}
              <Row>
                {categories && !categoriesLoading &&
                  <Check
                    as={Col}
                    column="12"
                    type="checkbox"
                    controlId="formCategories"
                    groupClassName="mb-3"
                    formLabel={<><h5>Volunteer Categories:</h5><p>Check all that apply. Based on the options you select you will be notified when volunteer work is needed for that category.</p></>}
                    name="categories"
                    checkColumn="3"
                    className="mb-3"
                    inline={true}
                    value={values.categories}
                    values={categories.taxonomies.items.map((items) => (
                      {id:items.name, label:items.name, value:items.id}
                    ))}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                }
              </Row>
              <Row>
                <Check
                  as={Col}
                  column="12"
                  type="checkbox"
                  controlId="formContact"
                  name="contact"
                  className="mb-3"
                  inline={true}
                  value={values.contact}
                  values={[{id:"contact", label:"Contact Me when volunteers are needed based on my categories selected.", value:values.contact}]}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Row>
              <Row>
                {experiences && !skillsLoading &&
                  <Check
                    as={Col}
                    column="12"
                    type="checkbox"
                    controlId="formExperiences"
                    groupClassName="mb-3"
                    formLabel={<h5>Experience & Skills:</h5>}
                    name="experiences"
                    checkColumn="3"
                    className="mb-3"
                    inline={true}
                    value={values.experiences}
                    values={experiences.taxonomies.items.map((items) => (
                      {id:items.name, label:items.name, value:items.id}
                    ))}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                }
              </Row>
              <Row>
                <Input
                  as={Col}
                  column="12"
                  controlId="formNote"
                  groupClassName="mb-3"
                  inputAs="textarea"
                  name="note"
                  rows={3}
                  formLabel="Add Note:"
                  placeholder="Note (Optional)"
                  value={values.note}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </Row>
              <Row className="mb-3">
                <Col><Submit value='Submit' /></Col>
              </Row>
            </Form>
          )}
        </Formik>
      }
      {isLoading &&
        <Spinner animation="border" role="status" size="lg" >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      }
      {error &&
        <p>{ error }</p>
      }
    </div>
  )
}

export default ContactForm;
