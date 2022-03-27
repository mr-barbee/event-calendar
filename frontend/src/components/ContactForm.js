import { Component } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Field, Form } from 'formik'
import * as Yup from 'yup'

const ContactFormSchema = Yup.object().shape({
 fulName: Yup.string()
   .min(2, 'Too Short!')
   .max(50, 'Too Long!')
   .required('Required'),
 email: Yup.string().email('Invalid email').required('Required'),
})

class ContactForm extends Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  async handleSubmit(values) {
    await new Promise((r) => setTimeout(r, 500))
    console.log(values)
    // alert(JSON.stringify(values, null, 2));
    // Get it from props
    // const { navigation } = this.props
    // navigation('/validate-user')
  }

  render() {
    return (
      <div className="contact-form">
        <h3>Please fill out the form below:</h3>
        <Formik
          initialValues={{
            fulName: '',
            phone: '',
            email: '',
            primaryContact: '',
            categories: [],
            experiences: [],
            notify: false
          }}
          validationSchema={ContactFormSchema}
          onSubmit={async (values) => {
            this.handleSubmit(values)
          }}
        >
          {({ values, errors, touched  }) => (
            <Form>
              {/*} Personal information */}
              <label htmlFor="fulName">Name</label>
              <Field id="fulName" name="fulName" placeholder="* Full Name" />
              {errors.fulName && touched.fulName ? (
                <div>{errors.fulName}</div>
              ) : null}

              <label htmlFor="phone">Phone</label>
              <Field id="phone" name="phone" placeholder="* Phone" />

              <label htmlFor="email">Email</label>
              <Field
                id="email"
                name="email"
                placeholder="name@example.com"
                type="email"
              />
              {errors.email && touched.email ? (
                <div>{errors.email}</div>
              ) : null}

              <div id="primary-contact-group">Primary Contact</div>
              <div role="group" aria-labelledby="primary-contact-group">
                <label>
                  <Field type="radio" name="primaryContact" value="Phone" />
                  Phone
                </label>
                <label>
                  <Field type="radio" name="primaryContact" value="Email" />
                  Email
                </label>
                <div>Picked: {values.primaryContact}</div>
              </div>

              {/* Volunteer Categories */}
              <div id="categories-group">Volunteer Categories:</div>
              <div><p>Check all that apply. Based on the options you select you will be notified when volunteer work is needed for that category.</p></div>
              <div role="group" aria-labelledby="categories-group">
                <label>
                  <Field type="checkbox" name="categories" value="Security" />
                  Security
                </label>
                <label>
                  <Field type="checkbox" name="categories" value="Cleanup" />
                  Cleanup
                </label>
                <label>
                  <Field type="checkbox" name="categories" value="Janitoral" />
                  Janitoral
                </label>
              </div>
              <label>
                <Field type="checkbox" name="notify" />
                {`Contact Me when volunteers are needed based on my categories selected. ${values.notify}`}
              </label>

              {/*} Experience & skills */}
              <div id="experiences-group">Experience & Skills:</div>
              <div role="group" aria-labelledby="experiences-group">
                <label>
                  <Field type="checkbox" name="experiences" value="IT" />
                  IT
                </label>
                <label>
                  <Field type="checkbox" name="experiences" value="Multimedia" />
                  Multimedia
                </label>
                <label>
                  <Field type="checkbox" name="experiences" value="Contractor" />
                  Contractor
                </label>
                <label>
                  <Field type="checkbox" name="experiences" value="Writer" />
                  Writer
                </label>
              </div>

              <button type="submit">Submit</button>
            </Form>
          )}
        </Formik>
      </div>
    )
  }
}

// Named the export function to avoid the error.
export default function Hooks(props) {
  const navigate = useNavigate()
  return <ContactForm {...props} navigation={navigate} />
}
