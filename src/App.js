// @flow
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Login from './Login';
import DatasetList from './DatasetList';
import AnnotationCampaignList from './AnnotationCampaignList';
import AnnotationCampaignDetail from './AnnotationCampaignDetail';
import CreateAnnotationCampaign from './CreateAnnotationCampaign';
import AnnotationTaskList from './AnnotationTaskList';
import LegacyAudioAnnotator from './LegacyAudioAnnotator';
import AudioAnnotator from './AudioAnnotator/AudioAnnotator';

import './css/bootstrap-4.1.3.min.css';
import './css/app.css';

type NavbarProps = {
  logout: (event: SyntheticEvent<HTMLInputElement>) => void
};
const Navbar = (props: NavbarProps) => (
  <div className="col-sm-3 border rounded">
    <ul>
      <li><Link to="/datasets">Datasets</Link></li>
      <li><Link to="/annotation-campaigns">Annotation campaigns</Link></li>
      <br />
      <li><button className="btn btn-secondary" onClick={props.logout}>Logout</button></li>
    </ul>
  </div>
);

type OdeAppProps = {
  app_token: string,
  logout: (event: SyntheticEvent<HTMLInputElement>) => void
};
const OdeApp = (props: OdeAppProps) => (
  <div className="container">
    <div className="row text-center">
      <div className="col-sm-12"><h1>APLOSE</h1></div>
    </div>
    <div className="row text-left h-100 main">
      <Navbar logout={props.logout}/>
      <Switch>
        <Route exact path='/' render={() => <DatasetList app_token={props.app_token} />} />
        <Route path='/datasets' render={() => <DatasetList app_token={props.app_token} />} />
        <Route path='/annotation-campaigns' render={() => <AnnotationCampaignList app_token={props.app_token} />} />
        <Route path='/create-annotation-campaign' render={route_props => <CreateAnnotationCampaign app_token={props.app_token} {...route_props} />} />
        <Route path='/annotation_tasks/:campaign_id' render={route_props => <AnnotationTaskList app_token={props.app_token} {...route_props} />} />
        <Route path='/annotation_campaign/:campaign_id' render={route_props => <AnnotationCampaignDetail app_token={props.app_token} {...route_props} />} />
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
    document.cookie = 'token=' + token + ';max-age=2592000;path=/';
  }

  // The history parameter should be the react-router history
  logout = (history: Array<string>) => {
    document.cookie = 'token=;max-age=0';
    this.setState({
      app_token: ''
    });
    history.push('/');
  }

  render() {
    if (this.state.app_token) {
      return (
        <Router>
          <Switch>
            <Route path='/audio-annotator/legacy/:annotation_task_id' render={route_props => <LegacyAudioAnnotator app_token={this.state.app_token} {...route_props} />} />
            <Route path='/audio-annotator/:annotation_task_id' render={route_props => <AudioAnnotator app_token={this.state.app_token} {...route_props} />} />
            <Route render={route_props => <OdeApp app_token={this.state.app_token} logout={() => this.logout(route_props.history)} />} />
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
