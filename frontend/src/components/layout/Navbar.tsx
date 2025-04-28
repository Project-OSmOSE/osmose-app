import React, { Fragment, useCallback, useState } from 'react';
import styles from './layout.module.scss';
import logo from '/images/ode_logo_192x192.png';
import { IonButton, IonIcon } from '@ionic/react';
import { logout } from '@/service/auth';
import { useAppDispatch } from '@/service/app.ts';
import { UserAPI } from '@/service/user';
import { DocumentationButton } from "@/components/ui";
import { closeOutline, menuOutline } from "ionicons/icons";
import { Link } from "@/components/ui/Link.tsx";

export const Navbar: React.FC<{ className?: string }> = ({ className }) => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  const { data: currentUser } = UserAPI.useGetCurrentQuery();
  const dispatch = useAppDispatch();

  const toggleOpening = useCallback(() => {
    setIsOpen(previous => !previous);
  }, [ setIsOpen ])

  const close = useCallback(() => setIsOpen(false), [ setIsOpen ])

  return (
    <div className={ [ styles.navbar, isOpen ? styles.opened : styles.closed, className ].join(' ') }>

      <div className={ styles.title }>
        <Link appPath='/annotation-campaign' onClick={ close }>
          <img src={ logo } alt="APLOSE"/>
          <h1>APLOSE</h1>
        </Link>

        <IonButton fill='outline' color='medium'
                   className={ styles.toggle } onClick={ toggleOpening }>
          <IonIcon icon={ isOpen ? closeOutline : menuOutline } slot='icon-only'/>
        </IonButton>
      </div>

      <div className={ styles.navContent }>

        <div className={ styles.links }>
          <Link appPath='/annotation-campaign' onClick={ close }>
            Annotation campaigns
          </Link>
          { (currentUser?.is_staff || currentUser?.is_superuser) && <Fragment>
              <Link appPath='/dataset' onClick={ close }>Datasets</Link>
          </Fragment> }
        </div>

        { (currentUser?.is_staff || currentUser?.is_superuser) && <Fragment>
            <Link href="/backend/admin" target="_blank" color='medium'>Admin</Link>
        </Fragment> }

        <DocumentationButton/>

        { currentUser?.is_superuser && <Link appPath='/admin/sql' color='medium' onClick={ close }>SQL query</Link> }

        <Link appPath='/account' color='medium' onClick={ close }>Account</Link>

        <IonButton className={ styles.logoutButton }
                   color={ "medium" }
                   onClick={ () => {
                     dispatch(logout())
                     dispatch(UserAPI.util.invalidateTags([ { type: 'User', id: 'CURRENT' } ]))
                   } }>
          Logout
        </IonButton>
      </div>
    </div>)
}