import React, { useState, useEffect } from 'react'
import FacebookLogin from 'react-facebook-login'
import { Card, Image } from 'react-bootstrap'
import axios from 'axios'

function MetaLogin() {

  const [login, setLogin] = useState(false)
  const [data, setData] = useState({})
  const [items, setItems] = useState({})
  const [error, setError] = useState('')
  const [picture, setPicture] = useState('')

  const responseFacebook = (response) => {
    if (response.accessToken) {
      // Set the data from the Facebook API.
      setData(response);
      setPicture(response.picture.data.url)
    }
    else {
      setData({})
    }
  }

  const logout = () => {
    axios.post(`https://cms.event-calendar.lndo.site/user/logout?_format=json&token=${items.data.logout_token}`, {},  {
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': items.data.csrf_token
        },
        withCredentials: true
      })
      .then(res => {
        console.log(res)
        setData({});
        setPicture('')
        setLogin(false)
        window.localStorage.clear()
      })
  }

  const callDrupal = () => {
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

  useEffect(() => {
    if (Object.keys(data).length) {
      axios.post(`https://cms.event-calendar.lndo.site/user/login/facebook?_format=json`, {
        access_token: data.accessToken})
        .then(res => {
          console.log(res)
          console.log(res.data);
          setItems(res)
          setLogin(true)
        })
        .catch((err) => {
          setError(err)
        })
    }
  }, [data])

  return (
    <div className='container'>
      <Card style={{ width: '600px' }}>
        <Card.Header>
          {!login &&
            <FacebookLogin
              appId='1123351384872679'
              autoLoad={false}
              fields='name,email,picture'
              scope='public_profile,user_friends'
              callback={responseFacebook}
              icon='fa-facebook' />
          }
          {login &&
            <Image src={picture} roundedCircle />
          }
        </Card.Header>
        {login &&
          <>
            <Card.Body>
              <Card.Title>{data.name}</Card.Title>
              <Card.Text>
                {data.email}
              </Card.Text>
            </Card.Body>
            <button onClick={callDrupal}>Call Drupal</button>
            <button onClick={logout}>Logout</button>
          </>
        }
        {error &&
          <p>Sorry there was an error logging in.</p>
        }
      </Card>
    </div>
  );
}

export default MetaLogin;
