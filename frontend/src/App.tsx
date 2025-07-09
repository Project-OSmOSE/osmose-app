import React, { Fragment } from 'react';
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './css/bootstrap-4.1.3.min.css';
import '@ionic/react/css/core.css';
import './css/ionic-override.css';
import './css/annotation-colors.css';
import './css/app.css';

import { IonApp, setupIonicReact } from '@ionic/react';

import { AppStore, useAppSelector } from "@/service/app";

import { DatasetList } from '@/view/dataset';
import { AnnotationCampaignDetail, AnnotationCampaignList } from "@/view/campaign";
import { AnnotationCampaignDetailInfo, AnnotationCampaignPhaseDetail } from "@/view/campaign/details";
import { Home } from "@/view/home/Home.tsx";
import { Account, Login } from '@/view/auth';
import { AnnotatorPage } from "@/view/annotator/AnnotatorPage.tsx";
import { useLoadEventService } from "@/service/events";
import { CreateCampaign } from "@/view/campaign/create/CreateCampaign.tsx";
import { EditAnnotators } from "@/view/campaign/edit/EditAnnotators.tsx";
import { ImportAnnotations } from "@/view/campaign/edit/ImportAnnotations";
import { AlertProvider } from "@/service/ui/alert";
import { SqlQuery } from "@/view/admin/sql/SqlQuery.tsx";
import { AploseSkeleton } from "@/components/layout";
import { selectCurrentUser } from "@/service/api/user.ts";
import { selectIsConnected } from "@/service/slices/auth.ts";
import { ReactFlowProvider } from "@xyflow/react";
import { OntologyPage, OntologyTab } from "@/features/ontology";


setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

export const App: React.FC = () => (
  <Provider store={ AppStore }>
    <AlertProvider>
      <ReactFlowProvider>
        <IonApp>
          <BrowserRouter basename='/app/'>
            <AppContent/>
          </BrowserRouter>
        </IonApp>
      </ReactFlowProvider>
    </AlertProvider>
  </Provider>
)

const AppContent: React.FC = () => {
  useLoadEventService();

  const isConnected = useAppSelector(selectIsConnected)
  const currentUser = useAppSelector(selectCurrentUser)
  const from = useLocation()

  return (
    <Routes>

      <Route index element={ <Home/> }/>
      <Route path='login' element={ <Login/> }/>

      { isConnected && <Fragment>

          <Route path='dataset' element={ <AploseSkeleton/> }>
              <Route index element={ <DatasetList/> }/>
          </Route>

          <Route path='annotation-campaign' element={ <AploseSkeleton/> }>
              <Route index element={ <AnnotationCampaignList/> }/>
              <Route path='new' element={ <CreateCampaign/> }/>

              <Route path=':campaignID'>
                  <Route element={ <AnnotationCampaignDetail/> }>
                      <Route index element={ <AnnotationCampaignDetailInfo/> }/>
                      <Route path='phase/:phaseID' element={ <AnnotationCampaignPhaseDetail/> }/>
                  </Route>

                  <Route path='phase/:phaseID'>
                      <Route path='edit-annotators' element={ <EditAnnotators/> }/>
                      <Route path='import-annotations' element={ <ImportAnnotations/> }/>
                  </Route>
              </Route>
          </Route>

          <Route path='annotation-campaign/:campaignID/phase/:phaseID/file/:fileID'
                 element={ <AnnotatorPage/> }/>

          <Route element={ <AploseSkeleton/> }>
              <Route path='account' element={ <Account/> }/>
          </Route>

        { currentUser?.is_superuser &&
            <Route path='admin' element={ <AploseSkeleton/> }>
                <Route path='sql' element={ <SqlQuery/> }/>
                <Route path='ontology' element={ <OntologyPage/> }>
                    <Route path='source'>
                        <Route index element={ <OntologyTab/> }/>
                        <Route path=':id' element={ <OntologyTab/> }/>
                    </Route>
                    <Route path='sound'>
                        <Route index element={ <OntologyTab/> }/>
                        <Route path=':id' element={ <OntologyTab/> }/>
                    </Route>
                </Route>
            </Route>
        }

          <Route path="*" element={ <Navigate to="/annotation-campaign" replace state={ { from } }/> }/>
      </Fragment> }

      <Route path="*" element={ <Navigate to="/login" replace state={ { from } }/> }/>
    </Routes>
  )
}

export default App;
