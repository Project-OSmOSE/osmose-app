import { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';

import { Login } from './pages/Login.tsx';
import DatasetList from './pages/DatasetList.tsx';
import AnnotationCampaignList from './pages/AnnotationCampaignList.tsx';
import AnnotationCampaignDetail from './pages/AnnotationCampaignDetail.tsx';
import EditAnnotationCampaign from './pages/EditAnnotationCampaign.tsx';
import CreateAnnotationCampaign from './pages/CreateAnnotationCampaign.tsx';
import AnnotationTaskList from './pages/AnnotationTaskList.tsx';
import AudioAnnotator from './AudioAnnotator/AudioAnnotator';

import './css/fontawesome/css/fontawesome-5.15.4.min.css';
import './css/fontawesome/css/solid.min.css'
import './css/fontawesome/css/regular.min.css'
import './css/materialize.min.css';
import './css/bootstrap-4.1.3.min.css';

import './css/app.css';
import { AuthService } from "./services/AuthService.tsx";

const Navbar = () => (
  <div className="col-sm-2 border rounded">
    <ul>
      <li><a href="/..">Back to main site</a></li>
      <li><Link to="/datasets">Datasets</Link></li>
      <li><Link to="/annotation-campaigns">Annotation campaigns</Link></li>
      <br/>
      <li>
        <button className="btn btn-secondary" onClick={ () => AuthService.shared.logout() }>Logout</button>
      </li>
    </ul>
  </div>
);

const OdeApp = () => (
  <div className="px-5 mx-5">
    <div className="row text-center">
      <div className="col-sm-12"><h1>APLOSE</h1></div>
    </div>
    <div className="row text-left h-100 main">
      <Navbar/>
      <Switch>
        <Route path='/' render={ () => <DatasetList/> }/>

        <Route exact path='/datasets'><DatasetList/></Route>
        <Route exact path='/annotation-campaigns'><AnnotationCampaignList/></Route>

        <Route path='/create-annotation-campaign'
               render={ route_props => <CreateAnnotationCampaign { ...route_props } /> }/>
        <Route path='/annotation_tasks/:campaign_id'
               render={ route_props => <AnnotationTaskList { ...route_props } /> }/>
        <Route path='/annotation_campaign/:campaign_id/edit'
               render={ route_props => <EditAnnotationCampaign { ...route_props } /> }/>
        <Route path='/annotation_campaign/:campaign_id'
               render={ route_props => <AnnotationCampaignDetail { ...route_props } /> }/>
      </Switch>
    </div>
  </div>
);

export const App: FC = () => {

  const [token, setToken] = useState<string | undefined>();
  const history = useHistory();

  useEffect(() => {
    const authSub = AuthService.shared.tokenUpdate.subscribe(newToken => {
      setToken(newToken)
      if (newToken) return;
      history.push('/');
    });
    AuthService.shared.checkToken();

    return () => {
      authSub.unsubscribe();
    }
  })

  if (!token) return (<Login></Login>);
  return (
    <Router basename='/app'>
      <Switch>
        <Route path='/audio-annotator/:annotation_task_id'
               render={ route_props => <AudioAnnotator { ...route_props } /> }/>
        <Route><OdeApp/></Route>
      </Switch>
    </Router>
  );
}

export default App;
