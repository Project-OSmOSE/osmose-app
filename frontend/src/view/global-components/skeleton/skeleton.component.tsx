import React, { ReactNode, useEffect, useState } from 'react';
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { Link } from 'react-router-dom';
import { IonButton, IonIcon } from "@ionic/react";
import './skeleton.component.css';
import { User, useUsersAPI } from "@/services/api";
import { openOutline } from 'ionicons/icons';
import { useAppDispatch } from '@/slices/app.ts';
import { logout } from '@/service/auth';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const userAPI = useUsersAPI();

  const dispatch = useAppDispatch();

  const [ user, setUser ] = useState<User | undefined>();
  useEffect(() => {
    userAPI.self().then(setUser);
    return () => {
      userAPI.abort();
    }
  }, [])

  return (
    <div id="aplose-skeleton-component">
      <h1>APLOSE</h1>

      <div id="nav" className="border rounded">
        <a href="/app/">Back to Home</a>
        { user?.is_staff && <Link to="/datasets">Datasets</Link> }
        <Link to="/annotation-campaign">Annotation campaigns</Link>
        { user?.is_staff && <a href="/backend/admin" target="_blank">Admin <IonIcon icon={ openOutline }/></a> }
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
