import { useState, useEffect } from 'react'
import axios from 'axios'

export function usePost = (url = 'http://www.abc.cd/test', body = {}, options = null) => {
  const [data, setData] = useState(null);
  useEffect(() => {

    // fetch(url, options)
    //   .then(res => res.json())
    //   .then(data => setData(data));

    axios.post(url, body, options)
      .then(response => {
        setData(response.data)
      })
  }, [url, body, options]);
  return {data}
}

const api = axios.create({
  baseURL: 'https://cms.event-calendar.lndo.site',
});
