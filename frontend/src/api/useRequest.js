import { useContext } from 'react'
import axios from 'axios'
import { useQueryClient } from 'react-query'
import { SessionContext } from '../context'

// The base request used to get query data.
const useRequest = () => {
  const { sessionToken } = useContext(SessionContext)
  const queryClient = useQueryClient()

  const AxiosClient = (() => {
    return axios.create({
      baseURL: process.env.REACT_APP_BASE_URL,
      timeout: 1000,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': sessionToken
      },
      withCredentials: true
    })
  })()

  // Success hanlder for the request
  const onSuccess = function (response) {
    const {
      data
    } = response
    // Need to conditionally render the data bc JSON and GraphQL
    // returns different data structure.
    return typeof data.data !== 'undefined' ? data.data : data
  }
  // Catch the error response.
  const onError = function (error) {
    // we re-verify the session if we get a 403 access denied error.
    if (error.response.status === 403) queryClient.invalidateQueries('verify-session')
    // if an error was returned but not response was set then we must manually set it.
    if (typeof error.response == 'undefined') error.response = {'data': {'message': 'There was an error contacting the server.'}}
    // return promise.
    return Promise.reject(error.response)
  }
  const request = async function (options) {
    // Adding the axios client.
    return AxiosClient(options).then(onSuccess).catch(onError)
  }
  return [request]
}

export default useRequest
