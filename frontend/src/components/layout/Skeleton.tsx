import React from 'react';
import { Footer, Navbar } from "@/components/layout";
import styles from './layout.module.scss';
import { Outlet } from "react-router-dom";

export const AploseSkeleton: React.FC = () => (
  <div className={ styles.skeleton }>

    <Navbar className={ styles.navbar }/>

    <div className={ styles.content }>
      <Outlet/>
    </div>

    <Footer/>
  </div>
)
