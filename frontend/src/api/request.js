import axios from 'axios'

const AxiosClient = (() => {
  // @TODO Put these variables in an .ENV file.
  return axios.create({
    baseURL: 'https://cms.event-calendar.lndo.site/',
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
    return Promise.reject(error.response)
  }
  // Adding the axios client.
  return AxiosClient(options).then(onSuccess).catch(onError)
}

export default request
