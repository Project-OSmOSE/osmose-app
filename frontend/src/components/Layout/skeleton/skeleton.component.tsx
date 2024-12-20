import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { IonButton, IonIcon } from "@ionic/react";
import styles from './skeleton.module.scss';
import { openOutline } from 'ionicons/icons';
import { useAppDispatch } from '@/service/app';
import { logout } from '@/service/auth';
import { useGetCurrentUserQuery } from '@/service/user';
import logo from '/app/images/ode_logo_192x192.png';
import { OsmoseBarComponent } from '../osmose-bar/osmose-bar.component';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {

  const dispatch = useAppDispatch();

  const { data: currentUser } = useGetCurrentUserQuery();

  return (
    <div className={ styles.page }>

      <div className={ styles.nav }>

        <div className={ styles.title }>
          <img src={ logo } alt="APLOSE"/>
          <h1>APLOSE</h1>
        </div>

        <div className={ styles.links }>
          <a href="/app/">Back to Home</a>
          <Link to="/annotation-campaign">Annotation campaigns</Link>
          { currentUser?.is_staff && <Link to="/datasets">Datasets</Link> }
          { currentUser?.is_staff &&
              <a href="/backend/admin" target="_blank">Admin <IonIcon icon={ openOutline }/></a> }

        </div>

        <IonButton color={ "medium" }
                   onClick={ () => dispatch(logout()) }>
          Logout
        </IonButton>
      </div>

      <div>
        { children }
      </div>

      <OsmoseBarComponent/>
    </div>
  )
}
