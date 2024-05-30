import { FC, ReactNode, useEffect } from 'react';
import { BrowserRouter as Router, Link, Redirect, Route, Switch } from 'react-router-dom';


import { Login } from "./view/login.page.tsx";

import { DatasetList } from "./view/dataset-list";
import { AnnotationCampaignList } from "./view/annotation-campaign-list.page.tsx";
import { AnnotationCampaignDetail } from "./view/annotation-campaign-detail.page.tsx";
import { CreateAnnotationCampaign, EditAnnotationCampaign } from "./view/annotation-campaign-update";
import { AnnotationTaskList } from "./view/annotation-task-list.page.tsx";
import { AuthenticatedRoute } from "./view/global-components";
import { ProvideAuth, useAuthService } from "./services/auth";

import './css/fontawesome/css/fontawesome-5.15.4.min.css';
import './css/fontawesome/css/solid.min.css'
import './css/fontawesome/css/regular.min.css'
import './css/materialize.min.css';
import './css/bootstrap-4.1.3.min.css';
import '@ionic/react/css/core.css';
import './css/ionic-override.css';
import './css/app.css';
import { AudioAnnotator } from "./view/audio-annotator/audio-annotator.page.tsx";
import { ProvideAnnotator } from "./services/annotator/annotator.provider.tsx";
import { Home } from "./view/Aplose_presentation/aplose.tsx";
import { Layout } from "./components/Layout";
import { IonApp, setupIonicReact } from '@ionic/react';

setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

const AploseSkeleton: FC<{ children?: ReactNode }> = ({ children }) => {
  const auth = useAuthService();
  return (
    <div className="px-5 mx-5">
      <div className="row text-center">
        <div className="col-sm-12"><h1>APLOSE</h1></div>
      </div>
      <div className="row text-left h-100 main">
        <div className="col-sm-2 border rounded">
          <ul>
            <li><a href="/">Back to Home</a></li>
            <li><Link to="/datasets">Datasets</Link></li>
            <li><Link to="/annotation-campaigns">Annotation campaigns</Link></li>
            <br/>
            <li>
              <button className="btn btn-secondary" onClick={ auth.logout.bind(auth) }>Logout</button>
            </li>
          </ul>
        </div>

        { children }
      </div>
    </div>
  )
}

export const App: FC = () => {

  useEffect(() => {
    console.info(`Version: ${ import.meta.env.VITE_GIT_TAG }`)
  }, []);

  return (
    <ProvideAuth>
      <IonApp>
        <Router basename='/app'>
          <Switch>
            <Route exact path="/login"><Login/></Route>
            <Route exact path='/'> <Layout> <Home/> </Layout></Route>
            <AuthenticatedRoute exact path='/audio-annotator/:id'>
              <ProvideAnnotator>
                <AudioAnnotator/>
              </ProvideAnnotator>
            </AuthenticatedRoute>

            <AploseSkeleton>
              <Switch>
                <AuthenticatedRoute exact path='/datasets'><DatasetList/></AuthenticatedRoute>
                <AuthenticatedRoute exact path='/annotation-campaigns'><AnnotationCampaignList/></AuthenticatedRoute>
                <AuthenticatedRoute exact
                                    path='/create-annotation-campaign'><CreateAnnotationCampaign/></AuthenticatedRoute>
                <AuthenticatedRoute exact
                                    path='/annotation_campaign/:id'><AnnotationCampaignDetail/></AuthenticatedRoute>
                <AuthenticatedRoute exact
                                    path='/annotation_campaign/:id/edit'><EditAnnotationCampaign/></AuthenticatedRoute>
                <AuthenticatedRoute exact path='/annotation_tasks/:id'><AnnotationTaskList/></AuthenticatedRoute>
                <Route path="**"><Redirect to="/annotation-campaigns"/></Route>
              </Switch>
            </AploseSkeleton>
          </Switch>
        </Router>
      </IonApp>
    </ProvideAuth>
  )
}

export default App;
