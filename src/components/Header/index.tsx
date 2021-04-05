import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';

export const Header: React.FC = () => {
  return (
    <header>
      <h1>OSmOSE</h1>
      <nav>
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/project'>Project</Link></li>
          <li><Link to='/people'>People</Link></li>
        </ul>
      </nav>
    </header>
  );
}
