import useRequest from "./useRequest"
import * as GRAPHQL from './graphql'

const useUserService = () => {
  const [request] = useRequest()
  function getCurrentUser() {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETUSER
      }
    })
  }
  function loginUser(values) {
    return request({
      url: 'user/login?_format=json',
      method: 'POST',
      data: {
        name: values.email,
        pass: values.password
      }
    })
  }
  function facebookLoginUser(accessToken) {
    return request({
      url: 'user/login/facebook?_format=json',
      method: 'POST',
      data: {
        access_token: accessToken
      }
    })
  }
  function logoutUser(values) {
    return request({
      url: `user/logout?_format=json&token=${values.logoutToken}`,
      method: 'POST',
      headers: {
        'X-CSRF-Token': values.sessionToken
      }
    })
  }
  function fetchSessionToken() {
    return request({
      url: 'session/token',
      method: 'GET'
    })
  }

  return [getCurrentUser, loginUser, facebookLoginUser, logoutUser, fetchSessionToken]
}

export default useUserService
