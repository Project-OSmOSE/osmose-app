import React, { Fragment, useState } from 'react';
import styles from './layout.module.scss';
import logo from '/images/ode_logo_192x192.png';
import { IonButton, IonIcon } from '@ionic/react';
import { logout } from '@/service/auth';
import { useAppDispatch } from '@/service/app.ts';
import { useGetCurrentUserQuery } from '@/service/user';
import { DocumentationButton } from "@/components/Buttons/Documentation-button.tsx";
import { Link } from "@/components/ui";
import { closeOutline, menuOutline } from "ionicons/icons";

export const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  const { data: currentUser } = useGetCurrentUserQuery(undefined, { refetchOnMountOrArgChange: true });
  const dispatch = useAppDispatch();

  function toggleOpening() {
    setIsOpen(previous => !previous);
  }

  return (
    <div className={ [ styles.navbar, isOpen ? styles.opened : styles.closed, className ].join(' ') }>

      <div className={ styles.title }>
        <img src={ logo } alt="APLOSE"/>
        <h1>APLOSE</h1>

        <IonButton fill='outline' color='medium'
                   className={ styles.toggle } onClick={ toggleOpening }>
          <IonIcon icon={ isOpen ? closeOutline : menuOutline } slot='icon-only'/>
        </IonButton>
      </div>

      <div className={ styles.navContent }>

        <div className={ styles.links }>
          <Link href="/app/">Back to Home</Link>
          <Link href="/app/annotation-campaign">Annotation campaigns</Link>
          { currentUser?.is_staff && <Fragment>
              <Link href="/app/datasets">Datasets</Link>
              <Link href="/backend/admin" target="_blank">Admin</Link>
          </Fragment> }
        </div>

        <DocumentationButton/>

        <Link href="/app/account" color='medium'>Account</Link>

        <IonButton className={ styles.logoutButton }
                   color={ "medium" }
                   onClick={ () => dispatch(logout()) }>
          Logout
        </IonButton>
      </div>
    </div>)
}