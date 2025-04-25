import React, { Fragment } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';

import './css/bootstrap-4.1.3.min.css';
import '@ionic/react/css/core.css';
import './css/ionic-override.css';
import './css/annotation-colors.css';
import './css/app.css';

import { IonApp, setupIonicReact } from '@ionic/react';

import { Provider } from "react-redux";
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
import { selectIsConnected } from "@/service/auth";
import { useGetCurrentUserQuery } from "@/service/user";
import { AploseSkeleton } from "@/components/layout";


setupIonicReact({
  mode: 'md',
  spinner: 'crescent',
});

export const App: React.FC = () => (
  <Provider store={ AppStore }>
    <AlertProvider>
      <IonApp>
        <BrowserRouter basename='/app'>
          <AppContent/>
        </BrowserRouter>
      </IonApp>
    </AlertProvider>
  </Provider>
)

const AppContent: React.FC = () => {
  useLoadEventService();

  const isConnected = useAppSelector(selectIsConnected);
  const { data: currentUser } = useGetCurrentUserQuery();
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
              <Route path='create' element={ <CreateCampaign/> }/>

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

        { currentUser?.is_superuser && <Route path='sql' element={ <SqlQuery/> }/> }
          <Route path='account' element={ <Account/> }/>

          <Route path="*" element={ <Navigate to="/annotation-campaign" replace state={ { from } }/> }/>
      </Fragment>
      }

      <Route path="*" element={ <Navigate to="/login" replace state={ { from } }/> }/>
    </Routes>
  )
}

export default App;
