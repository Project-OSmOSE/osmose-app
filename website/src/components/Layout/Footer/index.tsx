import React from 'react';
import { SiGithub } from "react-icons/si";
import { IoMailOutline } from "react-icons/io5";
import ifremer from '../../../img/logo/logo_ifremer_blanc_267_250.webp';
import './styles.css';

export const Footer: React.FC = () => (
    <footer>
        <div className="ifremer">
            <p>Powered by</p>
            <img src={ifremer} alt="Ifremer" />
        </div>

        <div className="links">
            <a className="link" href="https://github.com/Project-OSmOSE">
                <SiGithub/>
                Github
            </a>
            <a className="link" href="mailto:contact-osmose@ensta-bretagne.fr" title="Contact OSmOSE">
                <IoMailOutline/>
                contact-osmose@ensta-bretagne.fr
            </a>
        </div>

        <div className="license">
            <p>OSmOSE <a href="/humans.txt" title="Full credits">credits</a>,</p>
            <p>GPL-3.0, 2021</p>
        </div>
    </footer>
);
