import React, { ReactNode, useEffect } from 'react';
import { useLocation } from "react-router-dom";

import './styles.css';
import { Footer, Header } from "@/components/new-layout";

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
