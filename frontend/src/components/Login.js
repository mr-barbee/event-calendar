import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import FacebookLogin from 'react-facebook-login'
import { Formik, Form, Field } from 'formik'
import { useQuery, useMutation } from 'react-query'
import UserService from '../api/UserService'
import { useToken } from '../auth/useToken'
import * as Yup from 'yup';

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/
const ValidationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  phone: Yup.string().matches(phoneRegExp, 'Phone number is not valid')
})

export default function Login() {
  const [token, setToken] = useToken()
  const [error, setError] = useState('')
  // We want to call the user api only once the skip state is set.
  const [skip, setSkip] = useState(false)
  const { isLoading, data } = useQuery(['get-user'], () => UserService.getCurrentUser(), { enabled: skip })
  // Login mutation for the login form with an email and password.
  const { data: mutationData, mutate: mutatePostLogin } = useMutation((values) => UserService.loginUser(values))
  // Login mutation for the facebook data.
  const { data: facebookData, mutate: mutateFacebookLogin } = useMutation((accessToken) => UserService.facebookLoginUser(accessToken))
  // Reponse callback for the facebook login.
  const responseFacebook = response => {
    if (response.accessToken) {
      // Set the data from the Facebook API.
      mutateFacebookLogin(response.accessToken, { onError: (res) => setError(res.data.message) })
    } else {
      setError('Sorry, unable to authenticate with Facebook.')
    }
  }

  useEffect(() => {
    if (mutationData || facebookData) {
      // we want to run the
      // current user api.
      setSkip(true)
    }
  }, [mutationData, facebookData])

  useEffect(() => {
    if (data && !isLoading) {
      if (mutationData || facebookData) {
        // Get the token data from the response.
        let tokenData = mutationData ? mutationData : facebookData
        tokenData.current_user = data.currentUser
        setToken(tokenData)
      }
    }
  }, [data, isLoading, facebookData, mutationData, setToken])

  // Direct to the login page if token is set.
  if (token) return <Navigate to="/" />

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
          onSubmit={values => { mutatePostLogin(values, { onError: (res) => setError(res.data.message) }) }}
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
