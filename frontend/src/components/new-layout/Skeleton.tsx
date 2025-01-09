import React, { ReactNode } from 'react';
import { OSmOSEFooter } from "@/components/new-layout";
import styles from './layout.module.scss';
import { Navbar } from "@/components/Layout/Navbar.tsx";

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div className={ styles.skeleton }>

    <Navbar className={ styles.nav }/>

    <div className={ styles.content }>
      { children }
    </div>

    <OSmOSEFooter/>
  </div>
)
