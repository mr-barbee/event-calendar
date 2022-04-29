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
}
