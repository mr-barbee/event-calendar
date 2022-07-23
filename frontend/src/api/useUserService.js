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
  function loginUser(parameters) {
    return request({
      url: 'user/login?_format=json',
      method: 'POST',
      data: {
        name: parameters.email,
        pass: parameters.password
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
  function logoutUser(parameters) {
    return request({
      url: `user/logout?_format=json&token=${parameters.logoutToken}`,
      method: 'POST',
      headers: {
        'X-CSRF-Token': parameters.sessionToken
      }
    })
  }
  function fetchSessionToken() {
    return request({
      url: 'session/token',
      method: 'GET'
    })
  }

  function updateUser(parameters) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.UPDATEUSER(parameters)
      }
    })
  }

  function registerUser(parameters) {
    return request({
      url: 'api/services/register-user',
      method: 'POST',
      data: {
        name: parameters.name,
        email: parameters.email,
        pass: parameters.password
      }
    })
  }

  return [getCurrentUser, loginUser, facebookLoginUser, logoutUser, fetchSessionToken, updateUser, registerUser]
}

export default useUserService
