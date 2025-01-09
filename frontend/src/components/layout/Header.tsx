import React, { useState } from "react";
import styles from './layout.module.scss'
import logo from "/images/ode_logo_192x192.png";
import { DocumentationButton } from "@/components/Buttons/Documentation-button.tsx";
import { Link } from "@/components/ui";
import { useAppSelector } from "@/service/app.ts";
import { selectIsConnected } from "@/service/auth";
import { IonButton, IonIcon } from "@ionic/react";
import { closeOutline, menuOutline } from "ionicons/icons";
import { useLocation } from "react-router-dom";

export const Header: React.FC = () => {

  const isConnected = useAppSelector(selectIsConnected);

  const location = useLocation();

  const [ isOpen, setIsOpen ] = useState<boolean>(false);

  function toggleOpening() {
    setIsOpen(previous => !previous);
  }

  return (
    <header className={ [ styles.header, isOpen ? styles.opened : styles.closed ].join(' ') }>
      <div className={ styles.title }>
        <img src={ logo } alt="OSmOSE"/>
        <h1>APLOSE</h1>
      </div>

      <IonButton fill='outline' color='medium'
                 className={ styles.toggle } onClick={ toggleOpening }>
        <IonIcon icon={ isOpen ? closeOutline : menuOutline} slot='icon-only'/>
      </IonButton>

      <div className={ styles.links }>
        <DocumentationButton/>

        { location.pathname === '/' && <Link href={ isConnected ? '/app/aplose' : '/app/login' } size='large'>{ isConnected ? 'APLOSE' : 'Login' }</Link>}
        { location.pathname !== '/' && <Link href='/app/' size='large'>Home</Link>}

        <Link href='/' size='large'>OSmOSE</Link>

      </div>
    </header>
  )
}