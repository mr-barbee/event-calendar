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
  function getBlockQuotes() {
    return request({
      url: 'api/services/get-block-quotes',
      method: 'GET'
    })
  }
  function sendVerificationToken(values) {
    return request({
      url: 'api/services/send-token',
      method: 'POST',
      data: {
        uid: values.uid
      }
    })
  }
  // @TODO Add the user ID as well.
  function verifyToken(values) {
    return request({
      url: 'api/services/check-token',
      method: 'POST',
      data: {
        uid: values.uid,
        code: values.code
      }
    })
  }
  return [
    getTaxonomy,
    sendVerificationToken,
    verifyToken,
    getBlockQuotes
  ]
}

export default useUtilityService
