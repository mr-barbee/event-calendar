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
      method: 'POST'
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
        fullName: parameters.fullName
      }
    })
  }

  function updateUserPassword(parameters) {
    return request({
      url: 'api/services/update-password',
      method: 'POST',
      data: {
        uid: parameters.uid,
        password: parameters.pass,
        sid: parameters.sid
      }
    })
  }

  return [getCurrentUser, loginUser, facebookLoginUser, logoutUser, fetchSessionToken, updateUser, registerUser, updateUserPassword]
}

export default useUserService
