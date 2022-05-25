import axios from 'axios'
import useLogout from '../components/Common/useLogout'

const AxiosClient = (() => {
  return axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    timeout: 1000,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  })
})()

// The base request used to get query data.
const useRequest = () => {
  const [logout] = useLogout()
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
    if (typeof error.response !== 'undefined' && error.response.status === 403) logout()
    return Promise.reject(error.response)
  }
  const request = async function (options, store) {
    // Adding the axios client.
    return AxiosClient(options).then(onSuccess).catch(onError)
  }
  return [request]
}

export default useRequest
