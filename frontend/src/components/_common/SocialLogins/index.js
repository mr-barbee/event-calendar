import { useEffect, useContext } from 'react'
import FacebookLogin from 'react-facebook-login'
import { useGoogleLogin } from '@react-oauth/google'
import { useMutation } from 'react-query'
import useUserService from '../../../api/useUserService'
import { Row, Col, Spinner } from 'react-bootstrap'
import { Submit } from '../FormElements'
import { SessionContext } from '../../../context'
import GoogleIcon from './images/icons8-google.svg'
import './style.scss'

export function SocialLogins({ onError }) {
  const [,, facebookLoginUser,,,,,,,, googleLoginUser] = useUserService()
  const { setToken, setSessionToken, ReactGA } = useContext(SessionContext)
  // Login mutation for the facebook and google data.
  const { isLoading: facebookLoading, data: facebookData, mutate: mutateFacebookLogin } = useMutation((accessToken) => facebookLoginUser(accessToken))
  const { isLoading: googleLoading, data: googleData, mutate: mutateGoogleLogin } = useMutation((accessToken) => googleLoginUser(accessToken))
  // Reponse callback for the facebook login.
  const responseFacebook = response => {
    // Set the data from the Facebook API.
    if (response.accessToken) mutateFacebookLogin(response.accessToken, { onError: (res) => onError(res.data.message) })
    else onError('Sorry, unable to authenticate with Facebook.')
  }
  // Google login api.
  const googleLogin = useGoogleLogin({
    onSuccess: response => mutateGoogleLogin(response.access_token, { onError: (res) => onError(res.data.message) }),
    onError: () => onError('Sorry, unable to authenticate with Google.')
  })
  // Helper JSX for the loading spinner.
  const Loading = () => {
    return (
      <>
        <Spinner
          as="span"
          animation="border"
          size="sm"
          role="status"
          aria-hidden="true"
        /> Loading...
      </>
    )
  }

  useEffect(() => {
    if (facebookData || googleData) {
      // we want to run the
      // current user api.
      let tokenData = facebookData ?? googleData
      ReactGA.event({
        event_name: "Social Login",
        category: "social_login",
        action: "social_login",
        nonInteraction: false,
        transport: "xhr",
      })
      setToken(tokenData)
      setSessionToken(tokenData.csrf_token)
    }
  }, [facebookData, googleData, setToken, setSessionToken, ReactGA])

  return(
    <>
      <Row className="mb-3">
        <Col>
          <FacebookLogin
            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
            autoLoad={false}
            fields='name,email,picture'
            scope='public_profile,user_friends'
            callback={responseFacebook}
            icon='fa-facebook'
            isDisabled={facebookLoading}
            textButton={ facebookLoading ? <Loading /> : 'Login with Facebook' }
          />
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Submit value={
              <div id='googleBtn' className='customGPlusSignIn'>
                <div className='google-icon'>
                  <img src={GoogleIcon} alt='Google Icon' />
                </div>
                <span className='buttonText'>
                  { googleLoading ? <Loading /> : 'Login with Google' }
                </span>
              </div>
            }
            className='google-button'
            disabled={googleLoading}
            onClick={() => { googleLogin() }}
          />
        </Col>
      </Row>
    </>
  )
}
