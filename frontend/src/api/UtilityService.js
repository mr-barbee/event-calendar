import request from "./request"
import * as GRAPHQL from './graphql'

export default class UtilityService {
  static getTaxonomy(taxonomy) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETTAXONOMY(taxonomy)
      }
    })
  }
  static sendVerificationToken(values) {
    return request({
      url: 'api/services/send-token',
      method: 'POST',
      data: {
        contact: values.contact,
        type: values.type
      }
    })
  }
  static verifyToken(values) {
    return request({
      url: 'api/services/check-token',
      method: 'POST',
      data: {
        sid: values.sid,
        code: values.code
      }
    })
  }
}
