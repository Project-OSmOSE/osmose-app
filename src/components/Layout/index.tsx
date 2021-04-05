import React from 'react';
import { Footer } from '../Footer';
import { Header } from '../Header';

import './styles.css';

export const Layout: React.FC = ({ children }) => {
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
