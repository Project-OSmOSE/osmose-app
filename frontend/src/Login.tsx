import { ChangeEvent, Component, FormEvent } from 'react';
import request, { SuperAgentRequest } from 'superagent';

const API_URL = '/api/token/';

type LoginProps = {
  handleToken: (token: string) => void
};
type LoginState = {
  login: string,
  password: string,
  error?: {
    status: number,
    message: string
  }
};
class Login extends Component<LoginProps, LoginState> {
  state: LoginState = {
    login: '',
    password: '',
    error: undefined
  }
  sendData?: SuperAgentRequest;

  componentWillUnmount() {
    if (this.sendData) {
      this.sendData.abort();
    }
  }

  handleLoginChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({login: event.currentTarget.value.trim()});
  }

  handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.setState({password: event.currentTarget.value.trim()});
  }

  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.setState({error: undefined});
    this.sendData = request.post(API_URL);
    let loginInfo = {username: this.state.login, password: this.state.password};
    return this.sendData.send(loginInfo).then(res => {
      return this.props.handleToken(res.body.access);
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
        <a href="/..">Back to main site</a>
      </div>
    )
  }
}

export default Login;
