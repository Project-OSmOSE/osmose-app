import React, { useState } from 'react';
import styles from './layout.module.scss';
import logo from '/app/images/ode_logo_192x192.png';
import { IoCloseOutline, IoMenuOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { IonButton, IonIcon } from '@ionic/react';
import { openOutline } from 'ionicons/icons';
import { logout } from '@/service/auth';
import { useAppDispatch } from '@/service/app.ts';
import { useGetCurrentUserQuery } from '@/service/user';

export const Navbar: React.FC = () => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  const { data: currentUser } = useGetCurrentUserQuery();
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
        <a href="/app/">Back to Home</a>
        <Link to="/annotation-campaign">Annotation campaigns</Link>
        { currentUser?.is_staff && <Link to="/datasets">Datasets</Link> }
        { currentUser?.is_staff &&
            <a href="/backend/admin" target="_blank">Admin <IonIcon icon={ openOutline }/></a> }

      </div>

      <IonButton className={ styles.logoutButton }
                 color={ "medium" }
                 onClick={ () => dispatch(logout()) }>
        Logout
      </IonButton>
    </div>)
}