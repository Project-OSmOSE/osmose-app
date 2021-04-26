// @flow
import React, { Component } from 'react';
import request from 'superagent';

if (!process.env.REACT_APP_API_URL) throw new Error('REACT_APP_API_URL missing in env');
const API_URL = process.env.REACT_APP_API_URL + '/authentication/authenticate';

type LoginProps = {
  handleToken: (token: string) => void
};
type LoginState = {
  login: string,
  password: string,
  error: ?{
    status: number,
    message: string
  }
};
class Login extends Component<LoginProps, LoginState> {
  state = {
    login: '',
    password: '',
    error: null
  }
  sendData = { abort: () => null }

  componentWillUnmount() {
    this.sendData.abort();
  }

  handleLoginChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({login: event.currentTarget.value.trim()});
  }

  handlePasswordChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({password: event.currentTarget.value.trim()});
  }

  handleSubmit = (event: SyntheticEvent<HTMLInputElement>) => {
    event.preventDefault();
    this.setState({error: null});
    this.sendData = request.post(API_URL);
    let loginInfo = {username: this.state.login, password: this.state.password};
    return this.sendData.send(loginInfo).then(res => {
      return this.props.handleToken(res.body.token);
    }).catch(err => {
      // Checking if this is an HTTP error
      if (err.status && err.response) {
        if (err.status === 401) {
          err.message = 'Access denied'
        }
        this.setState({error: err});
      } else {
        throw err
      }
    })
  }

  render() {
    return (
      <div className="container">
        <div className="row text-left h-100 main">
          <div className="col-sm-12 border rounded">
            <h1 className="text-center">Login</h1>
            {this.state.error &&
              <p className="error-message">{this.state.error.message}</p>
            }
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="loginInput">Login</label>
                <input id="loginInput" className="form-control" type="text" value={this.state.login} onChange={this.handleLoginChange} />
              </div>
              <div className="form-group">
                <label htmlFor="passwordInput">Password</label>
                <input id="passwordInput" className="form-control" type="password" value={this.state.password} onChange={this.handlePasswordChange} />
              </div>
              <input className="btn btn-primary" type="submit" value="Submit" />
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default Login;
