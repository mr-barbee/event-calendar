import useRequest from "./useRequest"
import * as GRAPHQL from './graphql'

const useEventService = () => {
  const [request] = useRequest()
  function getEvent(id) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETEVENT(id)
      }
    })
  }
  function getEvents(parameters) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETEVENTS(parameters)
      }
    })
  }
  function updateEvent(parameters) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.UPDATEEVENT(parameters)
      }
    })
  }
  return [getEvent, getEvents, updateEvent]
}

export default useEventService
