import request from "./request"
import * as GRAPHQL from './graphql'

export default class UserService {
  static getCurrentUser() {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETUSER
      }
    })
  }
  static loginUser(values) {
    return request({
      url: 'user/login?_format=json',
      method: 'POST',
      data: {
        name: values.email,
        pass: values.password
      }
    })
  }
  static facebookLoginUser(accessToken) {
    return request({
      url: 'user/login/facebook?_format=json',
      method: 'POST',
      data: {
        access_token: accessToken
      }
    })
  }
  static logoutUser(values) {
    return request({
      url: `user/logout?_format=json&token=${values.logoutToken}`,
      method: 'POST',
      headers: {
        'X-CSRF-Token': values.sessionToken
      }
    })
  }
  static fetchSessionToken() {
    return request({
      url: 'session/token',
      method: 'GET'
    })
  }
}
