import React, { ReactNode } from 'react';
import { useAuthService } from "@/services/auth.ts";
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";
import { Link } from 'react-router-dom';
import { IonButton } from "@ionic/react";
import './skeleton.component.css';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const auth = useAuthService();
  return (
    <div id="aplose-skeleton-component">
      <h1>APLOSE</h1>

      <div id="nav" className="border rounded">
        <a href="/app/">Back to Home</a>
        <Link to="/datasets">Datasets</Link>
        <Link to="/annotation-campaign">Annotation campaigns</Link>
        <br/>
        <IonButton color={ "medium" }
                   onClick={ auth.logout.bind(auth) }>
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
