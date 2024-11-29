import React, { ReactNode, useEffect } from 'react';
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { Link } from 'react-router-dom';
import { IonButton, IonIcon } from "@ionic/react";
import './skeleton.component.css';
import { openOutline } from 'ionicons/icons';
import { useAppDispatch, useAppSelector } from '@/slices/app.ts';
import { logout } from '@/service/auth';
import { selectCurrentUser, useGetCurrentUserMutation } from '@/service/user';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {

  const currentUser = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const [ getCurrentUser ] = useGetCurrentUserMutation();

  useEffect(() => {
    if (currentUser) return;
    getCurrentUser().unwrap();
  }, [])

  return (
    <div id="aplose-skeleton-component">
      <h1>APLOSE</h1>

      <div id="nav" className="border rounded">
        <a href="/app/">Back to Home</a>
        { currentUser?.is_staff && <Link to="/datasets">Datasets</Link> }
        <Link to="/annotation-campaign">Annotation campaigns</Link>
        { currentUser?.is_staff && <a href="/backend/admin" target="_blank">Admin <IonIcon icon={ openOutline }/></a> }
        <br/>
        <IonButton color={ "medium" }
                   onClick={ () => dispatch(logout()) }>
          Logout
        </IonButton>
      </div>

      <div id="content" className="border rounded">
        { children }
      </div>

      <OsmoseBarComponent/>
    </div>
  )
}
