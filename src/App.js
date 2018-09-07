// @flow
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Datasets from './Datasets';
import Login from './Login';

import './css/bootstrap-4.1.3.min.css';
import './css/app.css';

const Navbar = () => (
  <div className="col-sm-3 border rounded">
    <ul>
      <li><Link to="/datasets">Datasets</Link></li>
      <li><Link to="/">Annotation campaigns</Link></li>
    </ul>
  </div>
);

type OdeAppProps = {
  app_token: string
};
const OdeApp = (props: OdeAppProps) => (
  <div className="container">
    <div className="row text-center">
      <div className="col-sm-12"><h1>Ocean Data Explorer</h1></div>
    </div>
    <div className="row text-left h-100 main">
      <Navbar />
      <Switch>
        <Route exact path='/' render={() => <Datasets app_token={props.app_token} />} />
        <Route path='/datasets' render={() => <Datasets app_token={props.app_token} />} />
      </Switch>
    </div>
  </div>
);

type AppState = {
  app_token: string
};
class App extends Component<void, AppState> {
  state = {
    app_token: ''
  }

  componentDidMount() {
    if (document.cookie) {
      let tokenItem = document.cookie.split(';').filter((item) => item.includes('token='))[0];
      if (tokenItem) {
        this.setState({
          app_token: tokenItem.split('=').pop()
        })
      }
    }
  }

  handleToken = (token: string) => {
    this.setState({
      app_token: token
    });
    // Cookie is set to expire after 30 days
    document.cookie = 'token=' + token + ';max-age=2592000';
  }

  render() {
    if (this.state.app_token) {
      return (
        <Router>
          <Switch>
            <Route render={() => <OdeApp app_token={this.state.app_token} />} />
          </Switch>
        </Router>
      )
    } else {
      return (
        <Login handleToken={this.handleToken} />
      )
    }
  }
}

export default App;
