"use client";

import { Component, FormEvent, SyntheticEvent } from "react";
import { request } from "./utils/request";

const API_URL = "/api/token/";

type LoginProps = {
  handleToken: (token: string) => void;
};
type LoginState = {
  login: string;
  password: string;
  error?: {
    status: number;
    message: string;
  };
};
class Login extends Component<LoginProps, LoginState> {
  state: LoginState = {
    login: "",
    password: "",
    error: undefined,
  };
  sendData: any;

  componentWillUnmount() {
    // this.sendData.abort();
  }

  handleLoginChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ login: event.currentTarget.value.trim() });
  };

  handlePasswordChange = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ password: event.currentTarget.value.trim() });
  };

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({ error: undefined });
    const loginInfo = {
      username: this.state.login,
      password: this.state.password,
    };
    this.sendData = request.post(API_URL, undefined, loginInfo);
    return this.sendData
      .then((res: any) => {
        return this.props.handleToken(res.body.access);
      })
      .catch((err: any) => {
        // Checking if this is an HTTP error
        if (err.status) {
          if (err.status === 401) {
            err.message = "Access denied";
          }
          this.setState({ error: err });
        } else {
          throw err;
        }
      });
  };

  render() {
    return (
      <div className="container">
        <div className="row text-left h-100 main">
          <div className="col-sm-12 border rounded">
            <h1 className="text-center">Login</h1>
            {this.state.error && (
              <p className="error-message">{this.state.error.message}</p>
            )}
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="loginInput">Login</label>
                <input
                  id="loginInput"
                  className="form-control"
                  type="text"
                  value={this.state.login}
                  onChange={this.handleLoginChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="passwordInput">Password</label>
                <input
                  id="passwordInput"
                  className="form-control"
                  type="password"
                  value={this.state.password}
                  onChange={this.handlePasswordChange}
                />
              </div>
              <input className="btn btn-primary" type="submit" value="Submit" />
            </form>
          </div>
        </div>
        <a href="/..">Back to main site</a>
      </div>
    );
  }
}

export default Login;
