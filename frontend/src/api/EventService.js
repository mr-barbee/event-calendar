import request from "./request"
import * as GRAPHQL from './graphql'

export default class EventService {
  static getEvent(id) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETEVENT(id)
      }
    })
  }
  static getEvents(parameters) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETEVENTS(parameters)
      }
    })
  }
}
