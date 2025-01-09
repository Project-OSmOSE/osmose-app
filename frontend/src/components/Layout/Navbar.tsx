import React, { Fragment, useState } from 'react';
import styles from './layout.module.scss';
import logo from '/images/ode_logo_192x192.png';
import { IoCloseOutline, IoMenuOutline } from 'react-icons/io5';
import { IonButton } from '@ionic/react';
import { logout } from '@/service/auth';
import { useAppDispatch } from '@/service/app.ts';
import { useGetCurrentUserQuery } from '@/service/user';
import { DocumentationButton } from "@/components/Buttons/Documentation-button.tsx";
import { Link } from "@/components/ui";

export const Navbar: React.FC = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  const { data: currentUser } = useGetCurrentUserQuery(undefined, { refetchOnMountOrArgChange: true });
  const dispatch = useAppDispatch();

  return (
    <div className={ [ styles.navbar, isOpen ? styles.open : styles.closed ].join(' ') }>

      <div className={ styles.title }>
        <img src={ logo } alt="APLOSE"/>
        <h1>APLOSE</h1>

        { !isOpen && <IoMenuOutline className={ styles.dropdownIcon } onClick={ () => setIsOpen(true) }/> }
        { isOpen && <IoCloseOutline className={ styles.dropdownIcon } onClick={ () => setIsOpen(false) }/> }
        {/*  TODO: make the nav part as dropdown > add a chevron up/down depending on if its open or not */ }
      </div>

      <div className={ styles.links }>
        <Link href="/app/">Back to Home</Link>
        <Link href="annotation-campaign">Annotation campaigns</Link>
        { currentUser?.is_staff && <Fragment>
            <Link href="datasets">Datasets</Link>
            <Link href="/backend/admin" target="_blank">Admin</Link>
        </Fragment> }
      </div>

      <DocumentationButton/>

      <IonButton className={ styles.logoutButton }
                 color={ "medium" }
                 onClick={ () => dispatch(logout()) }>
        Logout
      </IonButton>
    </div>)
}