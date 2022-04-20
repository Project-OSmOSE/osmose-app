import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';
import logo from '../../../img/logo/logo_seul_couleur.png';

export const Header: React.FC = () => {
  return (
<header className="Navigation">
  <nav className="navbar navbar-expand-md navbar-light bg-light py-0" role="navigation">

    <Link id="to-home" className="navbar-brand logo d-flex align-items-center navigation-link" to="/">
      <img src={logo} className="d-inline-block align-top" alt="" />
      <span>OSmOSE</span>
    </Link>

    <button className="navbar-toggler mx-sm-4 mr-md-2" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav"
      aria-controls="main-nav" aria-expanded="false">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div id="main-nav" className="collapse navbar-collapse justify-content-end align-self-stretch">
      <ul className="navbar-nav text-center">
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/project" className="nav-link navigation-link">Meet</Link>
        </li>
        <li className="mx-5 mx-md-4 nav-item d-none pipe">
          <span className="nav-link navigation-link">|</span>
        </li>
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/explore" className="nav-link navigation-link">Explore</Link>
        </li>
      </ul>
    </div>

  </nav>
</header>
  );
}
