import React from 'react';
import { IonIcon } from "@ionic/react";
import { logoGithub, mailOutline } from "ionicons/icons";
import ifremer from '../../../img/logo/logo_ifremer_blanc_267_250.webp';

import './styles.css';

export const Footer: React.FC = () => (
    <footer>
        <div className="ifremer">
            <p>Powered by</p>
            <img src={ifremer} alt="Ifremer" />
        </div>

        <div className="links">
            <a className="link" href="https://github.com/Project-OSmOSE/osmose-app">
                <IonIcon icon={logoGithub}></IonIcon>
                Github
            </a>
            <a className="link" href="mailto:contact-osmose@ensta-bretagne.fr" title="Contact OSmOSE">
                <IonIcon icon={mailOutline}></IonIcon>
                contact-osmose@ensta-bretagne.fr
            </a>
        </div>

        <div className="license">
            <p>OSmOSE <a href="/app/humans.txt" title="Full credits">credits</a>,</p>
            <p>GPL-3.0, 2021</p>
        </div>
    </footer>
);
