import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import './css/fontawesome/css/fontawesome-5.15.4.min.css';
import './css/fontawesome/css/solid.min.css'
import './css/fontawesome/css/regular.min.css'
import './css/bootstrap-4.1.3.min.css';
import '@ionic/react/css/core.css';
import './css/ionic-override.css';
import './css/annotation-colors.css';
import './css/app.css';

import { IonApp, setupIonicReact } from '@ionic/react';

import { Provider } from "react-redux";
import { AppStore } from "@/service/app";
import { AnnotationCampaignList } from "@/view/campaign/list/annotation-campaign-list.page.tsx";
import { AuthenticatedRoute } from '@/routes';
import { DatasetList } from '@/view/dataset';
import { CampaignDetail } from '@/view/campaign/detail/DetailPage.tsx';
import { AploseSkeleton } from "@/components/layout";
import { Home } from "@/view/home/Home.tsx";
import { Account, Login } from '@/view/auth';
import { AnnotatorPage } from "@/view/annotator/AnnotatorPage.tsx";
import { useLoadEventService } from "@/service/events";
import { CreateCampaign } from "@/view/campaign/create/CreateCampaign.tsx";
import { EditAnnotators } from "@/view/campaign/edit/EditAnnotators.tsx";
import { ImportAnnotations } from "@/view/campaign/edit/ImportAnnotations";
import { AlertProvider } from "@/service/ui/alert";
import { SqlQuery } from "@/view/admin/sql/SqlQuery.tsx";


setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

export const App: React.FC = () => (
  <Provider store={ AppStore }>
    <AlertProvider>
      <AppContent/>
    </AlertProvider>
  </Provider>
)

const AppContent: React.FC = () => {
  useLoadEventService();

  return (
    <IonApp>
      <Router basename='/app'>
        <Switch>
          <Route exact path='/'><Home/></Route>
          <Route exact path="/login"><Login/></Route>

          <AuthenticatedRoute exact
                              path='/annotation-campaign/:campaignID/file/:fileID'><AnnotatorPage/></AuthenticatedRoute>

          <AploseSkeleton>
            <Switch>
              <AuthenticatedRoute exact path='/sql'><SqlQuery/></AuthenticatedRoute>

              <AuthenticatedRoute exact path='/account'><Account/></AuthenticatedRoute>
              <AuthenticatedRoute exact path='/datasets'><DatasetList/></AuthenticatedRoute>

              {/* Annotation campaign */ }
              <AuthenticatedRoute exact path='/annotation-campaign'><AnnotationCampaignList/></AuthenticatedRoute>
              <AuthenticatedRoute exact path='/annotation-campaign/create'><CreateCampaign/></AuthenticatedRoute>
              <AuthenticatedRoute exact path='/annotation-campaign/:id'><CampaignDetail/></AuthenticatedRoute>
              <AuthenticatedRoute exact path='/annotation-campaign/:id/edit-annotators'><EditAnnotators/></AuthenticatedRoute>
              <AuthenticatedRoute exact path='/annotation-campaign/:id/import-annotations'><ImportAnnotations/></AuthenticatedRoute>
              <Route path="**"><Redirect to="/annotation-campaign"/></Route>
            </Switch>
          </AploseSkeleton>
        </Switch>
      </Router>
    </IonApp>
  )
}

export default App;
