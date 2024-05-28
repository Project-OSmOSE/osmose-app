import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';
import logo from '../../../img/logo/logo_seul_couleur.png';

export const Header: React.FC = () => {
  let appUrl = 'https://' + window.location.hostname + '/app/';
  return (
<header id="main-header" className='mb-5'>
  <nav className="navbar navbar-expand-md navbar-light bg-light py-0 fixed-top fw-normal" role="navigation">

    <Link id="to-home" className="logo d-flex align-items-center navigation-link navbar-brand text-secondary" to="/ApLOSE">
      <img src={logo} className="d-inline-block align-top" alt="" />
      <span>APLOSE</span>
    </Link>

    <button className="navbar-toggler mx-sm-4 mr-md-2" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div id="main-nav" className="collapse navbar-collapse justify-content-end align-self-stretch">
      <ul className="navbar-nav text-center">
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/" className="nav-link navigation-link">Login</Link>
        </li>
        <li className="mx-5 mx-md-4 nav-item">
          <a href={appUrl} className="nav-link navigation-link">OSmOSE</a>
        </li>
      </ul>
    </div>

  </nav>
</header>
  );
}
