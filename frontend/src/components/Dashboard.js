import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useToken } from '../auth/useToken'
import { useUser } from '../auth/useUser'
import { useMutation, useQuery } from 'react-query'

function Dashboard() {
  const navigate = useNavigate()
  const user = useUser()
  const [token, setToken] = useToken()
  const [skip, setSkip] = useState(false)
  const { isLoading, isError, error, mutate: logoutMutate } = useMutation(logout)
  const { isLoading: sessionIsLoading, data: sessionToken } = useQuery('sessionToken', fetchSessionToken, { enabled: skip})

  useEffect(() => {
    // if the user is set and data empty run the
    // query if not loading.
    if (user && !sessionIsLoading) {
      // Set the skip for
      // the query.
      setSkip(true)
    }
  }, [sessionIsLoading, user]);

  async function logout() {
    await axios.post(`https://cms.event-calendar.lndo.site/user/logout?_format=json&token=${token.logout_token}`, {}, {
        headers: {
          'X-CSRF-Token': sessionToken
        },
        withCredentials: true
      }
    )
    // Get the token data
    // from the response.
    localStorage.removeItem('token');
    setToken(null)
    navigate('/login')
  }

  async function fetchSessionToken() {
    const { data } = await axios.get('https://cms.event-calendar.lndo.site/session/token', { withCredentials: true })
    setSkip(false)
    return data
  }

  function callDrupal() {
    axios.post('https://cms.event-calendar.lndo.site/graphql_api', {
      query: `query GetArticles{
        article(id: 2) {
          id
          title
          author
        }
      }`
    }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      })
    .then(res => {
      console.log(res)
    })
  }

  function navigation () {
    navigate('/contact-form')
  }

  return (
    <div className="login">
      <h1>Here is your dashboard</h1>
      <button onClick={callDrupal}>Call Drupal</button>
      <button type="submit" onClick={() => {navigation()}}>Next Screen</button>
        {!!user
          && <button type="submit" onClick={() => {logoutMutate()}}>Logout</button>
        }

        {isLoading
            ? "Logging out...": ""
          }
        {isError
          ? error.message : ""
        }
    </div>
  );
}

export default Dashboard;
