import React from 'react';
import { IonIcon } from "@ionic/react";
import { logoGithub, mailOutline } from "ionicons/icons";

import styles from './styles.module.scss';

export const Footer: React.FC = () => (
  <footer className={ styles.footer }>
    <div className={ styles.linksGroup }>
      <a className={ styles.link } href="https://github.com/Project-OSmOSE">
        <IonIcon icon={ logoGithub }></IonIcon>
        Github
      </a>
      <a className={ styles.link } href="mailto:contact-osmose@ensta-bretagne.fr" title="Contact OSmOSE">
        <IonIcon icon={ mailOutline }></IonIcon>
        contact-osmose@ensta-bretagne.fr
      </a>
    </div>

    <div className={ styles.license }>
      <p>OSmOSE <a href="/humans.txt" title="Full credits">credits</a>,</p>
      <p>GPL-3.0, 2021</p>
    </div>
  </footer>
);
