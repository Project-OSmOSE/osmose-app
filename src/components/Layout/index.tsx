import React, { useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

import './styles.css';

export const Layout: React.FC = ({ children }) => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  return (
    <div className="layout">
      <Header />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}
