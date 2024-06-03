import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './styles.css';
import { useAuthService } from "../../../services/auth";

import logo from '../../../img/logo/logo_seul_couleur.png';

export const Header: React.FC = () => {
  const auth = useAuthService();
  const isConnected = auth.isConnected();
  let appUrl = 'https://' + window.location.hostname;

  return (
      <header id="main-header" className='mb-5'>
        <nav className="navbar navbar-expand-md navbar-light bg-light py-0 fixed-top fw-normal" role="navigation">

          <div id="to-home" className="logo d-flex align-items-center navbar-brand text-secondary" style={{ height: '50px' }}>
            <img src={logo} className="d-inline-block align-top" alt="Logo" style={{ height: '100%', width: 'auto' }} />
            <span style={{ marginLeft: '10px' }}>APLOSE</span>
          </div>

          <button className="navbar-toggler mx-sm-4 mr-md-2" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div id="main-nav" className="collapse navbar-collapse justify-content-end align-self-stretch">
            <ul className="navbar-nav text-center">
              <li className="nav-item">
                {isConnected ? (
                    <Link to="/aplose" className="nav-link navigation-link">APLOSE</Link>
                ) : (
                    <Link to="/login" className="nav-link navigation-link">Login</Link>
                )}
              </li>
              <li className="nav-item">
                <a href={appUrl} className="nav-link navigation-link">OSmOSE</a>
              </li>
            </ul>
          </div>

        </nav>
      </header>
  );
}
