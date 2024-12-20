import React, { ReactNode, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import { Header } from './Header';
import { Footer } from './Footer';
import './styles.css';

export { AploseSkeleton } from './skeleton/skeleton.component'
export { OsmoseBarComponent } from './osmose-bar/osmose-bar.component'

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
      <Footer/>
    </div>
  );
}
