import axios from 'axios'
import LogoutHelper from '../components/Common/LogoutHelper'

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
const request = async function (options, store) {
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
    console.log(error.response.status)
    if (error.response.status === 403) LogoutHelper.logout()
    return Promise.reject(error.response)
  }
  // Adding the axios client.
  return AxiosClient(options).then(onSuccess).catch(onError)
}

export default request
