import React, { ReactNode } from 'react';
import { Navbar, OSmOSEFooter } from "@/components/new-layout";
import styles from './layout.module.scss';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div className={ styles.skeleton }>

    <Navbar className={ styles.navbar }/>

    <div className={ styles.content }>
      { children }
    </div>

    <OSmOSEFooter/>
  </div>
)
