import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Formik } from 'formik'
import UserService from '../api/UserService'
import UtilityService from '../api/UtilityService'
import { Button, Form, Row, Col } from 'react-bootstrap'
import * as Yup from 'yup'

// RegEx for phone number validation
const phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

const ContactFormSchema = Yup.object().shape({
 fullName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  phone: Yup.string()
    .matches(phoneRegExp, "*Phone number is not valid")
    .required("*Phone number required"),
  email: Yup.string()
    .email('Invalid email')
    .required('Required'),
  primaryContact: Yup.string()
    .required('Required'),
})

function ContactForm() {
  const navigate = useNavigate()
  const { isLoading, data } = useQuery(['get-user'], () => UserService.getCurrentUser())
  const { isLoading: categoriesLoading, data: categories } = useQuery(['get-volunteer-categories'], () => UtilityService.getTaxonomy('volunteer_categories'))
  const { isLoading: skillsLoading, data: experiences } = useQuery(['get-experience-skills'], () => UtilityService.getTaxonomy('experience_skills'))


  const formSubmit = values => {
    console.log(values)
    navigate('/')
  }

  return (
    <div className="contact-form">
      <h3>Please fill out the form below:</h3>
      {data && !isLoading &&
        <Formik
          initialValues={{
            userName: data.currentUser.name,
            fullName: data.currentUser.fullName,
            phone: data.currentUser.phone,
            email: data.currentUser.email,
            primaryContact: data.currentUser.primary,
            categories: Object.keys(data.currentUser.categories),
            notify: data.currentUser.contact,
            experiences: Object.keys(data.currentUser.experiences),
            note: data.currentUser.note
          }}
          validationSchema={ContactFormSchema}
          onSubmit={(values, {setSubmitting, resetForm}) => { formSubmit(values) }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <Form onSubmit={handleSubmit}>
              {/*} Personal information */}
              <Row className="mb-3">
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formUserName"
                >
                  <Form.Control
                    type="text"
                    name="userName"
                    placeholder="* Username"
                    value={values.userName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.userName && !errors.userName}
                    className={touched.userName && errors.userName ? "error" : null}
                  />
                  <Form.Text className="text-muted">
                    Several special characters are allowed, including space, period (.), hyphen (-), apostrophe (&#39;), underscore (_), and the @ sign.
                  </Form.Text>
                  {touched.userName && errors.userName ? (
                    <div className="error-message">{errors.userName}</div>
                  ): null}
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formFullName"
                >
                  <Form.Control
                    type="text"
                    name="fullName"
                    placeholder="* Full Name"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.fullName && !errors.fullName}
                    className={touched.fullName && errors.fullName ? "error" : null}
                  />
                  {touched.fullName && errors.fullName ? (
                    <div className="error-message">{errors.fullName}</div>
                  ): null}
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formEmail"
                >
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="* name@example.com"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isValid={touched.email && !errors.email}
                    className={touched.email && errors.email ? "error" : null}
                  />
                  <Form.Text className="text-muted">
                    A valid email address. All emails from the system will be sent to this address. The email address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by email.
                  </Form.Text>
                  {touched.email && errors.email ? (
                    <div className="error-message">{errors.email}</div>
                  ): null}
                </Form.Group>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formPhone"
                >
                  <Form.Control
                    type="text"
                    name="phone"
                    placeholder="* Phone"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.phone}
                    className={touched.phone && errors.phone ? "error" : null}
                    isValid={touched.phone && !errors.phone}
                  />
                  {touched.phone && errors.phone ? (
                    <div className="error-message">{errors.phone}</div>
                  ): null}
                </Form.Group>
              </Row>
              <Row>
                <Form.Group
                  as={Col}
                  md="6"
                  controlId="formPrimaryContact"
                >
                  <Form.Label>Primary Contact:</Form.Label>
                  <div key="primaryContact" className="mb-3">
                    <Form.Check
                      type="radio"
                      id="email"
                      label="Email"
                      name="primaryContact"
                      value='e'
                      checked={values.primaryContact === 'e'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isValid={touched.primaryContact && !errors.primaryContact}
                    />
                    <Form.Check
                      type="radio"
                      label='Phone'
                      id="phone"
                      name="primaryContact"
                      value='p'
                      checked={values.primaryContact === 'p'}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isValid={touched.primaryContact && !errors.primaryContact}
                    />
                  </div>
                  {touched.primaryContact && errors.primaryContact ? (
                    <div className="error-message">{errors.primaryContact}</div>
                  ): null}
                </Form.Group>
              </Row>
              {/* Volunteer Categories */}
              <Row>
                <Form.Group
                  controlId="formCategories"
                  as={Col}
                  md="12"
                  className="mb-3"
                >
                  <Form.Label>
                    <h5>Volunteer Categories:</h5>
                    <p>Check all that apply. Based on the options you select you will be notified when volunteer work is needed for that category.</p>
                  </Form.Label>
                  <div key="categories" className="mb-3">
                    {categories && !categoriesLoading &&
                      <Row>
                        {categories.taxonomies.items.map((items) => (
                          <Col sm='3' className="mb-3" key={ items.id }>
                            <Form.Check
                              inline
                              label={ items.name }
                              name="categories"
                              type='checkbox'
                              id={ items.name }
                              value={ items.id }
                              checked={values.categories.includes( items.id.toString() )}
                              onChange={handleChange}
                              onBlur={handleBlur}
                            />
                          </Col>
                        ))}
                      </Row>
                    }
                  </div>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="formNotify"
                >
                  <div key="categories" className="mb-3">
                    <Form.Check
                      inline
                      label="Contact Me when volunteers are needed based on my categories selected."
                      name="notify"
                      type="checkbox"
                      id="notify"
                      checked={values.notify}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />

                  </div>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group
                  as={Col}
                  md="12"
                  controlId="formExperiences"
                >
                  <Form.Label>
                    <h5>Experience & Skills:</h5>
                  </Form.Label>
                  <div key="experiences" className="mb-3">
                    <div key="experiences" className="mb-3">
                      {experiences && !skillsLoading &&
                        <Row>
                          {experiences.taxonomies.items.map((items) => (
                            <Col sm='3' className="mb-3" key={ items.id }>
                              <Form.Check
                                inline
                                label={ items.name }
                                name="experiences"
                                type='checkbox'
                                id={ items.name }
                                value={ items.id }
                                checked={values.experiences.includes( items.id.toString() )}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                            </Col>
                          ))}
                        </Row>
                      }
                    </div>
                  </div>
                </Form.Group>
              </Row>
              <Row>
                <Form.Group
                  as={Col}
                  md="12"
                  className="mb-3"
                  controlId="formNote"
                >
                  <Form.Label>Add Note:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="note"
                    placeholder="Note (Optional)"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.note}
                  />
                </Form.Group>
              </Row>
              <Row className="mb-3">
                <Col><Button variant="primary" type="submit">Submit</Button></Col>
              </Row>
            </Form>
          )}
        </Formik>
      }
    </div>
  )
}

export default ContactForm;
