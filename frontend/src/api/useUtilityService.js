import useRequest from "./useRequest"
import * as GRAPHQL from './graphql'

const useUtilityService = () => {
  const [request] = useRequest()
  function getTaxonomy(taxonomy) {
    return request({
      url: 'graphql_api',
      method: 'POST',
      data: {
        query : GRAPHQL.GETTAXONOMY(taxonomy)
      }
    })
  }
  function sendVerificationToken(values) {
    return request({
      url: 'api/services/send-token',
      method: 'POST',
      data: {
        contact: values.contact,
        type: values.type
      }
    })
  }
  // @TODO Add the user ID as well.
  function verifyToken(values) {
    return request({
      url: 'api/services/check-token',
      method: 'POST',
      data: {
        user_id: values.user_id,
        sid: values.sid,
        code: values.code
      }
    })
  }
  return [getTaxonomy, sendVerificationToken, verifyToken]
}

export default useUtilityService
