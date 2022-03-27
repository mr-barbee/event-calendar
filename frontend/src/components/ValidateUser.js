import React, { Component } from 'react'
// import { useHistory } from "react-router-dom"

class ValidateUser extends Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    console.log('A name was submitted: ' + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <div className="validate-user">
        <h3>Please fill out the form below:</h3>
          <form onSubmit={this.handleSubmit}>
            <div>
              <label>
                Enter Code sent to device:
                <input placeholder="*Access Code" type="text" value={this.state.value} onChange={this.handleChange} />
              </label>
            </div>
            <div>
              <input type="submit" value="Submit" />
            </div>
          </form>
      </div>
    );
  }
}

export default ValidateUser;
