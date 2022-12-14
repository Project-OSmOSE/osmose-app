import React from 'react';
import { Link } from 'react-router-dom';

import './styles.css';
import logo from '../../../img/logo/logo_seul_couleur.png';

export const Header: React.FC = () => {
  let appUrl = 'https://' + window.location.hostname + '/app/';
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
        <li className="mx-5 mx-md-4 nav-item d-none pipe">
          <span className="nav-link navigation-link">|</span>
        </li>
        <li className="mx-5 mx-md-4 nav-item dropdown">
          <p className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Team
          </p>
            <ul className="dropdown-menu">
              <Link to="/people" className="nav-link navigation-link">People</Link>
              {/*<Link to="/project" className="nav-link navigation-link">Projects</Link>*/}
               <Link to="/publications" className="nav-link navigation-link">Publications</Link>
            </ul>
        </li>
        <li className="mx-5 mx-md-4 nav-item d-none pipe">
          <span className="nav-link navigation-link">|</span>
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
        <li className="mx-5 mx-md-4 nav-item d-none pipe">
          <span className="nav-link navigation-link">|</span>
        </li>
        <li className="mx-5 mx-md-4 nav-item">
          <Link to="/News" className="nav-link navigation-link">News</Link>
        </li>
        <li className="mx-5 mx-md-4 nav-item d-none pipe">
          <span className="nav-link navigation-link">|</span>
        </li>
      </ul>
    </div>

  </nav>
</header>
  );
}
