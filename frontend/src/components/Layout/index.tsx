import React, { ReactNode, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import { Header } from './Header';
import './styles.css';
import { OSmOSEFooter } from "@/components/new-layout";

export { AploseSkeleton } from './skeleton/skeleton.component'

export const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ pathname ])

  return (
    <div id="layout">
      <Header/>
      <main>
        { children }
      </main>
      <OSmOSEFooter/>
    </div>
  );
}
