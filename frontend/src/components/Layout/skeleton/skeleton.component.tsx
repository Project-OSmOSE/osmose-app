import React, { ReactNode } from 'react';
import styles from './skeleton.module.scss';
import { Navbar } from '../Navbar.tsx';
import { OSmOSEFooter } from "@/components/new-layout";

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {


  return (
    <div className={ styles.page }>

      <Navbar/>

      <div style={{ display: 'grid', alignItems: 'start'}}>
        { children }
      </div>

      <OSmOSEFooter/>
    </div>
  )
}
