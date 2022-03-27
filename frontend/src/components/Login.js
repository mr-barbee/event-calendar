import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik, Form, Field } from 'formik'
import { useMutation,} from 'react-query'
import { useToken } from '../auth/useToken'
import axios from 'axios'
import * as Yup from 'yup';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const ValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
})

export default function Login() {
  const navigate = useNavigate()
  const [, setToken] = useToken()
  const [error, setError] = useState('')

  const responseFacebook = response => {
    if (response.accessToken) {
      // Set the data from
      // the Facebook API.
      onFacebookResponseLogin(response.accessToken)
    }
    else {
      setError('Sorry, unable to authenticate with Facebook.')
    }
  }

  const mutatePostLogin = useMutation(
    values => axios.post(`https://cms.event-calendar.lndo.site/user/login?_format=json`, {
    name: values.email, pass: values.password }, { withCredentials: true }),
    {
      onSuccess: response => {
        // Get the token data
        // from the response.
        setToken(response.data)
        // After setting
        // we navigate to
        // the user dashbard.
        navigate('/')
      },
      onError: error => {
        setError(error.response.data.message)
      }
    }
  )

  const onFacebookResponseLogin = async (accessToken) => {
    await axios.post(`https://cms.event-calendar.lndo.site/user/login/facebook?_format=json`, {
      access_token: accessToken})
      .then(response => {
        // Get the token data
        // from the response.
        setToken(response.data)
        // After setting
        // we navigate to
        // the user dashbard.
        navigate('/')
      })
      .catch((err) => {
        setError(err)
      })
  }

  return (
    <div className="login">
      <>
        <h3>Please Sign in below with your <strong>email</strong>:</h3>
        <Formik
          initialValues={{
            email: '',
            password: ''
          }}
          validationSchema={ValidationSchema}
          onSubmit={values => { mutatePostLogin.mutate(values) }}
        >
          {({ errors, touched }) => (
            <Form>
              <div>
                <Field name="email" type="email" placeholder="Email"  />
                {errors.email && touched.email ? <div>{errors.email}</div> : null}
              </div>
              <div>
                <Field name="password" type="password" placeholder="Password"  />
                {errors.password && touched.password ? <div>{errors.password}</div> : null}
              </div>
              <div>
                <button type="submit">Login</button>
              </div>
              <div>
                <p><strong>-- OR --</strong></p>
              </div>
              <div>
                <FacebookLogin
                  appId='1123351384872679'
                  autoLoad={false}
                  fields='name,email,picture'
                  scope='public_profile,user_friends'
                  callback={responseFacebook}
                  icon='fa-facebook' />
              </div>
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
