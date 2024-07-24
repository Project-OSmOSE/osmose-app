import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';
import logo from '../../../img/logo/logo_seul_couleur.png';

export const Header: React.FC = () => {
  let appUrl = 'https://' + window.location.hostname + '/app/';
  return (
<header id="main-header" className='mb-5'>
  <nav className="navbar navbar-expand-md navbar-light bg-light py-0 fixed-top fw-normal" role="navigation">

    <Link id="to-home" className="logo d-flex align-items-center navigation-link navbar-brand text-secondary" to="/">
      <img src={logo} className="d-inline-block align-top" alt="" />
      <span>OSmOSE</span>
    </Link>

    <button className="navbar-toggler mx-sm-4 mr-md-2" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div id="main-nav" className="collapse navbar-collapse justify-content-end align-self-stretch">
      <ul className="navbar-nav text-center">
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/people" className="nav-link navigation-link">Our team</Link>
        </li>
        <li className="mx-5 mx-md-4 nav-item dropdown">
          <p className="nav-link dropdown-toggle m-0" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Research
          </p>
            <ul className="dropdown-menu bg-light">
              <Link to="/projects" className="nav-link navigation-link text-center text-secondary">Projects</Link>
              <Link to="/publications" className="nav-link navigation-link text-center text-secondary">Publications</Link>
              <li className="mx-5 mx-md-4 nav-item">
                <Link to="/trap" className="nav-link navigation-link">Trap</Link>
              </li>
            </ul>
        </li>
        {/*<li className="mx-5 mx-md-4 nav-item dropdown">
          <p className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Science
          </p>
              <ul className="dropdown-menu">
                THIS ONE IS A VALID COMMENT
                <Link to="/explore" className="nav-link navigation-link">Datasets</Link>
                <Link to="/explore" className="nav-link navigation-link">Sounds</Link>
                <a href={appUrl} className="nav-link navigation-link">Annotator</a>
            </ul>
        </li>*/}
        <li className="mx-5 mx-md-4 nav-item">
          <a href={appUrl} className="nav-link navigation-link">Annotator</a>
        </li>
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/news" className="nav-link navigation-link">News</Link>
        </li>

      </ul>
    </div>

  </nav>
</header>
  );
}
