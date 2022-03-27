import React from 'react'
import { Link } from "react-router-dom"
// import PropTypes from 'prop-types'

function LocateUser() {
  // const [username, setUserName] = useState();
  // const [password, setPassword] = useState();

  return (
    <div className="login">
      <h3>Are you a <strong>new</strong> <i>or</i> <strong>existing</strong> volunteer?</h3>
      <div>
        <Link to="/contact-form">New</Link>
      </div>
      <div>
        <Link to="/locate-accout">Existing</Link>
      </div>
    </div>
  );
}

export default LocateUser;
