import React, { ReactNode } from 'react';
import styles from './skeleton.module.scss';
import { OsmoseBarComponent } from '../osmose-bar/osmose-bar.component';
import { Navbar } from '../Navbar.tsx';

export const AploseSkeleton: React.FC<{ children?: ReactNode }> = ({ children }) => {


  return (
    <div className={ styles.page }>

      <Navbar/>

      <div>
        { children }
      </div>

      <OsmoseBarComponent/>
    </div>
  )
}
